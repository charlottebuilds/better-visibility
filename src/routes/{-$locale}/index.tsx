import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import caseRank from "@/assets/case-rank-tracking.png";
import caseGa4 from "@/assets/case-ga4.png";
import caseAhrefs from "@/assets/case-ahrefs.png";
import caseGsc from "@/assets/case2-gsc.png";
import caseHealth from "@/assets/case2-health.png";
import portrait from "@/assets/portrait-charlotte-subtle.jpg";
import { posts } from "@/lib/posts";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { useI18n, getDict, langFromParam, isValidLocaleParam, seoLinks, localeParam } from "@/lib/i18n";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const Route = createFileRoute("/{-$locale}/")({
  beforeLoad: ({ params }) => { if (!isValidLocaleParam(params.locale)) throw notFound(); },
  head: ({ params }) => {
    const lang = langFromParam(params.locale);
    const m = getDict(lang).meta.home;
    return {
      meta: [
        { title: m.title },
        { name: "description", content: m.description },
        { property: "og:title", content: m.ogTitle },
        { property: "og:description", content: m.description },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: { de: "de_DE", en: "en_US", es: "es_ES" }[lang] },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: seoLinks("/", lang),
    };
  },
  component: Index,
});

function Index() {
  const { t, lang } = useI18n();
  const lp = localeParam(lang);
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
          <img src={hero} alt={t.heroImgAlt} width={1600} height={1008} className="rounded-3xl glow" />
        </div>
      </section>

      <section id="leistungen" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-4xl font-bold">{t.nav.services}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.servicesIntro}</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {t.services.map((s, i) => (
            <div key={i} className="rounded-3xl border border-border bg-card p-8 transition hover:-translate-y-1 hover:border-primary">
              <span className="font-display text-sm text-accent">0{i + 1} · {s.s}</span>
              <h3 className="mt-3 text-2xl font-bold">{s.t}</h3>
              <p className="mt-3 text-muted-foreground">{s.d}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {s.f.map((f) => <li key={f} className="flex gap-2"><span className="text-accent">✓</span>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div id="pakete" className="mt-20">
          <h3 className="text-3xl font-bold">{t.packagesTitle}</h3>
          <p className="mt-3 text-muted-foreground">{t.packagesSub}</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {t.packages.map((pk, i) => (
              <div key={i} className={`relative flex flex-col rounded-3xl border bg-card p-8 ${i === 2 ? "border-primary glow" : "border-border"}`}>
                {i === 2 && <span className="absolute -top-3 left-8 rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-primary-foreground">{t.popular}</span>}
                <p className="text-xs uppercase tracking-widest text-accent">{pk.k}</p>
                <p className="mt-1 font-display text-xl font-bold">{pk.n}</p>
                <p className="mt-1 text-sm text-muted-foreground">{pk.d}</p>
                <p className="mt-6 font-display text-4xl font-bold text-gradient">{pk.p}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-foreground/60">{pk.u} · {t.priceNote}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  {pk.f.map((f) => <li key={f} className="flex gap-2"><span className="text-accent">✓</span>{f}</li>)}
                </ul>
                <a href="#kontakt" className={`mt-8 rounded-full px-6 py-3 text-center font-semibold ${i === 2 ? "bg-gradient-brand text-primary-foreground" : "border border-border hover:bg-secondary"}`}>{t.choose}</a>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-6 rounded-3xl border border-dashed border-accent bg-secondary/60 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-xl font-bold">{t.custom.n} <span className="ml-2 text-sm font-normal text-accent">{t.custom.p}</span></p>
              <p className="mt-2 max-w-xl text-muted-foreground">{t.custom.d}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {t.custom.f.map((f) => <li key={f} className="rounded-full border border-border bg-card px-3 py-1 text-xs">{f}</li>)}
              </ul>
            </div>
            <a href="#kontakt" className="shrink-0 rounded-full bg-gradient-brand px-6 py-3 text-center font-semibold text-primary-foreground">{t.custom.cta}</a>
          </div>
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
            <div className="grid gap-4 sm:grid-cols-2">
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
              {ci === 2 ? (
                <div className="aspect-[1280/210] overflow-hidden rounded-2xl border border-border">
                  <img src={caseGsc} alt="Google Search Console: 100.247 clicks · 4,91 Mio. impressions · CTR 2 % · position 12,9" width={1280} height={528} loading="lazy" className="w-full" />
                </div>
              ) : (
              <img src={c.imgs[0]?.src} alt={c.d.captions[0]} width={c.imgs[0]?.w} height={c.imgs[0]?.h} loading="lazy" className="w-full rounded-2xl border border-border" />
              )}
              {ci !== 1 && <figcaption className="mt-3 text-sm text-foreground/70">{c.d.captions[0]}</figcaption>}
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

      </section>

      <section id="ueber-mich" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12">
          <div className="relative mx-auto w-full max-w-72 md:max-w-none">
            <img src={portrait} alt={t.aboutImgAlt} width={1024} height={1024} className="aspect-square w-full rounded-3xl object-cover" />
            <div className="absolute bottom-4 left-4 rounded-2xl bg-gradient-brand px-5 py-3 text-primary-foreground shadow-lg">
              <p className="font-display text-2xl font-bold leading-none">10+</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest">{t.years}</p>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold">{t.aboutTitle}</h2>
            <p className="mt-4 font-display text-2xl font-bold">Charlotte Götz</p>
            <p className="mt-2 font-display text-lg text-accent">{t.aboutRole}</p>
            <p className="mt-4 text-muted-foreground">{t.aboutIntro}</p>
            <Accordion key={t.aboutTitle} type="single" collapsible className="mt-6 border-t border-border">
              <AccordionItem value="background">
                <AccordionTrigger className="gap-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t.aboutDetails.background}</AccordionTrigger>
                <AccordionContent className="space-y-3 leading-relaxed text-muted-foreground">
                  <p>{t.aboutP1}</p>
                  <p>{t.aboutP2}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="skills">
                <AccordionTrigger className="gap-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t.aboutDetails.skills}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {t.skills.map((s) => (
                      <span key={s} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-foreground/80">{s}</span>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between">
          <h2 className="text-4xl font-bold">{t.blogTitle}</h2>
          <Link to="/{-$locale}/blog" params={{ locale: lp }} className="text-accent hover:underline">{t.allPosts}</Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.slice(0, 2).map((p) => (
            <Link key={p.slug} to="/{-$locale}/blog/$slug" params={{ locale: lp, slug: p.slug }} className="group overflow-hidden rounded-3xl border border-border bg-card">
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
