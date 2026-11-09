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
          ...posts.map(
            (p) =>
              `<url><loc>${escape(SITE_URL + "/" + p.locale + "/blog/" + p.slug)}</loc>${p.updated_at || p.published_at ? `<lastmod>${escape(p.updated_at ?? p.published_at ?? "")}</lastmod>` : ""}</url>`,
          ),
        ];
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rows.join("")}</urlset>`,
          { headers: { "Content-Type": "application/xml", "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
