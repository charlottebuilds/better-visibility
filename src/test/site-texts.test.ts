import { describe, expect, it } from "vitest";
import de from "@/locales/de";
import { applyOverrides, flattenTexts, groupOf } from "@/lib/site-texts/core";

describe("site texts", () => {
  it("applies an override to a nested string without touching the default dict", () => {
    const out = applyOverrides(de, { "hero.p": "Neu" });
    expect(out.hero.p).toBe("Neu");
    expect(de.hero.p).not.toBe("Neu");
  });
  it("ignores unknown paths and non-string targets", () => {
    const out = applyOverrides(de, { "nope.x": "a", hero: "b" });
    expect(out.hero).toEqual(de.hero);
  });
  it("offers imprint and privacy texts as their own pages", () => {
    const paths = flattenTexts(de).map((l) => l.path);
    expect(paths.some((p) => groupOf(p) === "impressum")).toBe(true);
    expect(paths.some((p) => groupOf(p) === "datenschutz")).toBe(true);
    expect(groupOf("hero.p")).toBe("startseite");
  });
  it("does not expose locale codes as editable text", () => {
    expect(flattenTexts(de).some((l) => l.path === "blogPage.dateLocale")).toBe(false);
  });
});
