import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { posts } from "@/lib/posts";
import { useI18n, getDict, langFromParam, isValidLocaleParam, seoLinks, localeParam } from "@/lib/i18n";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/{-$locale}/blog/")({
  beforeLoad: ({ params }) => { if (!isValidLocaleParam(params.locale)) throw notFound(); },
  head: ({ params }) => {
    const lang = langFromParam(params.locale);
    const m = getDict(lang).meta.blog;
    return {
      meta: [
        { title: m.title },
        { name: "description", content: m.description },
        { property: "og:title", content: m.ogTitle },
        { property: "og:description", content: m.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: seoLinks("/blog", lang, params.locale === "de"),
    };
  },
  component: Blog,
});

function Blog() {
  const { t, lang } = useI18n();
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-5xl font-bold">{t.nav.blog}</h1>
        <p className="mt-4 text-muted-foreground">{t.blogPage.intro}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <Link key={p.slug} to="/{-$locale}/blog/$slug" params={{ locale: localeParam(lang), slug: p.slug }} className="group overflow-hidden rounded-3xl border border-border bg-card">
              <img src={p.image} alt={p.title} loading="lazy" width={1200} height={752} className="aspect-[16/9] w-full object-cover transition group-hover:scale-105" />
              <div className="p-6">
                <time className="text-sm text-accent">{new Date(p.date).toLocaleDateString(t.blogPage.dateLocale)}</time>
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
