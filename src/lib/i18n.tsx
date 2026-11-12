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
/** German is the unprefixed default, so internal links never carry /de/. */
export const localeParam = (l: Lang) => (l === "de" ? undefined : l);
export const langFromParam = (p?: string): Lang => (p === "en" || p === "es" ? p : "de");
export const isValidLocaleParam = (p?: string) => p === undefined || p === "de" || p === "en" || p === "es";

/** Canonical + hreflang for a path without locale prefix. German is always the unprefixed URL
 * (/de duplicates it), and every URL ends with a slash to match the live canonical form. */
export function seoLinks(path: string, lang: Lang, _prefixedGerman = false) {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  const url = (l: Lang) => `${SITE_URL}${l === "de" ? "" : `/${l}`}${clean}/`;
  return [
    { rel: "canonical", href: url(lang) },
    ...langs.map((l) => ({ rel: "alternate", hrefLang: l, href: url(l) })),
    { rel: "alternate", hrefLang: "x-default", href: url("de") },
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
