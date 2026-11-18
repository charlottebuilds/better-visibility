import { createOpenAI } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";

const Schema = z.object({ items: z.array(z.object({ path: z.string(), text: z.string() })) });
const LANG = { en: "Englisch (US-B2B, Ansprache 'you')", es: "Spanisch (neutral, B2B, Ansprache 'usted')" } as const;

export class SiteTranslationError extends Error {}

/** Translates German website copy; every input path must come back exactly once or nothing is returned. */
export async function translateSiteTexts(items: { path: string; text: string }[], to: "en" | "es") {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new SiteTranslationError("KI ist nicht konfiguriert.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions: `Du übersetzt Website-Texte einer persönlichen SEO- & GEO-Beraterin (Charlotte Götz, Ich-Form) von Deutsch nach ${LANG[to]}.
Regeln: natürlich und überzeugend formulieren, nicht wörtlich; Fachbegriffe (SEO, GEO, E-E-A-T, AI Search …) und Marken (Better Visibility, Google, ChatGPT …) unverändert; Zahlen, Preise und Fakten unverändert (nur Trennzeichen anpassen); Zeilenumbrüche (\\n) beibehalten; nichts ergänzen oder weglassen.
Gib jedes Element mit exakt demselben "path" zurück.`,
    messages: [{ role: "user", content: JSON.stringify({ items }) }],
    output: Output.object({ schema: Schema }),
    maxRetries: 0,
    providerOptions: {
      openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] },
    },
  } as Parameters<typeof streamText>[0]);
  let error: unknown;
  for await (const part of result.fullStream) if (part.type === "error") error = part.error;
  if (error) {
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 402) throw new SiteTranslationError("KI-Guthaben aufgebraucht – bitte unter Einstellungen → Plans & credits aufladen.");
    if (status === 429) throw new SiteTranslationError("Zu viele Anfragen – bitte in einer Minute erneut versuchen.");
    if (status === 403) throw new SiteTranslationError("Die KI-Übersetzung wurde abgelehnt.");
    console.error("[site-texts] gateway error", status);
    throw new SiteTranslationError("Die KI-Übersetzung ist fehlgeschlagen.");
  }
  if ((await result.finishReason) !== "stop") throw new SiteTranslationError("Die Übersetzung war unvollständig. Nichts wurde gespeichert.");
  const parsed = Schema.safeParse(await result.output);
  if (!parsed.success) throw new SiteTranslationError("Ungültige KI-Antwort. Nichts wurde gespeichert.");
  const map = new Map(parsed.data.items.map((i) => [i.path, i.text]));
  if (map.size !== items.length || items.some((i) => !map.has(i.path) || (i.text.trim() && !map.get(i.path)!.trim())))
    throw new SiteTranslationError("Die Übersetzung war unvollständig. Nichts wurde gespeichert.");
  return Object.fromEntries(items.map((i) => [i.path, map.get(i.path)!]));
}
