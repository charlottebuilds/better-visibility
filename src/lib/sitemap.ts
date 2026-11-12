import { SITE_URL, langs, type Lang } from "@/lib/i18n";

/** Canonical public URL (trailing slash, German unprefixed) for a page path like "/" or "/impressum". */
export const canonicalUrl = (path: string, lang: Lang) => {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  return `${SITE_URL}${lang === "de" ? "" : `/${lang}`}${clean}/`;
};

/** Canonical URL of a blog article. */
export const postCanonicalUrl = (lang: Lang, slug: string) => canonicalUrl(`/blog/${slug}`, lang);

/** Indexable static pages, each available in every language. */
export const SITEMAP_PAGES = ["/", "/impressum", "/datenschutz", "/blog"] as const;

export type SitemapPost = { locale: string; slug: string; translation_group: string; canonical_url?: string | null };

const isLang = (l: string): l is Lang => (langs as string[]).includes(l);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** hreflang alternates for a set of language versions; x-default = German (the unprefixed default). */
export function alternates(versions: { lang: Lang; href: string }[]) {
  const de = versions.find((v) => v.lang === "de");
  return [
    ...versions.map((v) => ({ hreflang: v.lang as string, href: v.href })),
    ...(de ? [{ hreflang: "x-default", href: de.href }] : []),
  ];
}

const block = (loc: string, links: { hreflang: string; href: string }[]) =>
  `  <url>\n    <loc>${esc(loc)}</loc>\n${links
    .map((l) => `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${esc(l.href)}" />`)
    .join("\n")}\n  </url>`;

/** Only published posts are passed in (cms_public_posts filters drafts). Posts with a foreign canonical are skipped. */
export function buildSitemapXml(posts: SitemapPost[] = []): string {
  const blocks = SITEMAP_PAGES.flatMap((path) => {
    const links = alternates(langs.map((l) => ({ lang: l, href: canonicalUrl(path, l) })));
    return langs.map((lang) => block(canonicalUrl(path, lang), links));
  });
  const valid = posts.filter((p) => {
    if (!isLang(p.locale) || !/^[a-z0-9-]+$/i.test(p.slug)) return false;
    const own = postCanonicalUrl(p.locale, p.slug);
    return !p.canonical_url || p.canonical_url.replace(/\/?$/, "/") === own;
  });
  const groups = new Map<string, SitemapPost[]>();
  for (const p of valid) groups.set(p.translation_group, [...(groups.get(p.translation_group) ?? []), p]);
  for (const group of groups.values()) {
    const versions = group.map((p) => ({ lang: p.locale as Lang, href: postCanonicalUrl(p.locale as Lang, p.slug) }));
    const links = alternates(versions);
    for (const v of versions) blocks.push(block(v.href, links));
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${blocks.join("\n")}\n</urlset>\n`;
}
