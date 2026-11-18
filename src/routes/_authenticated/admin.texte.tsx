import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Loader2, RotateCcw, Save, Search } from "lucide-react";
import de from "@/locales/de";
import en from "@/locales/en";
import es from "@/locales/es";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { flattenTexts, groupOf, OTHER_GROUP, PAGE_GROUPS } from "@/lib/site-texts/core";
import { siteTextsQuery } from "@/lib/site-texts/query";
import { resetSiteText, saveSiteTexts } from "@/lib/site-texts/site-texts.functions";

export const Route = createFileRoute("/_authenticated/admin/texte")({
  head: () => ({
    meta: [
      { title: "Seitentexte – Better Visibility CMS" },
      { name: "description", content: "Texte aller Website-Seiten bearbeiten und automatisch übersetzen." },
      { property: "og:title", content: "Seitentexte – Better Visibility CMS" },
      { property: "og:description", content: "Texte aller Website-Seiten bearbeiten und automatisch übersetzen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SiteTextsEditor,
});

type Loc = "de" | "en" | "es";
const DEFAULTS = { de, en, es };
const LOC_LABEL: Record<Loc, string> = { de: "Deutsch", en: "English", es: "Español" };
const GROUPS = [...PAGE_GROUPS, OTHER_GROUP];

function SiteTextsEditor() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const save = useServerFn(saveSiteTexts);
  const reset = useServerFn(resetSiteText);
  const { data: texts } = useQuery(siteTextsQuery);
  const [locale, setLocale] = useState<Loc>("de");
  const [group, setGroup] = useState("startseite");
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [translate, setTranslate] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const defaults = useMemo(() => new Map(flattenTexts(DEFAULTS[locale]).map((l) => [l.path, l.value])), [locale]);
  const leaves = useMemo(() => flattenTexts(de).filter((l) => groupOf(l.path) === group || search), [group, search]);
  const q = search.trim().toLowerCase();
  const current = (path: string) => texts?.[locale]?.[path] ?? defaults.get(path) ?? "";
  const visible = leaves.filter((l) => !q || l.path.toLowerCase().includes(q) || current(l.path).toLowerCase().includes(q));
  const dirty = Object.keys(edits).length;

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["site-texts"] });
    await router.invalidate();
  }
  function switchLocale(l: Loc) {
    if (dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    setEdits({}); setLocale(l); setMessage(null);
  }
  async function onSave() {
    setBusy(true); setMessage(null);
    try {
      const r = await save({ data: { locale, changes: edits, translate } });
      setEdits({});
      await refresh();
      setMessage({ ok: true, text: r.translated ? `${r.saved} Text(e) gespeichert und auf Englisch & Spanisch übersetzt.` : `${r.saved} Text(e) gespeichert.` });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Speichern fehlgeschlagen." });
    } finally { setBusy(false); }
  }
  async function onReset(path: string) {
    const all = locale === "de" && confirm("Auch die englische und spanische Fassung auf den Standard zurücksetzen?");
    setBusy(true);
    try {
      await reset({ data: { path, allLocales: all, locale } });
      setEdits(({ [path]: _, ...rest }) => rest);
      await refresh();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Zurücksetzen fehlgeschlagen." });
    } finally { setBusy(false); }
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Seitentexte</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Bearbeiten Sie die Texte aller Seiten. Änderungen auf Deutsch werden beim Speichern automatisch ins Englische und Spanische übersetzt; die Übersetzungen können Sie anschließend in der jeweiligen Sprache nachbessern.
      </p>
      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Sprache">
        {(Object.keys(LOC_LABEL) as Loc[]).map((l) => (
          <Button key={l} role="tab" aria-selected={locale === l} variant={locale === l ? "default" : "outline"} onClick={() => switchLocale(l)}>
            {LOC_LABEL[l]}
          </Button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select aria-label="Seite" value={group} onChange={(e) => setGroup(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
        </select>
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Texte durchsuchen" placeholder="In allen Seiten suchen …" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="sticky top-0 z-10 mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-3">
        <Button onClick={onSave} disabled={!dirty || busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Save />}
          {busy && locale === "de" && translate ? "Speichert & übersetzt …" : `Speichern${dirty ? ` (${dirty})` : ""}`}
        </Button>
        {locale === "de" && (
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={translate} onCheckedChange={setTranslate} />
            Englisch & Spanisch automatisch übersetzen
          </label>
        )}
        {message && <p role="status" className={message.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>{message.text}</p>}
      </div>

      <div className="mt-6 space-y-4">
        {visible.length === 0 && <p className="text-muted-foreground">Keine Texte gefunden.</p>}
        {visible.map(({ path }) => {
          const value = edits[path] ?? current(path);
          const overridden = texts?.[locale]?.[path] !== undefined;
          return (
            <div key={path} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <label htmlFor={`t-${path}`} className="font-mono text-xs text-muted-foreground">
                  {path.split(".").join(" › ")}
                  {overridden && <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 font-sans text-primary">bearbeitet</span>}
                </label>
                {overridden && (
                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => onReset(path)}>
                    <RotateCcw /> Standard
                  </Button>
                )}
              </div>
              <Textarea
                id={`t-${path}`}
                value={value}
                rows={Math.min(12, Math.max(1, Math.ceil(value.length / 90) + (value.match(/\n/g)?.length ?? 0)))}
                onChange={(e) => {
                  const v = e.target.value;
                  setEdits((prev) => {
                    const next = { ...prev };
                    if (v === current(path)) delete next[path]; else next[path] = v;
                    return next;
                  });
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
