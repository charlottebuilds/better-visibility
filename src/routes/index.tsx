import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { posts } from "@/lib/posts";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Better Visibility – SEO & GEO Beratung und Umsetzung" },
      { name: "description", content: "Mehr Sichtbarkeit in Google und KI-Suchen: Beratung und Umsetzung von SEO- und GEO-Kampagnen." },
      { property: "og:title", content: "Better Visibility – SEO & GEO" },
      { property: "og:description", content: "Sichtbar in Google, ChatGPT & Co. – Beratung und Umsetzung von SEO und GEO." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  return (
    <div>
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="mb-4 inline-block rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-accent">SEO · GEO</p>
            <h1 className="text-5xl font-bold leading-[1.05] md:text-6xl">
              {t.hero.h1a}<span className="text-gradient">{t.hero.h1b}</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">{t.hero.p}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#kontakt" className="rounded-full bg-gradient-brand px-6 py-3 font-semibold text-primary-foreground glow">{t.hero.cta}</a>
              <a href="#leistungen" className="rounded-full border border-border px-6 py-3 font-semibold hover:bg-secondary">{t.nav.services}</a>
            </div>
          </div>
          <img src={hero} alt="Lupe und KI-Netzwerk in Lila und Orange" width={1600} height={1008} className="rounded-3xl glow" />
        </div>
      </section>

      <section id="leistungen" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-4xl font-bold">{t.nav.services}</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {t.services.map((s, i) => (
            <div key={i} className="rounded-3xl border border-border bg-card p-8 transition hover:-translate-y-1 hover:border-primary">
              <span className="font-display text-sm text-accent">0{i + 1}</span>
              <h3 className="mt-3 text-2xl font-bold">{s.t}</h3>
              <p className="mt-3 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ablauf" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-4xl font-bold">{t.processTitle}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {t.steps.map((s, i) => (
            <div key={i} className="rounded-3xl bg-secondary p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand font-bold text-primary-foreground">{i + 1}</div>
              <p className="mt-4 font-display text-xl font-semibold">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="referenzen" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-4xl font-bold">{t.storiesTitle}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {t.stories.map((s, i) => (
            <figure key={i} className="flex flex-col rounded-3xl border border-border bg-card p-8">
              <p className="font-display text-5xl font-bold text-gradient">{s.k}</p>
              <p className="mt-1 text-sm uppercase tracking-widest text-accent">{s.l}</p>
              <blockquote className="mt-6 flex-1 text-muted-foreground">„{s.q}“</blockquote>
              <figcaption className="mt-6 font-semibold">{s.c}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="ueber-mich" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-10 rounded-3xl border border-border bg-card p-8 md:grid-cols-[1fr_2fr] md:p-12">
          <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-brand text-primary-foreground glow">
            <div className="text-center">
              <p className="font-display text-7xl font-bold">10+</p>
              <p className="mt-2 text-sm uppercase tracking-widest">{t.years}</p>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold">{t.aboutTitle}</h2>
            <p className="mt-2 font-display text-lg text-accent">{t.aboutRole}</p>
            <p className="mt-6 text-lg text-muted-foreground">{t.aboutP1}</p>
            <p className="mt-4 text-lg text-muted-foreground">{t.aboutP2}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between">
          <h2 className="text-4xl font-bold">{t.blogTitle}</h2>
          <Link to="/blog" className="text-accent hover:underline">{t.allPosts}</Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.slice(0, 2).map((p) => (
            <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group overflow-hidden rounded-3xl border border-border bg-card">
              <img src={p.image} alt={p.title} loading="lazy" width={1200} height={752} className="aspect-[16/9] w-full object-cover transition group-hover:scale-105" />
              <div className="p-6">
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className="mt-2 text-muted-foreground">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="kontakt" className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl bg-gradient-brand p-12 text-center text-primary-foreground">
          <h2 className="text-4xl font-bold md:text-5xl">{t.contactTitle}</h2>
          <p className="mx-auto mt-4 max-w-lg opacity-90">{t.contactP}</p>
          <a href="mailto:hallo@better-visibility.com" className="mt-8 inline-block rounded-full bg-background px-8 py-3 font-semibold text-foreground">
            hallo@better-visibility.com
          </a>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
