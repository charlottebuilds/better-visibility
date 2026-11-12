import { describe, expect, it } from "vitest";
import { isValidLocaleParam, localeParam, seoLinks } from "@/lib/i18n";
import { buildSitemapXml } from "@/lib/sitemap";

const S = "https://better-visibility.com";

describe("Language URLs and hreflang", () => {
  it("accepts /de as an explicit German destination", () => {
    expect(isValidLocaleParam("de")).toBe(true);
    expect(localeParam("de")).toBe("de");
  });

  it.each(["de", "en", "es"] as const)("provides reciprocal alternates for %s", (lang) => {
    const alternates = seoLinks("/", lang).filter((link) => link.rel === "alternate");
    expect(alternates).toEqual([
      { rel: "alternate", hrefLang: "de", href: `${S}/` },
      { rel: "alternate", hrefLang: "en", href: `${S}/en/` },
      { rel: "alternate", hrefLang: "es", href: `${S}/es/` },
      { rel: "alternate", hrefLang: "x-default", href: `${S}/` },
    ]);
  });

  it("points /de and root to the unprefixed German canonical", () => {
    expect(seoLinks("/", "de")[0]?.href).toBe(`${S}/`);
    expect(seoLinks("/", "de", true)[0]?.href).toBe(`${S}/`);
    expect(seoLinks("/impressum", "en")[0]?.href).toBe(`${S}/en/impressum/`);
    expect(seoLinks("/datenschutz", "de", true)[0]?.href).toBe(`${S}/datenschutz/`);
  });
});

describe("Sitemap", () => {
  const posts = [
    { locale: "de", slug: "was-ist-geo", translation_group: "g1" },
    { locale: "en", slug: "what-is-geo", translation_group: "g1" },
    { locale: "en", slug: "only-en", translation_group: "g2" },
    { locale: "de", slug: "fremd", translation_group: "g3", canonical_url: "https://example.com/x" },
  ];
  const xml = buildSitemapXml(posts);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  it("lists the 12 static slash URLs including the blog overviews", () => {
    expect(locs.slice(0, 12)).toEqual([
      `${S}/`, `${S}/en/`, `${S}/es/`,
      `${S}/impressum/`, `${S}/en/impressum/`, `${S}/es/impressum/`,
      `${S}/datenschutz/`, `${S}/en/datenschutz/`, `${S}/es/datenschutz/`,
      `${S}/blog/`, `${S}/en/blog/`, `${S}/es/blog/`,
    ]);
  });

  it("adds published articles with German unprefixed, skipping foreign canonicals", () => {
    expect(locs.slice(12)).toEqual([`${S}/blog/was-ist-geo/`, `${S}/en/blog/what-is-geo/`, `${S}/en/blog/only-en/`]);
    expect(xml).not.toContain(`${S}/de/`);
    expect(xml).not.toContain("fremd");
  });

  it("links only existing translations; x-default only when a German version exists", () => {
    expect(xml).toContain(`hreflang="x-default" href="${S}/blog/was-ist-geo/"`);
    const onlyEn = xml.split("<url>").find((b) => b.includes("<loc>" + S + "/en/blog/only-en/"))!;
    expect(onlyEn.match(/<xhtml:link /g)?.length).toBe(1);
    expect(onlyEn).not.toContain("x-default");
  });

  it("without articles still lists static pages with four alternates each", () => {
    expect(buildSitemapXml().match(/<xhtml:link /g)?.length).toBe(48);
  });
});
