import { Link } from "@tanstack/react-router";
import { langs, useI18n } from "@/lib/i18n";
import brandMark from "@/assets/brand-mark.png";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-3 gap-y-4 px-4 py-4 sm:px-6 lg:flex lg:justify-between">
        <Link to="/" className="flex items-center gap-2 whitespace-nowrap font-display text-base font-bold sm:text-lg">
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
          <Link to="/" hash="leistungen" className="site-nav-link py-2">{t.nav.services}</Link>
          <Link to="/" hash="referenzen" className="site-nav-link py-2">{t.nav.stories}</Link>
          <Link to="/" hash="ueber-mich" className="site-nav-link py-2">{t.nav.about}</Link>
          <Link to="/blog" className="site-nav-link py-2">{t.nav.blog}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex rounded-full border border-border p-0.5 text-xs">
            {langs.map((l) => (
              <Button
                key={l}
                variant="ghost"
                size="sm"
                onClick={() => setLang(l)}
                aria-label={`Sprache ${l.toUpperCase()}`}
                aria-pressed={lang === l}
                className={`h-7 rounded-full px-2 py-1 uppercase ${lang === l ? "bg-secondary text-foreground" : "hover:text-foreground"}`}
              >
                {l}
              </Button>
            ))}
          </div>
          <Button asChild className="hidden rounded-full bg-gradient-brand px-4 py-2 font-semibold text-primary-foreground xl:inline-flex">
          <Link to="/" hash="kontakt">
            {t.nav.contact}
          </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} better-visibility.com · {t.footer}
    </footer>
  );
}
