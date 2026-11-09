import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const INSTRUCTIONS = `Du bist eine erfahrene SEO- und GEO-Beraterin (Generative Engine Optimization für AI Overviews, ChatGPT, Perplexity).
Analysiere den Blogbeitrag und liefere konkrete, sofort umsetzbare Optimierungen auf Deutsch (Fachbegriffe dürfen Englisch bleiben).
Gliedere mit Markdown-Überschriften:
## Kurzbewertung (2–3 Sätze, Score 0–100)
## SEO-Optimierungen (Keyword-Fokus, Title-Vorschlag max. 60 Zeichen, Meta-Description max. 155 Zeichen, Überschriftenstruktur, interne Links, Lesbarkeit)
## GEO-Optimierungen (zitierfähige Kernaussagen, Definitionen, Fakten/Zahlen mit Quellen, FAQ-Fragen mit kurzen Antworten, Entitäten, E-E-A-T-Signale)
## Strukturierte Daten (passende Schema-Typen)
## Top-5-Maßnahmen (priorisiert, je mit konkretem Formulierungsbeispiel)
Sei präzise, keine allgemeinen Floskeln.`;

export async function generateSeoGeoTips(input: { text: string; keyword: string }) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("KI ist nicht konfiguriert.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const prompt =
    (input.keyword ? `Fokus-Keyword: ${input.keyword}\n\n` : "") + `Blogbeitrag:\n${input.text}`;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions: INSTRUCTIONS,
    messages: [{ role: "user", content: prompt }],
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
    if (status === 402) throw new Error("KI-Guthaben aufgebraucht – bitte unter Einstellungen → Plans & credits aufladen.");
    if (status === 429) throw new Error("Zu viele Anfragen – bitte in einer Minute erneut versuchen.");
    console.error("SEO/GEO AI failed", error);
    throw new Error("Die KI-Analyse ist fehlgeschlagen.");
  }
  return await result.text;
}
