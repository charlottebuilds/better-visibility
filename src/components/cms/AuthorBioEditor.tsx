import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { saveSiteTexts } from "@/lib/site-texts/site-texts.functions";
import { siteTextsQuery } from "@/lib/site-texts/query";
import de from "@/locales/de";
import en from "@/locales/en";
import es from "@/locales/es";
import { Button } from "@/components/ui/button";

const PATH = "blogPage.authorBio";
const DEFAULTS = { de: de.blogPage.authorBio, en: en.blogPage.authorBio, es: es.blogPage.authorBio };
type Loc = keyof typeof DEFAULTS;
const NAMES: Record<Loc, string> = { de: "Deutsch", en: "Englisch", es: "Spanisch" };

/** Edits the author box text under blog articles; stored as a site-text override. */
export function AuthorBioEditor() {
  const save = useServerFn(saveSiteTexts);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: texts } = useQuery(siteTextsQuery);
  const [locale, setLocale] = useState<Loc>("de");
  const [value, setValue] = useState("");
  const [translate, setTranslate] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const current = texts?.[locale]?.[PATH] ?? DEFAULTS[locale];
  useEffect(() => setValue(current), [current]);
  async function onSave() {
    setBusy(true);
    setMessage("");
    try {
      const r = await save({ data: { locale, changes: { [PATH]: value }, translate: locale === "de" && translate } });
      await queryClient.invalidateQueries({ queryKey: ["site-texts"] });
      await router.invalidate();
      setMessage(r.translated ? "Gespeichert und auf Englisch & Spanisch übersetzt." : "Gespeichert.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mt-12 max-w-2xl border-t border-border pt-8">
      <h2 className="text-xl font-bold">Autorinnen-Box</h2>
      <p className="mt-2 text-sm text-muted-foreground">Dieser Text steht unter jedem Blogbeitrag neben deinem Foto.</p>
      <div className="mt-4 flex gap-1">
        {(Object.keys(NAMES) as Loc[]).map((l) => (
          <Button key={l} type="button" size="sm" variant={l === locale ? "secondary" : "ghost"} onClick={() => { setLocale(l); setMessage(""); }}>
            {NAMES[l]}
          </Button>
        ))}
      </div>
      <textarea aria-label="Text der Autorinnen-Box" className="cms-input mt-3 min-h-28 w-full" maxLength={600} value={value} onChange={(e) => setValue(e.target.value)} />
      {locale === "de" && (
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={translate} onChange={(e) => setTranslate(e.target.checked)} />
          Englisch und Spanisch automatisch mitübersetzen
        </label>
      )}
      <Button type="button" className="mt-4" disabled={busy || !value.trim() || value === current} onClick={onSave}>
        {busy ? "Speichere …" : "Text speichern"}
      </Button>
      {message && <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>}
    </section>
  );
}
