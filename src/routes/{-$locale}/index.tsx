import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import caseRank from "@/assets/case-rank-tracking.png";
import caseGa4 from "@/assets/case-ga4.png";
import caseAhrefs from "@/assets/case-ahrefs.png";
import caseGsc from "@/assets/case2-gsc.png";
import caseHealth from "@/assets/case2-health.png";
import portrait from "@/assets/portrait-charlotte-subtle.jpg";
import { getWebsiteBlog } from "@/lib/cms/website-data";
import { PUBLIC_CMS_ENABLED } from "@/lib/public-site";
import { mediaUrl } from "@/lib/cms/types";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { useI18n, getDict, langFromParam, isValidLocaleParam, seoLinks, localeParam, SITE_URL } from "@/lib/i18n";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { BookingDialog, CONTACT_EMAIL, contactMailto, packageMailto, whatsappLink } from "@/components/ContactActions";
import { siteGraph } from "@/lib/schema";
import { BASE_PRICES_EUR, CURRENCIES, convertPrice, formatPrice, setCurrency, useCurrency, useRates } from "@/lib/currency";
import { PenLine, Layers, ChartNoAxesCombined, ArrowUpRight, MessageCircle, Mail, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/{-$locale}/")({
  beforeLoad: ({ params }) => { if (!isValidLocaleParam(params.locale)) throw notFound(); },
  loader: ({ params }) => getWebsiteBlog({ data: { locale: langFromParam(params.locale) } }),
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
      links: seoLinks("/", lang, params.locale === "de"),
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify(siteGraph({
          lang,
          pageUrl: SITE_URL + (params.locale ? `/${params.locale}` : "/"),
          description: m.description,
          skills: getDict(lang).skills,
          offerCatalogName: getDict(lang).packagesTitle,
          offers: getDict(lang).packages,
        })),
      }],
    };
  },
  component: Index,
});

