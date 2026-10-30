import { Link } from "@tanstack/react-router";
import { langs, useI18n } from "@/lib/i18n";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="font-display text-lg font-bold">
          better<span className="text-gradient">visibility</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <a href="/#leistungen" className="hidden hover:text-foreground lg:inline">{t.nav.services}</a>
          <a href="/#referenzen" className="hidden hover:text-foreground lg:inline">{t.nav.stories}</a>
          <a href="/#ueber-mich" className="hidden hover:text-foreground md:inline">{t.nav.about}</a>
          <Link to="/blog" className="hover:text-foreground">{t.nav.blog}</Link>
          <div className="flex rounded-full border border-border p-0.5 text-xs">
            {langs.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-label={`Sprache ${l.toUpperCase()}`}
                className={`rounded-full px-2 py-1 uppercase ${lang === l ? "bg-secondary text-foreground" : "hover:text-foreground"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <a href="/#kontakt" className="hidden rounded-full bg-gradient-brand px-4 py-2 font-semibold text-primary-foreground sm:inline">
            {t.nav.contact}
          </a>
        </nav>
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
