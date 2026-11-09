import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { analyzeSeoGeo } from "@/lib/cms/seo-ai.functions";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/ki-optimierung")({
  head: () => ({
    meta: [
      { title: "KI SEO/GEO-Optimierung – Better Visibility CMS" },
      { name: "description", content: "Blogtexte mit KI auf SEO und GEO prüfen." },
      { property: "og:title", content: "KI SEO/GEO-Optimierung – Better Visibility CMS" },
      { property: "og:description", content: "Blogtexte mit KI auf SEO und GEO prüfen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SeoAi,
});

function SeoAi() {
  const analyze = useServerFn(analyzeSeoGeo);
  const [text, setText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function run(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await analyze({ data: { text, keyword } });
      setResult(r.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyse fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <h1 className="text-3xl font-bold">KI SEO/GEO-Optimierung</h1>
      <p className="mt-2 text-muted-foreground">
        Text eines Beitrags einfügen und konkrete Optimierungen für Google und KI-Suchen erhalten.
      </p>
      <form onSubmit={run} className="mt-6 space-y-4">
        <label className="cms-label">
          Fokus-Keyword (optional)
          <input className="cms-input w-full" value={keyword} maxLength={120} onChange={(e) => setKeyword(e.target.value)} />
        </label>
        <label className="cms-label">
          Beitragstext
          <textarea
            className="cms-input min-h-72 w-full"
            required
            minLength={100}
            maxLength={60000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <Button type="submit" disabled={busy || text.trim().length < 100}>
          <Sparkles />
          {busy ? "Analysiere … (bis zu 1 Minute)" : "Optimierungen erstellen"}
        </Button>
      </form>
      {error && <p role="alert" className="mt-6 text-sm text-destructive">{error}</p>}
      {result && (
        <section className="mt-8 rounded-lg border border-border bg-card p-6">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{result}</pre>
        </section>
      )}
    </>
  );
}
