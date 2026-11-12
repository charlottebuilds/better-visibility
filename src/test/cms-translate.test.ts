import { describe, it, expect } from "vitest";
import { mapHref, mapInternalLinks, validateTranslatedHtml, type LinkContext } from "@/lib/cms/translate-html";

const ctx: LinkContext = {
  sourceLocale: "de", targetLocale: "en", siteHosts: ["better-visibility.com"],
  published: [
    { locale: "de", slug: "was-ist-geo", translation_group: "g1" },
    { locale: "en", slug: "what-is-geo", translation_group: "g1" },
    { locale: "de", slug: "seo-grundlagen-2026", translation_group: "g2" },
  ],
};
const src = `<h2>Was ist GEO?</h2><p>In 2026 nutzen 58 % <a href="/blog/was-ist-geo/">mehr</a>.</p><figure><img src="/api/public/blog-media?path=a.jpg" alt="Grafik"><figcaption>Quelle</figcaption></figure><ul><li>Eins</li></ul>`;
const good = `<h2>What is GEO?</h2><p>In 2026, 58% <a href="/blog/was-ist-geo/">more</a>.</p><figure><img src="/api/public/blog-media?path=a.jpg" alt="Chart"><figcaption>Source</figcaption></figure><ul><li>One</li></ul>`;

describe("translation HTML validation", () => {
  it("accepts a faithful translation", () => expect(validateTranslatedHtml(src, good)).toEqual([]));
  it("rejects a removed list item", () =>
    expect(validateTranslatedHtml(src, good.replace("<ul><li>One</li></ul>", ""))).toContain("structure"));
  it("rejects a changed link target even with the same link count", () =>
    expect(validateTranslatedHtml(src, good.replace('href="/blog/was-ist-geo/"', 'href="/blog/other/"'))).toContain("attributes"));
  it("rejects a changed image source", () =>
    expect(validateTranslatedHtml(src, good.replace("path=a.jpg", "path=b.jpg"))).toContain("attributes"));
  it("rejects a dropped image alt text", () =>
    expect(validateTranslatedHtml(src, good.replace('alt="Chart"', 'alt=""'))).toContain("attributes"));
  it("rejects swapped element nesting", () =>
    expect(validateTranslatedHtml(src, good.replace("<p>In 2026, 58% <a", "<p><strong>In 2026, 58%</strong> <a"))).toContain("structure"));
  it("rejects changed numbers", () =>
    expect(validateTranslatedHtml(src, good.replace("58%", "60%"))).toContain("numbers"));
  it("rejects an emptied paragraph", () =>
    expect(validateTranslatedHtml(src, good.replace("<li>One</li>", "<li></li>"))).toContain("text_missing"));
  it("rejects empty output", () => expect(validateTranslatedHtml(src, "<p></p>")).toEqual(["empty"]));
});

describe("internal link mapping", () => {
  it("maps a German blog link to the existing English translation", () =>
    expect(mapHref("/blog/was-ist-geo/", ctx)).toBe("/en/blog/what-is-geo/"));
  it("keeps a blog link without published translation unchanged", () =>
    expect(mapHref("/blog/seo-grundlagen-2026/", ctx)).toBe("/blog/seo-grundlagen-2026/"));
  it("maps static pages without blindly prefixing", () => {
    expect(mapHref("/impressum/", ctx)).toBe("/en/impressum/");
    expect(mapHref("/", ctx)).toBe("/en/");
    expect(mapHref("/#leistungen", ctx)).toBe("/en/#leistungen");
  });
  it("keeps anchors, relative, external and foreign-language links", () => {
    for (const h of ["#faq", "kontakt/", "https://example.com/blog/was-ist-geo/", "/es/blog/que-es-geo/", "mailto:a@b.de", "/unbekannt/seite/"])
      expect(mapHref(h, ctx)).toBe(h);
  });
  it("maps absolute own-domain links and keeps the host", () =>
    expect(mapHref("https://better-visibility.com/blog/was-ist-geo/?x=1#a", ctx)).toBe("https://better-visibility.com/en/blog/what-is-geo/?x=1#a"));
  it("rewrites only href attributes inside content", () =>
    expect(mapInternalLinks('<p><a href="/blog/was-ist-geo/">x</a> /blog/was-ist-geo/</p>', ctx))
      .toBe('<p><a href="/en/blog/what-is-geo/">x</a> /blog/was-ist-geo/</p>'));
});
