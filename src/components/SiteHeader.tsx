import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPublicBlog } from "@/lib/cms/public.functions";
import { langs, useI18n, localeParam } from "@/lib/i18n";
import brandMark from "@/assets/brand-mark.png";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { t, lang } = useI18n();
  const lp = localeParam(lang);
  const location = useLocation();
  const slug = location.pathname.match(/\/blog\/([^/]+)\/?$/)?.[1];
  const { data: blog } = useQuery({ queryKey: ["cms-language-links"], queryFn: () => getPublicBlog({ data: {} }), enabled: Boolean(slug) });
  const currentPost = blog?.posts.find(p => p.slug === slug && p.locale === lang);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-3 gap-y-4 px-4 py-4 sm:px-6 lg:flex lg:justify-between">
        <Link to="/{-$locale}" params={{ locale: lp }} className="flex items-center gap-2 whitespace-nowrap font-display text-base font-bold sm:text-lg">
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
          <Link to="/{-$locale}" params={{ locale: lp }} hash="leistungen" className="site-nav-link py-2">{t.nav.services}</Link>
          <Link to="/{-$locale}" params={{ locale: lp }} hash="referenzen" className="site-nav-link py-2">{t.nav.stories}</Link>
          <Link to="/{-$locale}" params={{ locale: lp }} hash="ueber-mich" className="site-nav-link py-2">{t.nav.about}</Link>
          <Link to="/{-$locale}/blog" params={{ locale: lp }} className="site-nav-link py-2">{t.nav.blog}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <nav aria-label={t.blogPage.switchLabel} className="flex items-center text-xs font-medium tracking-widest">
            {langs.map((l, i) => (
              <span key={l} className="flex items-center">
                {i > 0 && <span aria-hidden className="mx-1.5 text-border">/</span>}
                <Link
                  to="."
                  params={(prev: Record<string, string | undefined>) => ({ ...prev, locale: localeParam(l), ...(slug ? { slug: blog?.posts.find(p => p.translation_group === currentPost?.translation_group && p.locale === l)?.slug ?? slug } : {}) })}
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
          <Link to="/{-$locale}" params={{ locale: lp }} hash="kontakt">
            {t.nav.contact}
          </Link>
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
        <Link to="/{-$locale}/blog" params={{ locale: lp }} className={cls}>{t.footerLinks.blog}</Link>
        <Link to="/{-$locale}/impressum" params={{ locale: lp }} className={cls}>{t.footerLinks.imprint}</Link>
        <Link to="/{-$locale}/datenschutz" params={{ locale: lp }} className={cls}>{t.footerLinks.privacy}</Link>
        <Link to="/auth" className={cls}>CMS</Link>
      </nav>
    </footer>
  );
}
