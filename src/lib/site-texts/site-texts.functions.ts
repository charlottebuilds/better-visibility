import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import de from "@/locales/de";
import { emptyTexts, flattenTexts, type SiteTexts } from "./core";

const LOCALES = ["de", "en", "es"] as const;

/** Public: all text overrides (they are published website copy). Falls back to defaults on any failure. */
export const getSiteTexts = createServerFn({ method: "GET" }).handler(async (): Promise<SiteTexts> => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const out = emptyTexts();
  if (!url || !key) return out;
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await client.from("site_texts").select("locale,path,value").limit(5000);
  if (error) { console.error("[site-texts] load failed", error.code); return out; }
  for (const r of data ?? []) if (r.locale in out) out[r.locale as keyof SiteTexts][r.path] = r.value;
  return out;
});

const editable = () => new Set(flattenTexts(de).map((l) => l.path));

export const saveSiteTexts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { locale: "de" | "en" | "es"; changes: Record<string, string>; translate: boolean }) =>
    z.object({
      locale: z.enum(LOCALES),
      changes: z.record(z.string().max(300), z.string().max(20000)),
      translate: z.boolean(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: admin } = await sb.rpc("cms_can", { p_area: "texts" });
    if (!admin) throw new Error("Keine Administratorrechte.");
    const allowed = editable();
    const paths = Object.keys(data.changes);
    if (!paths.length) return { saved: 0, translated: false };
    if (paths.length > 400 || paths.some((p) => !allowed.has(p))) throw new Error("Unbekannte Textstelle.");
    const now = new Date().toISOString();
    const rows = paths.map((path) => ({ locale: data.locale, path, value: data.changes[path]!, updated_at: now }));
    const doTranslate = data.locale === "de" && data.translate;
    if (doTranslate) {
      const { translateSiteTexts, SiteTranslationError } = await import("./translate.server");
      const items = paths.map((path) => ({ path, text: data.changes[path]! }));
      try {
        const [en, es] = await Promise.all([translateSiteTexts(items, "en"), translateSiteTexts(items, "es")]);
        for (const [loc, map] of [["en", en], ["es", es]] as const)
          for (const path of paths) rows.push({ locale: loc, path, value: map[path]!, updated_at: now });
      } catch (e) {
        if (e instanceof SiteTranslationError) throw new Error(e.message);
        throw new Error("Die KI-Übersetzung ist fehlgeschlagen. Nichts wurde gespeichert.");
      }
    }
    const { error } = await sb.from("site_texts").upsert(rows, { onConflict: "locale,path" });
    if (error) throw new Error("Speichern fehlgeschlagen.");
    return { saved: paths.length, translated: doTranslate };
  });

/** Removes overrides so the default text from the code applies again. */
export const resetSiteText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { path: string; allLocales: boolean; locale: "de" | "en" | "es" }) =>
    z.object({ path: z.string().max(300), allLocales: z.boolean(), locale: z.enum(LOCALES) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: admin } = await sb.rpc("cms_can", { p_area: "texts" });
    if (!admin) throw new Error("Keine Administratorrechte.");
    let q = sb.from("site_texts").delete().eq("path", data.path);
    if (!data.allLocales) q = q.eq("locale", data.locale);
    const { error } = await q;
    if (error) throw new Error("Zurücksetzen fehlgeschlagen.");
    return { ok: true };
  });
