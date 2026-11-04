import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { posts } from "@/lib/posts";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} – Better Visibility` },
          { name: "description", content: loaderData.excerpt },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.excerpt },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Beitrag nicht gefunden" }, { name: "robots", content: "noindex" }],
  }),
  component: PostPage,
});

function PostPage() {
  const p = Route.useLoaderData();
  return (
    <div>
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/blog" className="text-sm text-accent">← Zurück zum Blog</Link>
        <time className="mt-6 block text-sm text-muted-foreground">{new Date(p.date).toLocaleDateString("de-DE")}</time>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl">{p.title}</h1>
        <img src={p.image} alt={p.title} width={1200} height={752} className="mt-8 rounded-3xl" />
        <div className="mt-10 space-y-6 text-lg leading-relaxed text-muted-foreground">
          {p.content.map((c, i) => <p key={i}>{c}</p>)}
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
