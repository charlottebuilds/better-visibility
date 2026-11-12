import { PERSON_ID, ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { getWebsiteBlog, getWebsiteRedirect } from "@/lib/cms/website-data";
import { PUBLIC_CMS_ENABLED } from "@/lib/public-site";
import { getDict, langFromParam, isValidLocaleParam, SITE_URL, type Lang } from "@/lib/i18n";
import { postCanonicalUrl, alternates } from "@/lib/sitemap";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Article } from "@/components/cms/Article";
import { mediaUrl } from "@/lib/cms/types";
export const Route = createFileRoute("/{-$locale}/blog/$slug")({
  beforeLoad: ({ params }) => {
    if (!isValidLocaleParam(params.locale)) throw notFound();
    if (!PUBLIC_CMS_ENABLED) throw redirect({ to: "/{-$locale}/", params: { locale: params.locale } });
  },
  loader: async ({ params }) => {
    const lang = langFromParam(params.locale);
    const data = await getWebsiteBlog({ data: {} });
    const post = data.posts.find((p) => p.locale === lang && p.slug === params.slug);
    if (!post) {
      const target = await getWebsiteRedirect({ data: { locale: lang, slug: params.slug } });
      if (target)
        throw redirect({
          to: "/{-$locale}/blog/$slug/",
          params: { locale: params.locale, slug: target },
          statusCode: 301,
        });
      throw notFound();
    }
    return {
      ...data,
      post,
      translations: data.posts.filter((p) => p.translation_group === post.translation_group),
    };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Beitrag nicht verfügbar – Better Visibility" },
          { name: "robots", content: "noindex" },
        ],
      };
    const p = loaderData.post;
    const canonical =
      p.canonical_url || postCanonicalUrl(p.locale as Lang, p.slug);
    const image = p.cover_path ? SITE_URL + mediaUrl(p.cover_path) : null;
    return {
      meta: [
        { title: p.meta_title || p.title + " – Better Visibility" },
        { name: "description", content: p.meta_description || p.excerpt },
        { property: "og:title", content: p.meta_title || p.title },
        { property: "og:description", content: p.meta_description || p.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: [
        { rel: "canonical", href: canonical },
        ...alternates(
          loaderData.translations.map((t) => ({ lang: t.locale as Lang, href: postCanonicalUrl(t.locale as Lang, t.slug) })),
        ).map((l) => ({ rel: "alternate", hrefLang: l.hreflang, href: l.href })),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: p.title,
            datePublished: p.original_published_at ?? p.published_at,
            dateModified: p.updated_at ?? p.published_at,
            description: p.meta_description || p.excerpt,
            inLanguage: p.locale,
            author: { "@type": "Person", "@id": PERSON_ID, name: p.author || "Charlotte Götz" },
            publisher: { "@id": ORG_ID },
            isPartOf: { "@id": WEBSITE_ID },
            mainEntityOfPage: canonical,
            url: canonical,
            ...(image ? { image } : {}),
          }),
        },
      ],
    };
  },
  component: Post,
});
function Post() {
  const { post, categories, translations } = Route.useLoaderData();
  const t = getDict(langFromParam(post.locale));
  return (
    <>
      <SiteHeader postTranslations={translations} />
      <div className="mx-auto max-w-3xl px-6 pt-10">
        <Link
          to="/{-$locale}/blog/"
          params={{ locale: post.locale }}
          className="text-sm text-accent"
        >
          {t.blogPage.back}
        </Link>
      </div>
      <Article post={post} categories={categories} />
      <SiteFooter />
    </>
  );
}
