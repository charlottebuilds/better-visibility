import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-lg font-bold">
          better<span className="text-gradient">visibility</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="/#leistungen" className="hidden hover:text-foreground sm:inline">Leistungen</a>
          <a href="/#ablauf" className="hidden hover:text-foreground sm:inline">Ablauf</a>
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
          <a href="/#kontakt" className="rounded-full bg-gradient-brand px-4 py-2 font-semibold text-primary-foreground">
            Kontakt
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} better-visibility.com · SEO & GEO Beratung
    </footer>
  );
}
