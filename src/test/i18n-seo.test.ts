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
  const xml = buildSitemapXml();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  it("lists exactly the 9 canonical slash URLs", () => {
    expect(locs).toEqual([
      `${S}/`, `${S}/en/`, `${S}/es/`,
      `${S}/impressum/`, `${S}/en/impressum/`, `${S}/es/impressum/`,
      `${S}/datenschutz/`, `${S}/en/datenschutz/`, `${S}/es/datenschutz/`,
    ]);
  });

  it("excludes /de and blog URLs", () => {
    expect(xml).not.toContain(`${S}/de`);
    expect(xml).not.toContain("/blog");
  });

  it("gives every URL four hreflang alternates", () => {
    expect(xml.match(/<xhtml:link /g)?.length).toBe(36);
  });
});