function Index() {
  const { posts } = Route.useLoaderData();
  const { t, lang } = useI18n();
  const currency = useCurrency();
  const rates = useRates();
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
              <BookingDialog className="cta-hover rounded-full bg-gradient-brand px-6 py-3 font-semibold text-primary-foreground glow">{t.hero.cta}</BookingDialog>
              <a href="#leistungen" className="cta-hover rounded-full border border-border px-6 py-3 font-semibold hover:border-accent hover:bg-secondary">{t.nav.services}</a>
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
            {t.packages.map((pk, i) => {
              const price = convertPrice(BASE_PRICES_EUR[i] ?? 0, currency, rates);
              const shown = formatPrice(price.amount, price.currency, t.blogPage.dateLocale);
              return (
              <div key={i} className={`relative flex flex-col rounded-3xl border bg-card p-8 ${i === 2 ? "border-primary glow" : "border-border"}`}>
                {i === 2 && <span className="absolute -top-3 left-8 rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-primary-foreground">{t.popular}</span>}
                <p className="text-xs uppercase tracking-widest text-accent">{pk.k}</p>
                <p className="mt-1 font-display text-xl font-bold">{pk.n}</p>
                <p className="mt-1 text-sm text-muted-foreground">{pk.d}</p>
                <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
                  <p className="font-display text-4xl font-bold tabular-nums"><span className="mr-1.5 text-base font-semibold text-muted-foreground">{t.from}</span><data className="text-gradient" value={price.amount}>{shown}</data></p>
                  <div role="radiogroup" aria-label={t.currencyLabel} className="flex rounded-full border border-border p-0.5 text-[11px] font-semibold">
                    {CURRENCIES.map((c) => (
                      <button key={c} type="button" role="radio" aria-checked={currency === c} onClick={() => setCurrency(c)}
                        className={`rounded-full px-2 py-1 transition-colors ${currency === c ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-xs uppercase tracking-wider text-foreground/60">{pk.u} · {t.priceNote}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  {pk.f.map((f) => <li key={f} className="flex gap-2"><span className="text-accent">✓</span>{f}</li>)}
                </ul>
                <a href={packageMailto(t, pk.n, `${t.mailPrice}: ${t.from} ${shown} (${pk.u}, ${t.priceNote})`)} className={`cta-hover mt-8 rounded-full px-6 py-3 text-center font-semibold ${i === 2 ? "bg-gradient-brand text-primary-foreground" : "border border-border hover:border-accent hover:bg-secondary"}`}>{t.choose}</a>
              </div>
            );})}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t.fxNote}
            {currency !== "EUR" && rates?.date && <> {t.fxUpdated} {new Date(rates.date).toLocaleDateString(t.blogPage.dateLocale)} (EZB/ECB).</>}
          </p>
          <div className="mt-5 flex flex-col gap-6 rounded-3xl border border-dashed border-accent bg-secondary/60 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-xl font-bold">{t.custom.n} <span className="ml-2 text-sm font-normal text-accent">{t.custom.p}</span></p>
              <p className="mt-2 max-w-xl text-muted-foreground">{t.custom.d}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {t.custom.f.map((f) => <li key={f} className="rounded-full border border-border bg-card px-3 py-1 text-xs">{f}</li>)}
              </ul>
            </div>
            <a href={packageMailto(t, t.custom.n)} className="cta-hover shrink-0 rounded-full bg-gradient-brand px-6 py-3 text-center font-semibold text-primary-foreground">{t.custom.cta}</a>
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
                  <div className={`${c.imgs.length > 2 ? "aspect-[16/10]" : ""} overflow-hidden rounded-2xl border border-border`}>
                    <img src={e.src} alt={c.d.captions[i + 1]} width={e.w} height={e.h} loading="lazy" className={`w-full ${c.imgs.length > 2 ? "h-full scale-[1.06] object-cover" : ""}`} />
                  </div>
                  <figcaption className="mt-3 text-sm text-foreground/70">{c.d.captions[i + 1]}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
        ))}

      </section>

      <section id="ueber-mich" className="about-section mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-start gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-12">
          <div className="about-portrait group relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-border md:max-w-none">
            <img src={portrait} alt={t.aboutImgAlt} width={1024} height={1024} className="aspect-[4/5] w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.025]" />
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 border-t border-border bg-background/90 px-6 py-5 backdrop-blur-md">
              <p className="font-display text-4xl font-bold text-gradient">10+</p>
              <p className="max-w-32 text-sm text-foreground">{t.years}</p>
              <ArrowUpRight aria-hidden="true" className="ml-auto h-6 w-6 text-accent" />
            </div>
          </div>
          <div className="min-w-0 md:py-2">
            <h2 className="flex items-center gap-3 text-sm font-semibold text-accent"><span aria-hidden="true" className="h-px w-8 bg-gradient-brand" />{t.aboutTitle}</h2>
            <p className="mt-4 font-display text-4xl font-bold leading-tight lg:text-5xl">Charlotte <span className="text-gradient">Götz</span></p>
            <p className="mt-3 text-sm font-semibold text-foreground/80">{t.aboutRole}</p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">{t.aboutIntro}</p>
            <ul className="mt-6 grid gap-3 border-y border-border py-5">
              {t.aboutProof.map((proof, i) => {
                const Icon = [PenLine, Layers, ChartNoAxesCombined][i] ?? PenLine;
                return <li key={proof} className="about-proof flex items-center gap-3 text-sm"><Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />{proof}</li>;
              })}
            </ul>
            <Accordion key={t.aboutTitle} type="single" collapsible className="mt-4">
              <AccordionItem value="background" className="about-detail">
                <AccordionTrigger className="about-trigger gap-4 px-3 py-5 text-base font-semibold hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex items-center gap-4"><span aria-hidden="true" className="text-xs font-normal text-accent">01</span>{t.aboutDetails.background}</span></AccordionTrigger>
                <AccordionContent className="space-y-3 px-3 leading-relaxed text-muted-foreground">
                  <p>{t.aboutP1}</p>
                  <p>{t.aboutP2}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="skills" className="about-detail">
                <AccordionTrigger className="about-trigger gap-4 px-3 py-5 text-base font-semibold hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex items-center gap-4"><span aria-hidden="true" className="text-xs font-normal text-accent">02</span>{t.aboutDetails.skills}</span></AccordionTrigger>
                <AccordionContent className="px-3 pt-2">
                  <ul className="flex flex-wrap gap-2">
                    {t.skills.map((s) => (
                      <li key={s} className="about-skill rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground/80">{s}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {PUBLIC_CMS_ENABLED && <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between">
          <h2 className="text-4xl font-bold">{t.blogTitle}</h2>
          <Link to="/{-$locale}/blog/" params={{ locale: lp }} className="text-accent hover:underline">{t.allPosts}</Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.slice(0, 2).map((p) => (
            <Link key={p.slug} to="/{-$locale}/blog/$slug/" params={{ locale: lp, slug: p.slug }} className="group overflow-hidden rounded-3xl border border-border bg-card">
              {p.cover_path && <img src={mediaUrl(p.cover_path)} alt={p.cover_alt} loading="lazy" width={1200} height={752} className="aspect-[16/9] w-full object-cover transition group-hover:scale-105" />}
              <div className="p-6">
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className="mt-2 text-muted-foreground">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>}

      <section id="kontakt" className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl bg-gradient-brand p-8 text-primary-foreground md:p-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold md:text-5xl">{t.contactTitle}</h2>
            <p className="mx-auto mt-4 max-w-lg opacity-90">{t.contactP}</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="flex flex-col rounded-2xl border border-primary-foreground/25 bg-background/10 p-6 text-left backdrop-blur-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/15"><MessageCircle aria-hidden="true" className="h-5 w-5" /></span>
              <p className="mt-4 font-display text-lg font-semibold">{t.contactWays.whatsappTitle}</p>
              <p className="mt-2 text-sm opacity-90">{t.contactWays.whatsappText}</p>
              <a href={whatsappLink(t.whatsapp.text)} target="_blank" rel="noopener noreferrer" className="cta-hover mt-auto inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 font-semibold hover:bg-background/15">{t.contactWays.whatsappCta}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>
            </div>
            <div className="flex flex-col rounded-2xl border border-primary-foreground/25 bg-background/10 p-6 text-left backdrop-blur-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/15"><Mail aria-hidden="true" className="h-5 w-5" /></span>
              <p className="mt-4 font-display text-lg font-semibold">{t.contactWays.mailTitle}</p>
              <p className="mt-2 text-sm opacity-90">{t.contactWays.mailText}</p>
              <p className="mt-3 mb-4 break-all text-xs text-primary-foreground/80">{CONTACT_EMAIL}</p>
              <a href={contactMailto(t)} className="cta-hover mt-auto inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 font-semibold hover:bg-background/15">{t.contactWays.mailCta}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>
            </div>
            <div className="flex flex-col rounded-2xl border border-primary-foreground/25 bg-background/10 p-6 text-left backdrop-blur-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/15"><CalendarDays aria-hidden="true" className="h-5 w-5" /></span>
              <p className="mt-4 font-display text-lg font-semibold">{t.contactWays.bookingTitle}</p>
              <p className="mt-2 text-sm opacity-90">{t.contactWays.bookingText}</p>
              <BookingDialog className="cta-hover mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-background px-6 py-3 font-semibold text-foreground hover:bg-primary-foreground">{t.contactWays.bookingCta}</BookingDialog>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
