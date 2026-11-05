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

/** Value for the optional {-$locale} URL segment: German has no prefix. */
export const localeParam = (l: Lang) => (l === defaultLang ? undefined : l);
export const langFromParam = (p?: string): Lang => (p === "en" || p === "es" ? p : "de");
export const isValidLocaleParam = (p?: string) => p === undefined || p === "en" || p === "es";

/** hreflang alternates + canonical for a path without locale prefix (e.g. "/blog"). */
export function seoLinks(path: string, lang: Lang) {
  const url = (l: Lang) => SITE_URL + (l === defaultLang ? path : path === "/" ? `/${l}` : `/${l}${path}`);
  const deUrl = url("de");
  return [
    { rel: "canonical", href: url(lang) },
    ...langs.map((l) => ({ rel: "alternate", hrefLang: l, href: url(l) })),
    { rel: "alternate", hrefLang: "x-default", href: deUrl },
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
