import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";

export function LegalPage({ kind }: { kind: "imprint" | "privacy" }) {
  const { t } = useI18n();
  const d = t.legal[kind];
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-5xl font-bold">{d.title}</h1>
        <p className="mt-4 text-muted-foreground">{d.sub}</p>
        <div className="mt-12 space-y-8">
          {d.sections.map((s) => (
            <section key={s.h} className="rounded-3xl border border-border bg-card p-8">
              <h2 className="font-display text-xl font-bold">{s.h}</h2>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{s.p}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
