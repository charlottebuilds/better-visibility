import { describe, expect, it } from "vitest";
import { isValidLocaleParam, localeParam, seoLinks } from "@/lib/i18n";

describe("Language URLs and hreflang", () => {
  it("accepts /de as an explicit German destination", () => {
    expect(isValidLocaleParam("de")).toBe(true);
    expect(localeParam("de")).toBe("de");
  });

  it.each(["de", "en", "es"] as const)("provides reciprocal alternates for %s", (lang) => {
    const alternates = seoLinks("/", lang, true).filter((link) => link.rel === "alternate");
    expect(alternates).toEqual([
      { rel: "alternate", hrefLang: "de", href: "https://better-visibility.com/de" },
      { rel: "alternate", hrefLang: "en", href: "https://better-visibility.com/en" },
      { rel: "alternate", hrefLang: "es", href: "https://better-visibility.com/es" },
      { rel: "alternate", hrefLang: "x-default", href: "https://better-visibility.com/" },
    ]);
  });

  it("keeps canonicals self-referencing on root and explicit German pages", () => {
    expect(seoLinks("/", "de")[0]?.href).toBe("https://better-visibility.com/");
    expect(seoLinks("/", "de", true)[0]?.href).toBe("https://better-visibility.com/de");
    expect(seoLinks("/blog", "de", true)[0]?.href).toBe("https://better-visibility.com/de/blog");
  });

  it("uses the unprefixed matching page as the subpage fallback", () => {
    expect(seoLinks("/blog", "en").at(-1)?.href).toBe("https://better-visibility.com/blog");
  });
});