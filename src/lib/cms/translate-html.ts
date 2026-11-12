// Pure, browser-safe helpers for validating and link-mapping translated HTML.
export type Locale = "de" | "en" | "es";
export const LOCALES: Locale[] = ["de", "en", "es"];
const VOID = new Set(["br", "img", "hr"]);
// Attributes the translator may change; every other attribute must stay byte-identical.
const TRANSLATABLE_ATTRS = new Set(["alt", "title"]);
const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const ATTR_RE = /([^\s=/]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g;

export function parseAttrs(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of raw.matchAll(ATTR_RE)) {
    const v = m[2] ?? "";
    out[m[1].toLowerCase()] = v.replace(/^["']|["']$/g, "");
  }
  return out;
}

/** Ordered element skeleton: depth + tag + non-translatable attributes, plus "has text" per leaf block. */
export function skeleton(html: string): string[] {
  const sig: string[] = [];
  let depth = 0;
  for (const m of html.matchAll(TAG_RE)) {
    const [, close, tagRaw, rawAttrs] = m;
    const tag = tagRaw.toLowerCase();
    if (close) { depth--; sig.push(`${depth}</${tag}>`); continue; }
    const attrs = parseAttrs(rawAttrs);
    const fixed = Object.keys(attrs).filter((k) => !TRANSLATABLE_ATTRS.has(k)).sort()
      .map((k) => `${k}=${attrs[k]}`).join(" ");
    const hasAlt = "alt" in attrs ? (attrs["alt"].trim() ? " alt+" : " alt-") : "";
    sig.push(`${depth}<${tag} ${fixed}${hasAlt}>`);
    if (!VOID.has(tag) && !rawAttrs.trim().endsWith("/")) depth++;
  }
  if (depth !== 0) sig.push(`unbalanced:${depth}`);
  return sig;
}

const textOf = (html: string) =>
  html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
/** Text segments between tags; empty vs non-empty must match position by position. */
const textPresence = (html: string) =>
  html.split(/<[^>]*>/).map((s) => (s.replace(/&nbsp;/g, " ").trim() ? 1 : 0)).join("");
const digitRuns = (html: string) => (textOf(html).match(/\d+/g) ?? []).sort().join(",");

export type ValidationIssue =
  | "empty" | "structure" | "attributes" | "text_missing" | "numbers" | "length";

export function validateTranslatedHtml(source: string, output: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!textOf(output)) return ["empty"];
  const a = skeleton(source), b = skeleton(output);
  if (a.length !== b.length || a.some((t, i) => t.replace(/ .*$/, "") !== b[i].replace(/ .*$/, "")))
    issues.push("structure");
  else if (a.some((t, i) => t !== b[i])) issues.push("attributes");
  if (textPresence(source) !== textPresence(output)) issues.push("text_missing");
  if (digitRuns(source) !== digitRuns(output)) issues.push("numbers");
  const ratio = textOf(output).length / Math.max(1, textOf(source).length);
  if (ratio < 0.5 || ratio > 2) issues.push("length");
  return issues;
}

export type PublishedTranslation = { locale: Locale; slug: string; translation_group: string };
export type LinkContext = {
  sourceLocale: Locale;
  targetLocale: Locale;
  siteHosts: string[]; // e.g. ["better-visibility.com", "www.better-visibility.com"]
  published: PublishedTranslation[];
};
const STATIC_PAGES = new Set(["", "blog", "impressum", "datenschutz"]);
const prefix = (l: Locale) => (l === "de" ? "" : `/${l}`);

/** Maps one href; returns it unchanged unless it is a resolvable internal link of the source language. */
export function mapHref(href: string, ctx: LinkContext): string {
  const h = href.trim();
  if (!h || h.startsWith("#") || /^(mailto|tel|javascript|data):/i.test(h)) return href;
  let origin = "";
  let rest = h;
  const abs = h.match(/^(https?:)?\/\/([^/?#]+)(.*)$/i);
  if (abs) {
    if (!ctx.siteHosts.includes(abs[2].toLowerCase())) return href;
    origin = h.slice(0, h.length - abs[3].length);
    rest = abs[3] || "/";
  } else if (!h.startsWith("/")) return href; // relative URLs are ambiguous: keep
  const m = rest.match(/^([^?#]*)(.*)$/)!;
  const segs = m[1].split("/").filter(Boolean);
  let locale: Locale = "de";
  if (segs[0] === "en" || segs[0] === "es" || segs[0] === "de") locale = segs.shift() as Locale;
  if (locale !== ctx.sourceLocale) return href; // already points to another language
  let path: string | null = null;
  if (segs.length === 2 && segs[0] === "blog") {
    const src = ctx.published.find((p) => p.locale === locale && p.slug === segs[1]);
    const tgt = src && ctx.published.find(
      (p) => p.translation_group === src.translation_group && p.locale === ctx.targetLocale);
    if (!tgt) return href; // only existing published translations are valid targets
    path = `${prefix(ctx.targetLocale)}/blog/${tgt.slug}/`;
  } else if (segs.length <= 1 && STATIC_PAGES.has(segs[0] ?? "")) {
    path = `${prefix(ctx.targetLocale)}/${segs[0] ? segs[0] + "/" : ""}`;
  } else return href;
  return origin + path + m[2];
}

export function mapInternalLinks(html: string, ctx: LinkContext): string {
  return html.replace(/(<a\b[^>]*?\shref\s*=\s*)("([^"]*)"|'([^']*)')/gi, (_all, pre, _q, d, s) => {
    const v = (d ?? s) as string;
    return `${pre}"${mapHref(v, ctx).replace(/"/g, "&quot;")}"`;
  });
}

export const isValidSlug = (s: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);
