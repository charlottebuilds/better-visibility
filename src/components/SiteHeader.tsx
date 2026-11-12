import { Link } from "@tanstack/react-router";
import { PUBLIC_CMS_ENABLED } from "@/lib/public-site";
import { langs, useI18n, localeParam } from "@/lib/i18n";
import brandMark from "@/assets/brand-mark.png";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/components/ContactActions";
import { openCookieSettings } from "@/lib/consent";

export function SiteHeader({ postTranslations }: { postTranslations?: Array<{ locale: string; slug: string }> } = {}) {
  const { t, lang } = useI18n();
  const lp = localeParam(lang);
  // On articles, only languages with a published translation are offered and linked.
  const shownLangs = postTranslations ? langs.filter(l => postTranslations.some(p => p.locale === l)) : langs;
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-3 gap-y-4 px-4 py-4 sm:px-6 lg:flex lg:justify-between">
        <Link to="/{-$locale}/" params={{ locale: lp }} className="flex items-center gap-2 whitespace-nowrap font-display text-base font-bold sm:text-lg">
          <img
            src={brandMark}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-[9px] ring-1 ring-border"
          />
          better<span className="text-gradient">visibility</span>
        </Link>
        <nav aria-label={t.navigationLabel} className="order-3 col-span-2 grid grid-cols-4 items-center gap-1 text-center text-xs text-muted-foreground sm:text-sm lg:order-none lg:flex lg:gap-5">
          <Link to="/{-$locale}/" params={{ locale: lp }} hash="leistungen" className="site-nav-link py-2">{t.nav.services}</Link>
          <Link to="/{-$locale}/" params={{ locale: lp }} hash="referenzen" className="site-nav-link py-2">{t.nav.stories}</Link>
          <Link to="/{-$locale}/" params={{ locale: lp }} hash="ueber-mich" className="site-nav-link py-2">{t.nav.about}</Link>
          {PUBLIC_CMS_ENABLED ? <Link to="/{-$locale}/blog/" params={{ locale: lp }} className="site-nav-link py-2">{t.nav.blog}</Link> : <Link to="/{-$locale}/" params={{ locale: lp }} hash="kontakt" className="site-nav-link py-2">{t.nav.contact}</Link>}
        </nav>
        <div className="flex items-center gap-3">
          <nav aria-label={t.blogPage.switchLabel} className="flex items-center text-xs font-medium tracking-widest">
            {shownLangs.map((l, i) => (
              <span key={l} className="flex items-center">
                {i > 0 && <span aria-hidden className="mx-1.5 text-border">/</span>}
                <Link
                  to="./"
                  params={(prev: Record<string, string | undefined>) => ({ ...prev, locale: localeParam(l), ...(postTranslations ? { slug: postTranslations.find(p => p.locale === l)!.slug } : {}) })}
                  hrefLang={l}
                  aria-current={lang === l ? "true" : undefined}
                  className={`uppercase transition-colors ${lang === l ? "text-foreground" : "text-muted-foreground hover:text-accent"}`}
                >
                  {l}
                </Link>
              </span>
            ))}
          </nav>
          <Button asChild className="hidden rounded-full bg-gradient-brand px-4 py-2 font-semibold text-primary-foreground xl:inline-flex">
          <a href={whatsappLink(t.whatsapp.text)} target="_blank" rel="noopener noreferrer">
            {t.nav.contact}
          </a>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t, lang } = useI18n();
  const lp = localeParam(lang);
  const cls = "transition-colors hover:text-accent";
  return (
    <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} better-visibility.com · {t.footer}</p>
      <nav aria-label="Footer" className="mt-3 flex justify-center gap-5 text-xs text-foreground/50">
        {PUBLIC_CMS_ENABLED && <Link to="/{-$locale}/blog/" params={{ locale: lp }} className={cls}>{t.footerLinks.blog}</Link>}
        <Link to="/{-$locale}/impressum/" params={{ locale: lp }} className={cls}>{t.footerLinks.imprint}</Link>
        <Link to="/{-$locale}/datenschutz/" params={{ locale: lp }} className={cls}>{t.footerLinks.privacy}</Link>
        {PUBLIC_CMS_ENABLED && <Link to="/auth/" className={cls}>CMS</Link>}
        <button type="button" onClick={openCookieSettings} className={cls}>{t.cookie.footerLink}</button>
      </nav>
    </footer>
  );
}
