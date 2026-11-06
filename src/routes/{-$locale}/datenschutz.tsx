import { createFileRoute, notFound } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { getDict, langFromParam, isValidLocaleParam, seoLinks } from "@/lib/i18n";

export const Route = createFileRoute("/{-$locale}/datenschutz")({
  beforeLoad: ({ params }) => { if (!isValidLocaleParam(params.locale)) throw notFound(); },
  head: ({ params }) => {
    const lang = langFromParam(params.locale);
    const m = getDict(lang).legalMeta.privacy;
    return {
      meta: [
        { title: m.title },
        { name: "description", content: m.description },
        { property: "og:title", content: m.title },
        { property: "og:description", content: m.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
      links: seoLinks("/datenschutz", lang),
    };
  },
  component: () => <LegalPage kind="privacy" />,
});
