import { createContext, useContext, type ReactNode } from "react";
import { useParams } from "@tanstack/react-router";
import de from "@/locales/de";
import en from "@/locales/en";
import es from "@/locales/es";

export type Lang = "de" | "en" | "es";
export const langs: Lang[] = ["de", "en", "es"];
export const defaultLang: Lang = "de";
export const SITE_URL = "https://better-visibility.com";

const dict = { de, en, es };

/** Language-switcher destinations use explicit prefixes; / remains the fallback. */
export const localeParam = (l: Lang) => l;
export const langFromParam = (p?: string): Lang => (p === "en" || p === "es" ? p : "de");
export const isValidLocaleParam = (p?: string) => p === undefined || p === "de" || p === "en" || p === "es";

/** hreflang alternates + canonical for a path without locale prefix (e.g. "/blog"). */
export function seoLinks(path: string, lang: Lang, prefixedGerman = false) {
  const url = (l: Lang) => SITE_URL + (path === "/" ? `/${l}` : `/${l}${path}`);
  return [
    { rel: "canonical", href: lang === "de" && !prefixedGerman ? SITE_URL + path : url(lang) },
    ...langs.map((l) => ({ rel: "alternate", hrefLang: l, href: url(l) })),
    { rel: "alternate", hrefLang: "x-default", href: SITE_URL + path },
  ];
}

export const getDict = (l: Lang) => dict[l];

type Ctx = { lang: Lang; t: (typeof dict)["de"] };
const I18n = createContext<Ctx>({ lang: "de", t: dict.de });

export function I18nProvider({ children }: { children: ReactNode }) {
  const { locale } = useParams({ strict: false }) as { locale?: string };
  const lang = langFromParam(locale);
  return <I18n.Provider value={{ lang, t: dict[lang] }}>{children}</I18n.Provider>;
}

export const useI18n = () => useContext(I18n);
