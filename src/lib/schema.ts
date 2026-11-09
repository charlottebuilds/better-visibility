import { SITE_URL } from "@/lib/i18n";

/**
 * Business details used for structured data (schema.org JSON-LD).
 * PLATZHALTER: Firmenname und Adresse sind noch nicht final.
 * Leere Adressfelder werden NICHT ausgegeben, damit Google keine Fantasiewerte sieht.
 */
export const BUSINESS = {
  name: "Better Visibility",
  legalName: "Better Visibility LLC", // PLATZHALTER – genaue Bezeichnung noch offen
  email: "visibility@better-technologies.com",
  linkedin: "https://www.linkedin.com/in/charlotte-goetz-public/",
  address: {
    streetAddress: "", // PLATZHALTER – Straße und Hausnummer
    postalCode: "", // PLATZHALTER – PLZ
    addressLocality: "", // PLATZHALTER – Ort
    addressRegion: "", // PLATZHALTER – Bundesland/Staat (optional)
    addressCountry: "", // PLATZHALTER – Ländercode, z. B. "US" oder "DE"
  },
};

export const PERSON_ID = `${SITE_URL}/#charlotte`;
export const ORG_ID = `${SITE_URL}/#business`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function postalAddress() {
  const a = BUSINESS.address;
  if (!a.streetAddress || !a.addressLocality || !a.addressCountry) return undefined;
  const filled = Object.fromEntries(Object.entries(a).filter(([, v]) => v));
  return { "@type": "PostalAddress", ...filled };
}

export function siteGraph(opts: {
  lang: string;
  pageUrl: string;
  description: string;
  skills: string[];
  offerCatalogName: string;
  offers: { n: string; d: string; k: string }[];
}) {
  const address = postalAddress();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: BUSINESS.name,
        inLanguage: ["de", "en", "es"],
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "WebPage",
        "@id": `${opts.pageUrl}#webpage`,
        url: opts.pageUrl,
        name: BUSINESS.name,
        description: opts.description,
        inLanguage: opts.lang,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: "Charlotte Götz",
        jobTitle: "Organic Growth Specialist · Content Strategist",
        email: `mailto:${BUSINESS.email}`,
        url: `${SITE_URL}/`,
        sameAs: [BUSINESS.linkedin],
        knowsAbout: opts.skills,
        knowsLanguage: ["de", "en", "es"],
        worksFor: { "@id": ORG_ID },
      },
      {
        "@type": "ProfessionalService",
        "@id": ORG_ID,
        name: BUSINESS.name,
        legalName: BUSINESS.legalName,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/apple-touch-icon.png`,
        image: `${SITE_URL}/apple-touch-icon.png`,
        email: BUSINESS.email,
        description: opts.description,
        areaServed: { "@type": "Place", name: "Worldwide" },
        founder: { "@id": PERSON_ID },
        sameAs: [BUSINESS.linkedin],
        ...(address ? { address } : {}),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: opts.offerCatalogName,
          itemListElement: opts.offers.map((p) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: p.n, description: p.d, category: p.k },
          })),
        },
      },
    ],
  };
}
