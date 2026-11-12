import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getDict, langFromParam, isValidLocaleParam, seoLinks, useI18n } from "@/lib/i18n";
import { getWebsiteBlog } from "@/lib/cms/website-data";
import { PUBLIC_CMS_ENABLED } from "@/lib/public-site";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { BlogList } from "@/components/cms/BlogList";
export const Route = createFileRoute("/{-$locale}/blog/")({
  beforeLoad: ({ params }) => {
    if (!isValidLocaleParam(params.locale)) throw notFound();
    if (!PUBLIC_CMS_ENABLED) throw redirect({ to: "/{-$locale}/", params: { locale: params.locale } });
  },
  loader: ({ params }) => getWebsiteBlog({ data: { locale: langFromParam(params.locale) } }),
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
  const { t } = useI18n();
  const data = Route.useLoaderData();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-5xl font-bold">{t.nav.blog}</h1>
        <p className="mt-4 text-muted-foreground">{t.blogPage.intro}</p>
        <BlogList posts={data.posts} categories={data.categories} />
      </main>
      <SiteFooter />
    </>
  );
}
