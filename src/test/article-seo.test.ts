import { describe, expect, it } from "vitest";
import { enhanceArticle, extractFaq, readingMinutes, relatedPosts } from "@/lib/cms/article-seo";

describe("article SEO helpers", () => {
  it("extracts FAQ pairs from the FAQ block", () => {
    const html = '<p>x</p><div data-type="faq"><h2>FAQ</h2><h3>Was ist GEO?</h3><p>Optimierung für KI.</p><h3>Leer?</h3></div>';
    expect(extractFaq(html)).toEqual([{ q: "Was ist GEO?", a: "Optimierung für KI." }]);
  });
  it("anchors headings and links footnotes only to existing sources", () => {
    const html = '<h2>Größe & Mehr</h2><p>Fakt [1] und [3]</p><div data-type="sources"><h3>Quellen</h3><ol><li><p>A</p></li></ol></div>';
    const r = enhanceArticle(html);
    expect(r.toc[0]).toEqual({ id: "groesse-mehr", text: "Größe & Mehr", level: 2 });
    expect(r.html).toContain('href="#quelle-1"');
    expect(r.html).toContain('<li id="quelle-1">');
    expect(r.html).toContain("[3]</p>");
  });
  it("uses 200 words per minute, minimum one", () => {
    expect(readingMinutes(0)).toBe(1);
    expect(readingMinutes(401)).toBe(3);
  });
  it("relates at most three same-language posts, shared categories first", () => {
    const mk = (id: string, locale: string, c: string[], d: string) => ({ id, locale, category_ids: c, published_at: d });
    const me = mk("a", "de", ["x"], "2026-01-01");
    const all = [me, mk("b", "de", [], "2026-05-01"), mk("c", "de", ["x"], "2026-02-01"), mk("d", "en", ["x"], "2026-03-01"), mk("e", "de", [], "2026-04-01"), mk("f", "de", [], "2026-03-01")];
    expect(relatedPosts(me, all).map((p) => p.id)).toEqual(["c", "b", "e"]);
  });
});
