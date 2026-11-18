/** Pure helpers for dashboard-editable site texts. Locale files stay the defaults;
 * database rows only override individual string leaves by dotted path (e.g. "hero.p", "faq.0.a"). */
export type Overrides = Record<string, string>;
export type SiteTexts = { de: Overrides; en: Overrides; es: Overrides };
export const emptyTexts = (): SiteTexts => ({ de: {}, en: {}, es: {} });

const NON_TEXT_KEYS = new Set(["dateLocale"]);
const NON_TEXT_VALUE = /^(https?:|mailto:|tel:|\/|#)/;

export type Leaf = { path: string; value: string };
export function flattenTexts(obj: unknown, prefix = ""): Leaf[] {
  if (typeof obj === "string") {
    const key = prefix.split(".").pop() ?? "";
    if (NON_TEXT_KEYS.has(key) || NON_TEXT_VALUE.test(obj)) return [];
    return [{ path: prefix, value: obj }];
  }
  if (obj && typeof obj === "object")
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
      flattenTexts(v, prefix ? `${prefix}.${k}` : k),
    );
  return [];
}

/** Returns a copy of `base` with overrides applied; unknown paths or non-string targets are ignored. */
export function applyOverrides<T>(base: T, overrides: Overrides | undefined): T {
  const entries = Object.entries(overrides ?? {});
  if (!entries.length) return base;
  const out = structuredClone(base) as Record<string, unknown>;
  for (const [path, value] of entries) {
    const parts = path.split(".");
    let node: unknown = out;
    for (const p of parts.slice(0, -1)) node = node && typeof node === "object" ? (node as Record<string, unknown>)[p] : undefined;
    const last = parts[parts.length - 1]!;
    if (node && typeof node === "object" && typeof (node as Record<string, unknown>)[last] === "string")
      (node as Record<string, unknown>)[last] = value;
  }
  return out as T;
}

/** Dashboard pages. New pages: add their top-level locale keys here; unknown keys land in "Weitere Texte". */
export const PAGE_GROUPS: { id: string; label: string; prefixes: string[] }[] = [
  { id: "impressum", label: "Impressum", prefixes: ["legal.imprint", "legalMeta.imprint"] },
  { id: "datenschutz", label: "Datenschutz", prefixes: ["legal.privacy", "legalMeta.privacy"] },
  { id: "blog", label: "Blog-Übersicht", prefixes: ["blogPage", "meta.blog", "blogTitle", "allPosts"] },
  { id: "allgemein", label: "Navigation, Footer & Cookies", prefixes: ["nav", "navigationLabel", "footer", "footerLinks", "cookie", "mail", "booking", "whatsapp"] },
  { id: "startseite", label: "Startseite", prefixes: ["meta.home", "hero", "heroImgAlt", "services", "servicesIntro", "processTitle", "steps", "packages", "packagesTitle", "packagesSub", "priceNote", "choose", "popular", "currencyLabel", "from", "fxNote", "fxUpdated", "mailPrice", "custom", "storiesTitle", "caseStudy", "caseStudy2", "quotes", "stories", "about", "aboutIntro", "aboutDetails", "aboutProof", "aboutTitle", "aboutRole", "aboutImgAlt", "aboutP1", "aboutP2", "skills", "languages", "years", "faq", "faqTitle", "faqIntro", "contactTitle", "contactP", "contactWays"] },
];
export const OTHER_GROUP = { id: "weitere", label: "Weitere Texte" };
const matches = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}.`);
export function groupOf(path: string): string {
  return PAGE_GROUPS.find((g) => g.prefixes.some((p) => matches(path, p)))?.id ?? OTHER_GROUP.id;
}
