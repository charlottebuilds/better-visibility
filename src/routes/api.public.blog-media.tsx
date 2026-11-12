import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Uploads get a fresh random file name, so a replaced image always has a new URL.
// Deletions/unpublishing are honoured after at most the short edge TTL below.
const CACHE_OK = "public, max-age=300, s-maxage=1800, stale-while-revalidate=30";
const notFound = () =>
  new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

export const Route = createFileRoute("/api/public/blog-media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const path = new URL(request.url).searchParams.get("path");
        if (!path || !/^[a-zA-Z0-9_.-]+$/.test(path)) return notFound();
        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) return new Response("Unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
        const client = createClient<Database>(url, key, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (i, o) => {
              const h = new Headers(o?.headers);
              h.delete("Authorization");
              h.set("apikey", key);
              return fetch(i, { ...o, headers: h });
            },
          },
        });
        const { data: allowed, error: checkError } = await client.rpc("cms_public_media", { p_path: path });
        if (checkError) {
          console.error("[blog-media] publication check failed:", checkError.message);
          return new Response("Unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
        }
        if (!allowed) return notFound();
        // The private bucket's SELECT policy rechecks publication; no privileged key is used.
        const { data, error } = await client.storage.from("blog-media").download(path);
        if (error || !data) return notFound();
        const etag = `"${path}-${data.size}"`;
        if (request.headers.get("If-None-Match") === etag)
          return new Response(null, { status: 304, headers: { ETag: etag, "Cache-Control": CACHE_OK } });
        return new Response(data, {
          headers: {
            "Content-Type": data.type,
            "Cache-Control": CACHE_OK,
            ETag: etag,
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
