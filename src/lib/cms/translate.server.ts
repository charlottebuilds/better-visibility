import { createOpenAI } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";
import type { Locale } from "./translate-html";

export const TranslationSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  meta_title: z.string(),
  meta_description: z.string(),
  cover_alt: z.string(),
  content: z.string(),
});
export type Translation = z.infer<typeof TranslationSchema>;

const LANG: Record<Locale, string> = { de: "Deutsch", en: "Englisch (US-B2B)", es: "Spanisch (neutral, B2B)" };

const instructions = (from: Locale, to: Locale) => `Du bist Fachübersetzerin für B2B-Fachartikel zu SEO und GEO (Generative Engine Optimization).
Übersetze von ${LANG[from]} nach ${LANG[to]}. Regeln, strikt:
- Natürliche, fachlich korrekte Sprache, keine wörtliche Übersetzung, wo sie unnatürlich klingt. Etablierte Fachbegriffe (SEO, GEO, AI Overviews, SERP, E-E-A-T, Core Web Vitals usw.) und Markennamen (Better Visibility, Google, ChatGPT, Perplexity …) unverändert lassen.
- Nichts erfinden, ergänzen oder weglassen. Zahlen, Prozentwerte, Jahreszahlen, Quellen, Zitate und Fakten unverändert übernehmen (nur Dezimal-/Tausendertrennzeichen an die Zielsprache anpassen).
- HTML in "content": exakt dieselben Elemente in derselben Reihenfolge und Verschachtelung. Alle Attribute (href, src, class, target, rel …) Zeichen für Zeichen unverändert; nur die Attribute alt und title übersetzen. Keine Elemente hinzufügen oder entfernen, keine Markdown-Syntax.
- Leere Felder bleiben leer.
- "slug": neuer, sprachgerechter URL-Slug aus dem übersetzten Titel, nur a-z, 0-9 und Bindestriche, max. 80 Zeichen.
- meta_title max. 60 Zeichen, meta_description max. 155 Zeichen.`;

export class TranslationError extends Error {}

export async function generateTranslation(
  input: Omit<Translation, "slug">,
  from: Locale,
  to: Locale,
): Promise<Translation> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new TranslationError("KI ist nicht konfiguriert.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions: instructions(from, to),
    messages: [{ role: "user", content: JSON.stringify(input) }],
    output: Output.object({ schema: TranslationSchema }),
    maxRetries: 0,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "medium",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  } as Parameters<typeof streamText>[0]);
  let error: unknown;
  for await (const part of result.fullStream) if (part.type === "error") error = part.error;
  if (error) {
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 402) throw new TranslationError("KI-Guthaben aufgebraucht – bitte unter Einstellungen → Plans & credits aufladen.");
    if (status === 429) throw new TranslationError("Zu viele Anfragen – bitte in einer Minute erneut versuchen.");
    if (status === 403) throw new TranslationError("Die KI-Übersetzung wurde vom Anbieter abgelehnt.");
    console.error("[translate] gateway error", status);
    throw new TranslationError("Die KI-Übersetzung ist fehlgeschlagen.");
  }
  const finish = await result.finishReason;
  if (finish !== "stop") {
    console.error("[translate] incomplete output", finish);
    throw new TranslationError("Die Übersetzung war unvollständig (Artikel evtl. zu lang). Nichts wurde gespeichert.");
  }
  const parsed = TranslationSchema.safeParse(await result.output);
  if (!parsed.success) throw new TranslationError("Die KI-Antwort hatte ein ungültiges Format. Nichts wurde gespeichert.");
  return parsed.data;
}
