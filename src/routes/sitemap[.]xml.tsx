import { createFileRoute } from "@tanstack/react-router";
import { buildSitemapXml, type SitemapPost } from "@/lib/sitemap";

async function loadPosts(): Promise<SitemapPost[]> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY missing");
  const res = await fetch(`${url}/rest/v1/rpc/cms_public_posts`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: "{}",
  });
  if (!res.ok) throw new Error(`cms_public_posts HTTP ${res.status}`);
  return (await res.json()) as SitemapPost[];
}

// Single sitemap source, served by the Worker. No public/sitemap.xml on purpose.
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let posts: SitemapPost[] = [];
        let degraded = false;
        try {
          posts = await loadPosts();
        } catch (error) {
          degraded = true;
          console.error("[sitemap] blog articles could not be loaded; serving static pages only:", error);
        }
        return new Response(buildSitemapXml(posts), {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            // A degraded sitemap is cached briefly so the next request retries the database.
            "Cache-Control": degraded ? "public, max-age=60, s-maxage=60" : "public, max-age=3600, s-maxage=3600",
            "X-Sitemap-Status": degraded ? "degraded" : "ok",
          },
        });
      },
    },
  },
});
