import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import caseRank from "@/assets/case-rank-tracking.png";
import caseGa4 from "@/assets/case-ga4.png";
import caseAhrefs from "@/assets/case-ahrefs.png";
import caseGsc from "@/assets/case2-gsc.png";
import caseHealth from "@/assets/case2-health.png";
import portrait from "@/assets/portrait-charlotte.png";
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
  const cs = t.caseStudy;
  const cases = [
    { d: cs, imgs: [{ src: caseRank, w: 1408, h: 480 }, { src: caseGa4, w: 1008, h: 656 }, { src: caseAhrefs, w: 1168, h: 720 }] },
    { d: t.caseStudy2, imgs: [{ src: caseGsc, w: 1280, h: 528 }, { src: caseHealth, w: 1168, h: 576 }] },
  ];
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

        {cases.map((c, ci) => (
        <div key={ci} className="mt-10 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="grid gap-10 border-b border-border p-8 md:grid-cols-[auto_1fr] md:items-end md:gap-12 md:p-12">
            <div>
              <p className="text-xs uppercase tracking-widest text-accent">0{ci + 1} · {c.d.tag}</p>
              <p className="mt-2 text-xs text-foreground/60">{c.d.client}</p>
              <p className="mt-4 whitespace-nowrap font-display text-6xl font-bold leading-none text-gradient md:text-8xl">{c.d.hero}</p>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground">{c.d.heroLabel}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {c.d.stats.map((s, i) => (
                <div key={i} className="rounded-2xl bg-secondary p-5">
                  <p className="whitespace-nowrap font-display text-3xl font-bold">{s.k}</p>
                  <p className="mt-2 text-xs uppercase tracking-wider text-foreground/70">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5 border-b border-border bg-secondary/60 p-8 md:flex-row md:items-center md:gap-6 md:p-12">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand font-display text-sm font-bold text-primary-foreground">
              {c.d.badge}
            </span>
            <div>
              <p className="font-display text-xl font-semibold">{c.d.aiTitle}</p>
              <p className="mt-2 max-w-3xl text-muted-foreground">{c.d.aiText}</p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">{cs.evidenceTitle}</p>
            <figure className="mt-6">
              <img src={c.imgs[0].src} alt={c.d.captions[0]} width={c.imgs[0].w} height={c.imgs[0].h} loading="lazy" className="w-full rounded-2xl border border-border" />
              <figcaption className="mt-3 text-sm text-foreground/70">{c.d.captions[0]}</figcaption>
            </figure>
            <div className={`mt-8 grid items-start gap-8 ${c.imgs.length > 2 ? "md:grid-cols-2" : ""}`}>
              {c.imgs.slice(1).map((e, i) => (
                <figure key={i}>
                  <img src={e.src} alt={c.d.captions[i + 1]} width={e.w} height={e.h} loading="lazy" className="w-full rounded-2xl border border-border" />
                  <figcaption className="mt-3 text-sm text-foreground/70">{c.d.captions[i + 1]}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
        ))}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {t.stories.map((s, i) => (
            <figure key={i} className="flex flex-col rounded-3xl border border-border bg-card p-8">
              <p className="whitespace-nowrap font-display text-5xl font-bold text-gradient">{s.k}</p>
              <p className="mt-1 text-sm uppercase tracking-widest text-accent">{s.l}</p>
              <blockquote className="mt-6 flex-1 text-muted-foreground">{t.quotes.o}{s.q}{t.quotes.c}</blockquote>
              <figcaption className="mt-6 font-semibold">{s.c}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="ueber-mich" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-10 rounded-3xl border border-border bg-card p-8 md:grid-cols-[1fr_2fr] md:p-12">
          <div className="relative">
            <img src={portrait} alt={t.aboutImgAlt} width={1024} height={1024} className="aspect-square w-full rounded-3xl object-cover glow" />
            <div className="absolute bottom-4 left-4 rounded-2xl bg-gradient-brand px-5 py-3 text-primary-foreground shadow-lg">
              <p className="font-display text-2xl font-bold leading-none">10+</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest">{t.years}</p>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold">{t.aboutTitle}</h2>
            <p className="mt-2 font-display text-lg text-accent">{t.aboutRole}</p>
            <p className="mt-6 text-lg text-muted-foreground">{t.aboutP1}</p>
            <p className="mt-4 text-lg text-muted-foreground">{t.aboutP2}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {t.skills.map((s) => (
                <span key={s} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-foreground/80">{s}</span>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">{t.languages}</p>
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
