import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { readingMinutes, seoChecks, wordCount } from "@/lib/cms/article-seo";
import type { CmsPost } from "@/lib/cms/types";

/** Live SEO/GEO checklist; the focus keyword is remembered per article in this browser. */
export function SeoPanel({ post }: { post: CmsPost }) {
  const key = `cms-focus-keyword:${post.id}`;
  const [keyword, setKeyword] = useState("");
  useEffect(() => setKeyword(window.localStorage.getItem(key) ?? ""), [key]);
  const checks = seoChecks(post, keyword);
  const ok = checks.filter((c) => c.ok).length;
  const score = Math.round((ok / checks.length) * 100);
  const tone = score >= 80 ? "bg-primary" : score >= 50 ? "bg-accent" : "bg-destructive";
  const words = wordCount(post.content);
  return (
    <div className="border-t border-border pt-5">
      <label className="cms-label">
        Fokus-Keyword
        <input
          className="cms-input w-full"
          value={keyword}
          maxLength={120}
          onChange={(e) => {
            setKeyword(e.target.value);
            window.localStorage.setItem(key, e.target.value);
          }}
        />
      </label>
      <p className="mt-3 text-xs text-muted-foreground">
        {words.toLocaleString("de-DE")} Wörter · ca. {readingMinutes(words)} Min. Lesezeit
      </p>
      <div className="mt-4 flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${tone}`} aria-hidden />
        <p className="text-sm font-semibold">SEO/GEO-Check: {ok} von {checks.length} erfüllt</p>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {checks.map((c) => (
          <li key={c.label} className={`flex gap-2 ${c.ok ? "" : "text-muted-foreground"}`}>
            {c.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0" />}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
