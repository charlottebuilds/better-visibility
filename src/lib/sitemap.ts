import { SITE_URL, langs, type Lang } from "@/lib/i18n";

/** Canonical public URL (trailing slash, German unprefixed) for a page path like "/" or "/impressum". */
export const canonicalUrl = (path: string, lang: Lang) => {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  return `${SITE_URL}${lang === "de" ? "" : `/${lang}`}${clean}/`;
};

/** Indexable public pages. Blog stays out while it redirects to the homepage. */
export const SITEMAP_PAGES = ["/", "/impressum", "/datenschutz"] as const;

export function buildSitemapXml() {
  const rows = SITEMAP_PAGES.flatMap((path) =>
    langs.map((lang) => {
      const alts = [
        ...langs.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${canonicalUrl(path, l)}"/>`),
        `<xhtml:link rel="alternate" hreflang="x-default" href="${canonicalUrl(path, "de")}"/>`,
      ].join("");
      return `<url><loc>${canonicalUrl(path, lang)}</loc>${alts}</url>`;
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${rows.join("")}</urlset>\n`;
}
