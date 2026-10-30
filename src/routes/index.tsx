import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { posts } from "@/lib/posts";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

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

const services = [
  { t: "SEO-Beratung", d: "Audit, Strategie und Keyword-Analyse – damit Sie wissen, wo Ihr Potenzial liegt." },
  { t: "GEO-Beratung", d: "So wird Ihre Marke in ChatGPT, Perplexity und Google AI Overviews genannt." },
  { t: "SEO-Kampagnen", d: "Technische Optimierung, Content und Linkaufbau – wir setzen um." },
  { t: "GEO-Kampagnen", d: "Strukturierte Inhalte, Erwähnungen und Monitoring Ihrer KI-Sichtbarkeit." },
];
const steps = ["Analyse", "Strategie", "Umsetzung", "Messen & Optimieren"];

function Index() {
  return (
    <div>
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="mb-4 inline-block rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-accent">SEO · GEO</p>
            <h1 className="text-5xl font-bold leading-[1.05] md:text-6xl">
              Gefunden werden – <span className="text-gradient">bei Google und in der KI.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Beratung und Umsetzung von SEO- und GEO-Kampagnen, die Ihre Marke dort sichtbar machen, wo Kunden suchen.
            </p>
            <div className="mt-8 flex gap-3">
              <a href="#kontakt" className="rounded-full bg-gradient-brand px-6 py-3 font-semibold text-primary-foreground glow">Erstgespräch buchen</a>
              <a href="#leistungen" className="rounded-full border border-border px-6 py-3 font-semibold hover:bg-secondary">Leistungen</a>
            </div>
          </div>
          <img src={hero} alt="Lupe und KI-Netzwerk in Lila und Orange" width={1600} height={1008} className="rounded-3xl glow" />
        </div>
      </section>

      <section id="leistungen" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-4xl font-bold">Leistungen</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {services.map((s, i) => (
            <div key={s.t} className="rounded-3xl border border-border bg-card p-8 transition hover:-translate-y-1 hover:border-primary">
              <span className="font-display text-sm text-accent">0{i + 1}</span>
              <h3 className="mt-3 text-2xl font-bold">{s.t}</h3>
              <p className="mt-3 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ablauf" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-4xl font-bold">So arbeiten wir</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s} className="rounded-3xl bg-secondary p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand font-bold text-primary-foreground">{i + 1}</div>
              <p className="mt-4 font-display text-xl font-semibold">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between">
          <h2 className="text-4xl font-bold">Aus dem Blog</h2>
          <Link to="/blog" className="text-accent hover:underline">Alle Beiträge →</Link>
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
          <h2 className="text-4xl font-bold md:text-5xl">Bereit für mehr Sichtbarkeit?</h2>
          <p className="mx-auto mt-4 max-w-lg opacity-90">Lassen Sie uns in einem kostenlosen Erstgespräch Ihr Potenzial besprechen.</p>
          <a href="mailto:hallo@better-visibility.com" className="mt-8 inline-block rounded-full bg-background px-8 py-3 font-semibold text-foreground">
            hallo@better-visibility.com
          </a>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
