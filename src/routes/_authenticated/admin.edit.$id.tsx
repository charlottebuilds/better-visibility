import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminData, uploadImage } from "@/lib/cms/browser";
import { savePost, restoreRevision } from "@/lib/cms/admin.functions";
import { translatePost } from "@/lib/cms/translate.functions";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { emptyPost, slugify, mediaUrl, type CmsPost, type PublicPost } from "@/lib/cms/types";
import { RichEditor } from "@/components/cms/RichEditor";
import { Article } from "@/components/cms/Article";
import { Button } from "@/components/ui/button";
import { Save, Eye, Send, ImagePlus, X, History, Languages, Loader2 } from "lucide-react";
export const Route = createFileRoute("/_authenticated/admin/edit/$id")({
  head: () => ({
    meta: [
      { title: "Beitrag bearbeiten – Better Visibility CMS" },
      { name: "description", content: "Texte, Übersetzungen und SEO-Einstellungen bearbeiten." },
      { property: "og:title", content: "Beitrag bearbeiten – Better Visibility CMS" },
      {
        property: "og:description",
        content: "Texte, Übersetzungen und SEO-Einstellungen bearbeiten.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Edit,
});
function Edit() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, error } = useQuery({
    queryKey: ["cms-post", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });
  const { data: all } = useQuery({ queryKey: ["cms-admin"], queryFn: adminData });
  const [post, setPost] = useState<CmsPost | null>(null);
  const [status, setStatus] = useState("Gespeichert");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [tab, setTab] = useState("info");
  const [busy, setBusy] = useState(false);
  const [revisionPreview, setRevisionPreview] = useState<PublicPost | null>(null);
  const saved = useRef("");
  const latest = useRef<CmsPost | null>(null);
  const lock = useRef(false);
  const translateFn = useServerFn(translatePost);
  const [translating, setTranslating] = useState(false);
  const [dialog, setDialog] = useState<
    { kind: "new"; locale: "en" | "es" | "de" } | { kind: "overwrite"; locale: "en" | "es" | "de" } | null
  >(null);
  const { data: revisions } = useQuery({
    queryKey: ["cms-revisions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_revisions")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  useEffect(() => {
    if (data && data.id === id) {
      setPost(data);
      latest.current = data;
      saved.current = JSON.stringify(data);
      setPreviewImage("");
      if (data.cover_path)
        void supabase.storage
          .from("blog-media")
          .createSignedUrl(data.cover_path, 3600)
          .then(({ data }) => setPreviewImage(data?.signedUrl ?? ""));
    }
  }, [data, id]);
  function change<K extends keyof CmsPost>(key: K, value: CmsPost[K]) {
    setPost((previous) => {
      if (!previous) return previous;
      const next = { ...previous, [key]: value };
      latest.current = next;
      return next;
    });
    setStatus("Ungespeicherte Änderungen");
  }
  async function persist(action: "save" | "publish" | "schedule" | "unpublish" = "save") {
    const current = latest.current;
    if (!current || lock.current) return;
    lock.current = true;
    setBusy(true);
    setStatus("Wird gespeichert …");
    try {
      const result = await savePost({ data: { post: current, action } });
      saved.current = JSON.stringify(result);
      if (latest.current === current) {
        setPost(result);
        latest.current = result;
      }
      setStatus("Gespeichert");
      setMessage(
        action === "publish"
          ? "Beitrag veröffentlicht."
          : action === "schedule"
            ? "Veröffentlichung geplant."
            : action === "unpublish"
              ? "Veröffentlichung aufgehoben."
              : "",
      );
      await queryClient.invalidateQueries({ queryKey: ["cms-admin"] });
      await queryClient.invalidateQueries({ queryKey: ["cms-revisions", id] });
    } catch (e) {
      setStatus("Speicherfehler");
      setMessage(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  useEffect(() => {
    const timer = setInterval(() => {
      if (latest.current && JSON.stringify(latest.current) !== saved.current) void persist("save");
    }, 5000);
    const unload = (e: BeforeUnloadEvent) => {
      if (latest.current && JSON.stringify(latest.current) !== saved.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", unload);
    return () => {
      clearInterval(timer);
      window.removeEventListener("beforeunload", unload);
    };
  }, [id]);
  async function createEmpty(locale: "en" | "es" | "de") {
    setDialog(null);
    const current = latest.current;
    if (!current) return;
    try {
      const created = await savePost({
        data: { post: { ...emptyPost(locale, current.translation_group), author: current.author }, action: "save" },
      });
      await queryClient.invalidateQueries({ queryKey: ["cms-admin"] });
      await navigate({ to: "/admin/edit/$id/", params: { id: created.id } });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Fehler");
    }
  }
  async function runTranslation(locale: "en" | "es" | "de", overwrite: boolean) {
    setDialog(null);
    const current = latest.current;
    if (!current) return;
    const group = (all?.posts ?? []).filter((p) => p.translation_group === current.translation_group);
    const source = current.locale === "de" ? current : group.find((p) => p.locale === "de");
    if (!source) {
      setMessage("Kein deutsches Original gefunden.");
      return;
    }
    if (current.locale === "de") await persist("save");
    setTranslating(true);
    setMessage("");
    try {
      const result = await translateFn({ data: { sourceId: source.id, locale, overwrite } });
      await queryClient.invalidateQueries({ queryKey: ["cms-admin"] });
      if (result.status === "exists") {
        setMessage("Diese Sprachversion existiert bereits; sie wurde nicht überschrieben.");
        await navigate({ to: "/admin/edit/$id/", params: { id: result.id } });
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["cms-post", result.id] });
      await queryClient.invalidateQueries({ queryKey: ["cms-revisions", result.id] });
      if (result.id === current.id) {
        saved.current = "";
        latest.current = null;
      }
      setMessage(overwrite ? "Neu übersetzt und als Arbeitsstand gespeichert (nicht veröffentlicht)." : "Übersetzung als Entwurf gespeichert (nicht veröffentlicht).");
      await navigate({ to: "/admin/edit/$id/", params: { id: result.id } });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Übersetzung fehlgeschlagen. Nichts wurde gespeichert.");
    } finally {
      setTranslating(false);
    }
  }
  if (error) return <p role="alert">{error.message}</p>;
  if (!post || post.id !== id || !data || data.id !== id) return <p>Beitrag wird geladen …</p>;
  const categories = all?.categories ?? [];
  const translations = (all?.posts ?? []).filter(
    (p) => p.translation_group === post.translation_group,
  );
  const field = (
    label: string,
    key:
      | "author"
      | "slug"
      | "excerpt"
      | "cover_alt"
      | "meta_title"
      | "meta_description"
      | "canonical_url",
  ) => (
    <label className="cms-label">
      {label}
      {key === "excerpt" || key === "meta_description" ? (
        <textarea
          className="cms-input min-h-24 w-full"
          value={post[key]}
          onChange={(e) => change(key, e.target.value)}
        />
      ) : (
        <input
          className="cms-input w-full"
          value={post[key]}
          onChange={(e) => change(key, e.target.value)}
        />
      )}
    </label>
  );
  const localDate = (value: string | null) =>
    value
      ? new Date(Date.parse(value) - new Date(value).getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : "";
  const dateField = (label: string, key: "published_at" | "updated_at" | "scheduled_at") => (
    <label className="cms-label">
      {label}
      <input
        type="datetime-local"
        className="cms-input w-full"
        value={localDate(post[key])}
        onChange={(e) =>
          change(key, e.target.value ? new Date(e.target.value).toISOString() : null)
        }
      />
    </label>
  );
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Beitrag bearbeiten</h1>
          <p role="status" className="mt-2 text-xs text-muted-foreground">
            {status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPreview(true)}>
            <Eye />
            Vorschau
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => persist("save")}>
            <Save />
            Speichern
          </Button>
          <Button disabled={busy} onClick={() => persist("publish")}>
            <Send />
            {post.published_snapshot ? "Änderungen veröffentlichen" : "Veröffentlichen"}
          </Button>
        </div>
      </div>
      {message && (
        <p role="alert" className="mt-4 text-sm text-accent">
          {message}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        {(["de", "en", "es"] as const).map((locale) => (
          <Button
            key={locale}
            size="sm"
            variant={locale === post.locale ? "secondary" : "ghost"}
            disabled={busy || translating}
            onClick={async () => {
              if (locale === post.locale) return;
              await persist("save");
              if (status === "Speicherfehler") return;
              const found = translations.find((p) => p.locale === locale);
              if (found) await navigate({ to: "/admin/edit/$id/", params: { id: found.id } });
              else setDialog({ kind: "new", locale });
            }}
          >
            {locale.toUpperCase()}
            {translations.some((p) => p.locale === locale) ? "" : " +"}
          </Button>
        ))}
        {post.locale !== "de" && translations.some((p) => p.locale === "de") && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy || translating}
            onClick={() => setDialog({ kind: "overwrite", locale: post.locale as "en" | "es" })}
          >
            <Languages />
            Aus Original neu übersetzen
          </Button>
        )}
      </div>
      {translating && (
        <p role="status" className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Übersetzung wird generiert und validiert …
        </p>
      )}
      <AlertDialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialog?.kind === "overwrite"
                ? "Arbeitsstand neu übersetzen?"
                : `${dialog?.locale.toUpperCase()}-Version anlegen`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialog?.kind === "overwrite"
                ? "Der aktuelle Arbeitsstand dieser Sprachversion wird durch eine neue Übersetzung des deutschen Originals ersetzt. Er wird vorher in der Versionshistorie gesichert. Eine veröffentlichte Fassung bleibt unverändert, bis du erneut veröffentlichst."
                : "Möchtest du einen leeren Entwurf anlegen oder das deutsche Original automatisch übersetzen lassen? Die Übersetzung wird als Entwurf gespeichert und nicht veröffentlicht."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            {dialog?.kind === "new" && (
              <Button variant="outline" onClick={() => dialog && void createEmpty(dialog.locale)}>
                Leeren Entwurf anlegen
              </Button>
            )}
            <AlertDialogAction onClick={() => dialog && void runTranslation(dialog.locale, dialog.kind === "overwrite")}>
              {dialog?.kind === "overwrite" ? "Neu übersetzen" : "Automatisch übersetzen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="mt-6 grid gap-7 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <label className="cms-label">
            Beitragstitel · H1
            <input
              aria-label="Beitragstitel"
              className="cms-input w-full font-display text-2xl font-bold"
              value={post.title}
              onChange={(e) => change("title", e.target.value)}
            />
          </label>
          <div className="mt-5">
            <RichEditor
              key={id}
              content={post.content}
              onChange={(html) => change("content", html)}
              posts={all?.posts ?? []}
            />
          </div>
        </div>
        <aside className="min-w-0">
          <div className="flex border-b border-border">
            {[
              ["info", "Beitrag"],
              ["seo", "SEO"],
              ["history", "Versionen"],
            ].map(([key, label]) => (
              <Button
                key={key}
                size="sm"
                variant={tab === key ? "secondary" : "ghost"}
                onClick={() => setTab(key ?? "info")}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="mt-5 space-y-5">
            {tab === "info" ? (
              <>
                {field("Autor", "author")}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={post.show_author}
                    onChange={(e) => change("show_author", e.target.checked)}
                  />
                  Autor anzeigen
                </label>
                {field("Textauszug", "excerpt")}
                <div>
                  <p className="cms-label">Titelbild</p>
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt={post.cover_alt}
                      className="mb-3 aspect-video w-full rounded-lg object-cover"
                    />
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
                    <ImagePlus className="h-4 w-4" />
                    Bild hochladen
                    <input
                      className="sr-only"
                      type="file"
                      aria-label="Titelbild hochladen"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setBusy(true);
                        try {
                          const uploaded = await uploadImage(file);
                          change("cover_path", uploaded.path);
                          setPreviewImage(uploaded.preview);
                        } catch (e) {
                          setMessage(e instanceof Error ? e.message : "Upload fehlgeschlagen.");
                        } finally {
                          setBusy(false);
                        }
                      }}
                    />
                  </label>
                  {post.cover_path && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        change("cover_path", null);
                        setPreviewImage("");
                      }}
                    >
                      <X />
                      Entfernen
                    </Button>
                  )}
                </div>
                {field("Titelbild ALT-Text", "cover_alt")}
                <fieldset>
                  <legend className="cms-label">Kategorien</legend>
                  <div className="grid gap-2">
                    {categories
                      .filter((c) => c.active || post.category_ids.includes(c.id))
                      .map((c) => (
                        <label key={c.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={post.category_ids.includes(c.id)}
                            onChange={(e) =>
                              change(
                                "category_ids",
                                e.target.checked
                                  ? [...post.category_ids, c.id]
                                  : post.category_ids.filter((id) => id !== c.id),
                              )
                            }
                          />
                          {c.name}
                        </label>
                      ))}
                  </div>
                </fieldset>
                {dateField("Veröffentlichungsdatum", "published_at")}
                {post.original_published_at && (
                  <p className="text-xs text-muted-foreground">
                    Erstveröffentlichung:{" "}
                    {new Date(post.original_published_at).toLocaleString("de-DE")}
                  </p>
                )}
                {dateField("Updatedatum", "updated_at")}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={post.show_updated}
                    onChange={(e) => change("show_updated", e.target.checked)}
                  />
                  Updatedatum anzeigen
                </label>
                {dateField("Veröffentlichung planen (lokale Uhrzeit)", "scheduled_at")}
                <Button variant="outline" disabled={busy} onClick={() => persist("schedule")}>
                  Veröffentlichung planen
                </Button>
                {post.published_snapshot && (
                  <Button
                    variant="ghost"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm("Veröffentlichung aufheben?")) void persist("unpublish");
                    }}
                  >
                    Veröffentlichung aufheben
                  </Button>
                )}
              </>
            ) : tab === "seo" ? (
              <>
                {field("URL / Slug", "slug")}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => change("slug", slugify(post.title) || post.slug)}
                >
                  Aus Titel übernehmen
                </Button>
                <p className="break-all text-xs text-muted-foreground">
                  better-visibility.com/{post.locale}/blog/{post.slug}
                </p>
                {field("Meta-Title", "meta_title")}
                {field("Meta-Description", "meta_description")}
                <p className="text-xs text-muted-foreground">
                  {post.meta_description.length} Zeichen
                </p>
                {field("Canonical-URL (optional)", "canonical_url")}
                <div className="border-t border-border pt-5">
                  <p className="text-xs text-muted-foreground">Suchvorschau</p>
                  <p className="mt-3 break-all text-xs">
                    better-visibility.com › {post.locale} › blog
                  </p>
                  <p className="mt-1 text-lg text-accent">{post.meta_title || post.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {post.meta_description || post.excerpt}
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <History className="h-4 w-4" />
                  Änderungshistorie
                </h2>
                {revisions?.map((r, i) => (
                  <div key={r.id} className="border-b border-border pb-4">
                    <p className="text-sm">
                      Version {revisions.length - i} ·{" "}
                      {new Date(r.created_at).toLocaleString("de-DE")}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRevisionPreview(r.snapshot as unknown as PublicPost)}
                      >
                        Ansehen
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          if (!window.confirm("Diese Version als Arbeitsentwurf wiederherstellen?"))
                            return;
                          try {
                            const restored = await restoreRevision({ data: { id: r.id } });
                            setPost(restored);
                            latest.current = restored;
                            saved.current = JSON.stringify(restored);
                            setMessage(
                              "Version wiederhergestellt. Zum Aktualisieren bitte veröffentlichen.",
                            );
                          } catch (e) {
                            setMessage(e instanceof Error ? e.message : "Fehler");
                          }
                        }}
                      >
                        Wiederherstellen
                      </Button>
                    </div>
                  </div>
                ))}
                {!revisions?.length && (
                  <p className="text-sm text-muted-foreground">
                    Noch keine früheren Veröffentlichungen.
                  </p>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
      {(preview || revisionPreview) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Beitragsvorschau"
          className="cms-dialog-backdrop"
        >
          <div className="cms-preview">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
              <h2 className="font-bold">{revisionPreview ? "Frühere Version" : "Vorschau"}</h2>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Vorschau schließen"
                onClick={() => {
                  setPreview(false);
                  setRevisionPreview(null);
                }}
              >
                <X />
              </Button>
            </div>
            <Article
              post={(revisionPreview ?? post) as PublicPost}
              categories={categories}
              previewImage={previewImage}
            />
          </div>
        </div>
      )}
    </>
  );
}
