import { createFileRoute } from "@tanstack/react-router";
import { getPublicBlog } from "@/lib/cms/public.functions";
import { SITE_URL } from "@/lib/i18n";
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { posts } = await getPublicBlog({ data: {} });
        const escape = (s: string) =>
          s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
        const pages = [
          "/",
          "/de",
          "/en",
          "/es",
          ...["de", "en", "es"].flatMap((l) => [
            `/${l}/blog`,
            `/${l}/impressum`,
            `/${l}/datenschutz`,
          ]),
        ];
        const rows = [
          ...pages.map((path) => `<url><loc>${SITE_URL}${path}</loc></url>`),
          ...posts.map((p) => {
            const url = (x: { locale: string; slug: string }) =>
              escape(`${SITE_URL}/${x.locale}/blog/${x.slug}`);
            const siblings = posts.filter((s) => s.translation_group === p.translation_group);
            const alts = siblings
              .map((s) => `<xhtml:link rel="alternate" hreflang="${s.locale}" href="${url(s)}"/>`)
              .join("");
            const de = siblings.find((s) => s.locale === "de");
            const xd = de ? `<xhtml:link rel="alternate" hreflang="x-default" href="${url(de)}"/>` : "";
            const lm = p.updated_at ?? p.published_at;
            return `<url><loc>${url(p)}</loc>${lm ? `<lastmod>${escape(lm)}</lastmod>` : ""}${alts}${xd}</url>`;
          }),
        ];
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${rows.join("")}</urlset>`,
          { headers: { "Content-Type": "application/xml", "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
