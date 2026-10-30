import geo from "@/assets/blog-geo.jpg";
import seo from "@/assets/blog-seo.jpg";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  content: string[];
};

// Neue Beiträge hier ergänzen – Bilder in src/assets ablegen und importieren.
export const posts: Post[] = [
  {
    slug: "was-ist-geo",
    title: "Was ist GEO? Sichtbarkeit in KI-Antworten",
    excerpt: "Warum Generative Engine Optimization neben klassischem SEO unverzichtbar wird.",
    date: "2026-10-20",
    image: geo,
    content: [
      "ChatGPT, Perplexity und Google AI Overviews verändern, wie Menschen nach Informationen suchen. Statt zehn blauer Links erhalten Nutzer direkte Antworten.",
      "Generative Engine Optimization (GEO) sorgt dafür, dass Ihre Marke in diesen Antworten genannt und zitiert wird – durch klare Struktur, belegbare Expertise und eine starke Präsenz in vertrauenswürdigen Quellen.",
      "Der Einstieg: Prüfen Sie, wie KI-Systeme heute über Ihr Unternehmen sprechen, und schließen Sie gezielt die Lücken.",
    ],
  },
  {
    slug: "seo-grundlagen-2026",
    title: "SEO-Grundlagen 2026: Was wirklich zählt",
    excerpt: "Technik, Content und Autorität – die drei Säulen nachhaltiger Rankings.",
    date: "2026-10-05",
    image: seo,
    content: [
      "Gutes SEO beginnt mit einer sauberen technischen Basis: schnelle Ladezeiten, crawlbare Struktur und korrekte Indexierung.",
      "Darauf aufbauend entscheidet hilfreicher Content, der echte Suchintentionen beantwortet, über Ihre Sichtbarkeit.",
      "Autorität durch Erwähnungen und Backlinks rundet das Bild ab – und zahlt gleichzeitig auf GEO ein.",
    ],
  },
];
