import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "de" | "en" | "es";
export const langs: Lang[] = ["de", "en", "es"];

const dict = {
  de: {
    nav: { services: "Leistungen", process: "Ablauf", stories: "Referenzen", about: "Über mich", blog: "Blog", contact: "Kontakt" },
    hero: { h1a: "Gefunden werden – ", h1b: "bei Google und in der KI.", p: "Beratung und Umsetzung von SEO- und GEO-Kampagnen, die Ihre Marke dort sichtbar machen, wo Kunden suchen.", cta: "Erstgespräch buchen" },
    services: [
      { t: "SEO-Beratung", d: "Audit, Keyword- & Search-Intent-Recherche und Wettbewerbsanalyse – damit Sie wissen, wo Ihr Potenzial liegt." },
      { t: "GEO-Beratung", d: "AI Search & LLM Visibility: So wird Ihre Marke in ChatGPT, Perplexity und Google AI Overviews genannt." },
      { t: "SEO-Kampagnen", d: "Technical SEO, Content-Architektur, Linkbuilding & Digital PR – wir setzen um." },
      { t: "GEO-Kampagnen", d: "Semantic SEO, strukturierte Inhalte, E-E-A-T und Monitoring Ihrer KI-Sichtbarkeit." },
    ],
    processTitle: "So arbeiten wir",
    steps: ["Analyse", "Strategie", "Umsetzung", "Messen & Optimieren"],
    storiesTitle: "Success Stories",
    caseStudy: {
      tag: "Case Study · SEO & GEO",
      client: "Health Care · B2B2C · anonymisiert",
      hero: "+700 %",
      heroLabel: "mehr monatlicher organischer Traffic – von ca. 350 auf bis zu 2.800 (geschätzt)",
      stats: [
        { k: "8,4", l: "Ø Google-Position, zuletzt" },
        { k: "+141 %", l: "aktive Nutzer" },
        { k: "+128 %", l: "verweisende Domains" },
        { k: "95 %", l: "SEO Health Score, konstant" },
      ],
      aiTitle: "In KI-Antworten als Quelle herangezogen",
      aiText: "Unternehmensinhalte wurden sowohl in Googles KI-generierten Übersichten (AI Overviews) als auch in Antworten KI-gestützter Sprachmodelle aufgegriffen und als Quellen genutzt.",
      evidenceTitle: "Die Zahlen im Detail",
      captions: [
        "Ranking-Sichtbarkeit im Zeitverlauf",
        "Google Analytics 4: aktive Nutzer +140,8 %",
        "Ahrefs: organischer Traffic über zwei Jahre",
      ],
    },
    quotes: { o: "„", c: "“" },
    stories: [
      { k: "+180 %", l: "organischer Traffic", c: "B2B-Softwareanbieter", q: "Innerhalb von 9 Monaten von Seite 3 auf Top-3-Rankings für unsere wichtigsten Keywords." },
      { k: "3×", l: "mehr Leads", c: "E-Commerce Mode", q: "Die Content-Strategie hat unseren Shop endlich für die richtigen Suchanfragen sichtbar gemacht." },
      { k: "Top 1", l: "Nennung in ChatGPT", c: "Beratungsunternehmen", q: "Wir werden heute in KI-Antworten als Empfehlung genannt – ein echter Wettbewerbsvorteil." },
    ],
    aboutTitle: "Über mich",
    aboutRole: "SEO & GEO Specialist · Content Strategist · Journalistin",
    aboutImgAlt: "Portrait von Charlotte Götz",
    aboutP1: "Ich bin Charlotte Götz – SEO- und GEO-Spezialistin mit journalistischem Hintergrund. Seit über 10 Jahren helfe ich Unternehmen, organisch zu wachsen: mit Strategien, die in klassischen Suchmaschinen und KI-gestützten Suchsystemen gleichermaßen funktionieren.",
    aboutP2: "Ich verbinde strategische Content-Entwicklung mit Technical SEO, Website-Management und datenbasierter Optimierung – für nachhaltige organische Sichtbarkeit statt kurzfristiger Effekte.",
    skills: [
      "Technical SEO", "GEO & AEO", "AI Search & LLM Visibility", "Semantic SEO", "International SEO",
      "Content-Strategie (B2B & B2C)", "E-E-A-T", "Digital PR & Authority Building", "Linkbuilding",
      "Keyword- & Search-Intent-Recherche", "GA4 · GSC · Ahrefs · Screaming Frog", "Prompt Engineering", "CRO & Funnel-Optimierung",
    ],
    languages: "Deutsch (Muttersprache) · Englisch (C1) · Spanisch (B1)",
    years: "Jahre Erfahrung",
    blogTitle: "Aus dem Blog", allPosts: "Alle Beiträge →",
    contactTitle: "Bereit für mehr Sichtbarkeit?", contactP: "Lassen Sie uns in einem kostenlosen Erstgespräch Ihr Potenzial besprechen.",
    footer: "SEO & GEO Beratung",
  },
  en: {
    nav: { services: "Services", process: "Process", stories: "Case studies", about: "About me", blog: "Blog", contact: "Contact" },
    hero: { h1a: "Get found – ", h1b: "on Google and in AI.", p: "Consulting and execution of SEO and GEO campaigns that make your brand visible where customers search.", cta: "Book a free call" },
    services: [
      { t: "SEO consulting", d: "Audit, keyword & search intent research and competitive analysis – so you know where your potential lies." },
      { t: "GEO consulting", d: "AI search & LLM visibility: get your brand mentioned in ChatGPT, Perplexity and Google AI Overviews." },
      { t: "SEO campaigns", d: "Technical SEO, content architecture, link building & digital PR – we make it happen." },
      { t: "GEO campaigns", d: "Semantic SEO, structured content, E-E-A-T and monitoring of your AI visibility." },
    ],
    processTitle: "How we work",
    steps: ["Analysis", "Strategy", "Execution", "Measure & optimize"],
    storiesTitle: "Success stories",
    caseStudy: {
      tag: "Case study · SEO & GEO",
      client: "Healthcare · B2B2C · anonymised",
      hero: "+700 %",
      heroLabel: "more monthly organic traffic – from approx. 350 up to 2,800 (estimated)",
      stats: [
        { k: "8.4", l: "latest avg. Google position" },
        { k: "+141 %", l: "active users" },
        { k: "+128 %", l: "referring domains" },
        { k: "95 %", l: "consistent SEO health score" },
      ],
      aiTitle: "Used as a source in AI answers",
      aiText: "Company content was picked up and used as a source both in Google AI Overviews and in the answers of AI-powered language models.",
      evidenceTitle: "The numbers in detail",
      captions: [
        "Ranking visibility over time",
        "Google Analytics 4: active users +140.8 %",
        "Ahrefs: organic traffic over two years",
      ],
    },
    quotes: { o: "“", c: "”" },
    stories: [
      { k: "+180%", l: "organic traffic", c: "B2B software company", q: "Within 9 months we went from page 3 to top-3 rankings for our key terms." },
      { k: "3×", l: "more leads", c: "Fashion e-commerce", q: "The content strategy finally made our shop visible for the right searches." },
      { k: "#1", l: "mention in ChatGPT", c: "Consulting firm", q: "Today AI answers recommend us by name – a real competitive edge." },
    ],
    aboutTitle: "About me",
    aboutRole: "SEO & GEO Specialist · Content Strategist · Journalist",
    aboutImgAlt: "Portrait of Charlotte Götz",
    aboutP1: "I'm Charlotte Götz – an SEO and GEO specialist with a journalism background. For over 10 years I've helped companies grow organically, with strategies that work in classic search engines and AI-powered search systems alike.",
    aboutP2: "I combine strategic content development with technical SEO, website management and data-driven optimization – for sustainable organic visibility instead of short-lived effects.",
    skills: [
      "Technical SEO", "GEO & AEO", "AI Search & LLM Visibility", "Semantic SEO", "International SEO",
      "Content strategy (B2B & B2C)", "E-E-A-T", "Digital PR & authority building", "Link building",
      "Keyword & search intent research", "GA4 · GSC · Ahrefs · Screaming Frog", "Prompt engineering", "CRO & funnel optimization",
    ],
    languages: "German (native) · English (C1) · Spanish (B1)",
    years: "years of experience",
    blogTitle: "From the blog", allPosts: "All posts →",
    contactTitle: "Ready for more visibility?", contactP: "Let's discuss your potential in a free intro call.",
    footer: "SEO & GEO consulting",
  },
  es: {
    nav: { services: "Servicios", process: "Proceso", stories: "Casos de éxito", about: "Sobre mí", blog: "Blog", contact: "Contacto" },
    hero: { h1a: "Que te encuentren – ", h1b: "en Google y en la IA.", p: "Consultoría y ejecución de campañas SEO y GEO que hacen visible tu marca donde buscan tus clientes.", cta: "Reservar llamada" },
    services: [
      { t: "Consultoría SEO", d: "Auditoría, investigación de palabras clave e intención de búsqueda y análisis de la competencia para descubrir tu potencial." },
      { t: "Consultoría GEO", d: "AI Search y visibilidad en LLMs: haz que tu marca aparezca en ChatGPT, Perplexity y Google AI Overviews." },
      { t: "Campañas SEO", d: "SEO técnico, arquitectura de contenidos, link building y digital PR: nosotros lo ejecutamos." },
      { t: "Campañas GEO", d: "SEO semántico, contenido estructurado, E-E-A-T y monitoreo de tu visibilidad en IA." },
    ],
    processTitle: "Cómo trabajamos",
    steps: ["Análisis", "Estrategia", "Ejecución", "Medir y optimizar"],
    storiesTitle: "Casos de éxito",
    caseStudy: {
      tag: "Caso de éxito · SEO y GEO",
      client: "Sector salud · B2B2C · anonimizado",
      hero: "+700 %",
      heroLabel: "más tráfico orgánico mensual – de aprox. 350 hasta 2.800 (estimado)",
      stats: [
        { k: "8,4", l: "posición media en Google" },
        { k: "+141 %", l: "usuarios activos" },
        { k: "+128 %", l: "dominios de referencia" },
        { k: "95 %", l: "SEO health score estable" },
      ],
      aiTitle: "Citado como fuente en respuestas de IA",
      aiText: "El contenido de la empresa fue recogido y utilizado como fuente tanto en los AI Overviews de Google como en las respuestas de modelos de lenguaje con IA.",
      evidenceTitle: "Las cifras en detalle",
      captions: [
        "Visibilidad de rankings en el tiempo",
        "Google Analytics 4: usuarios activos +140,8 %",
        "Ahrefs: tráfico orgánico en dos años",
      ],
    },
    quotes: { o: "«", c: "»" },
    stories: [
      { k: "+180 %", l: "tráfico orgánico", c: "Empresa de software B2B", q: "En 9 meses pasamos de la página 3 al top 3 en nuestras palabras clave principales." },
      { k: "3×", l: "más leads", c: "E-commerce de moda", q: "La estrategia de contenido por fin hizo visible nuestra tienda para las búsquedas correctas." },
      { k: "#1", l: "mención en ChatGPT", c: "Consultora", q: "Hoy las respuestas de IA nos recomiendan por nombre: una verdadera ventaja." },
    ],
    aboutTitle: "Sobre mí",
    aboutRole: "Especialista en SEO y GEO · Estratega de contenidos · Periodista",
    aboutImgAlt: "Retrato de Charlotte Götz",
    aboutP1: "Soy Charlotte Götz, especialista en SEO y GEO con formación periodística. Desde hace más de 10 años ayudo a empresas a crecer de forma orgánica, con estrategias que funcionan tanto en los buscadores clásicos como en los sistemas de búsqueda con IA.",
    aboutP2: "Combino el desarrollo estratégico de contenidos con SEO técnico, gestión de sitios web y optimización basada en datos, para una visibilidad orgánica sostenible en lugar de efectos pasajeros.",
    skills: [
      "SEO técnico", "GEO & AEO", "AI Search & LLM Visibility", "SEO semántico", "SEO internacional",
      "Estrategia de contenidos (B2B y B2C)", "E-E-A-T", "Digital PR y autoridad", "Link building",
      "Keywords e intención de búsqueda", "GA4 · GSC · Ahrefs · Screaming Frog", "Prompt engineering", "CRO y optimización de funnel",
    ],
    languages: "Alemán (lengua materna) · Inglés (C1) · Español (B1)",
    years: "años de experiencia",
    blogTitle: "Del blog", allPosts: "Todos los artículos →",
    contactTitle: "¿Listo para más visibilidad?", contactP: "Hablemos de tu potencial en una primera llamada gratuita.",
    footer: "Consultoría SEO y GEO",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (typeof dict)["de"] };
const I18n = createContext<Ctx>({ lang: "de", setLang: () => {}, t: dict.de });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");
  useEffect(() => {
    const s = localStorage.getItem("lang") as Lang | null;
    if (s && langs.includes(s)) setLangState(s);
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("lang", l); };
  return <I18n.Provider value={{ lang, setLang, t: dict[lang] }}>{children}</I18n.Provider>;
}

export const useI18n = () => useContext(I18n);
