import { createFileRoute, Link } from "@tanstack/react-router";
import { posts } from "@/lib/posts";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog – Better Visibility | SEO & GEO Wissen" },
      { name: "description", content: "Artikel rund um SEO, GEO und Sichtbarkeit in KI-Suchen." },
      { property: "og:title", content: "Blog – Better Visibility" },
      { property: "og:description", content: "Artikel rund um SEO, GEO und Sichtbarkeit in KI-Suchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Blog,
});

function Blog() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-5xl font-bold">Blog</h1>
        <p className="mt-4 text-muted-foreground">Wissen rund um SEO und GEO.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group overflow-hidden rounded-3xl border border-border bg-card">
              <img src={p.image} alt={p.title} loading="lazy" width={1200} height={752} className="aspect-[16/9] w-full object-cover transition group-hover:scale-105" />
              <div className="p-6">
                <time className="text-sm text-accent">{new Date(p.date).toLocaleDateString("de-DE")}</time>
                <h2 className="mt-2 text-2xl font-bold">{p.title}</h2>
                <p className="mt-2 text-muted-foreground">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
