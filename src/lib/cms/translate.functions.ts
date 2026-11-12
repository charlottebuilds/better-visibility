import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { cleanContent } from "./admin.functions";
import { slugify } from "./types";
import {
  isValidSlug, mapInternalLinks, validateTranslatedHtml,
  type Locale, type PublishedTranslation,
} from "./translate-html";

const SITE_HOSTS = ["better-visibility.com", "www.better-visibility.com"];
const ISSUE_TEXT: Record<string, string> = {
  empty: "Inhalt ist leer",
  structure: "HTML-Struktur weicht ab",
  attributes: "Linkziele oder Bildattribute wurden verändert",
  text_missing: "Textabschnitte fehlen",
  numbers: "Zahlen weichen vom Original ab",
  length: "Textlänge ist unplausibel",
};

export const translatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { sourceId: string; locale: "en" | "es" | "de"; overwrite: boolean }) =>
    z.object({ sourceId: z.string().uuid(), locale: z.enum(["de", "en", "es"]), overwrite: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: admin } = await sb.rpc("cms_is_admin");
    if (!admin) throw new Error("Keine Administratorrechte.");

    const { data: source, error: srcErr } = await sb.from("blog_posts").select("*").eq("id", data.sourceId).maybeSingle();
    if (srcErr || !source) throw new Error("Quellartikel nicht gefunden.");
    if (source.locale === data.locale) throw new Error("Zielsprache entspricht der Quellsprache.");
    if (!source.title.trim() || !source.content.trim()) throw new Error("Der Quellartikel hat keinen Titel oder Inhalt.");
    if (source.content.length > 120_000) throw new Error("Der Artikel ist für eine automatische Übersetzung zu lang.");

    const { data: existing } = await sb.from("blog_posts").select("id,status")
      .eq("translation_group", source.translation_group).eq("locale", data.locale).maybeSingle();
    if (existing && !data.overwrite) return { status: "exists" as const, id: existing.id };

    const { generateTranslation, TranslationError } = await import("./translate.server");
    const sourceHtml = cleanContent(source.content);
    let t;
    try {
      t = await generateTranslation(
        { title: source.title, excerpt: source.excerpt, meta_title: source.meta_title,
          meta_description: source.meta_description, cover_alt: source.cover_alt, content: sourceHtml },
        source.locale as Locale, data.locale);
    } catch (e) {
      throw new Error(e instanceof TranslationError ? e.message : "Die KI-Übersetzung ist fehlgeschlagen.");
    }

    // Validate fully before any database write.
    const outHtml = cleanContent(t.content);
    const issues = validateTranslatedHtml(sourceHtml, outHtml);
    if (!t.title.trim()) issues.push("empty");
    if (issues.length)
      throw new Error(`Übersetzung verworfen (${[...new Set(issues)].map((i) => ISSUE_TEXT[i]).join(", ")}). Nichts wurde gespeichert.`);

    const { data: pub } = await sb.from("blog_posts").select("locale,slug,translation_group,published_snapshot,status")
      .not("published_snapshot", "is", null);
    const published: PublishedTranslation[] = (pub ?? []).map((p) => ({
      locale: p.locale as Locale,
      slug: String((p.published_snapshot as { slug?: string } | null)?.slug ?? p.slug),
      translation_group: p.translation_group,
    }));
    const content = cleanContent(mapInternalLinks(outHtml, {
      sourceLocale: source.locale as Locale, targetLocale: data.locale, siteHosts: SITE_HOSTS, published,
    }));

    let base = slugify(t.slug || t.title).slice(0, 80).replace(/-$/, "");
    if (!isValidSlug(base)) base = slugify(t.title).slice(0, 80).replace(/-$/, "") || `beitrag-${data.locale}`;
    let slug = base;
    for (let i = 2; i < 50; i++) {
      const { data: clash } = await sb.from("blog_posts").select("id").eq("locale", data.locale).eq("slug", slug).maybeSingle();
      if (!clash || clash.id === existing?.id) break;
      slug = `${base}-${i}`;
    }

    const { data: id, error } = await sb.rpc("cms_apply_translation", {
      p_source_id: source.id, p_locale: data.locale, p_title: t.title.trim(), p_slug: slug, p_content: content,
      p_excerpt: t.excerpt, p_meta_title: t.meta_title, p_meta_description: t.meta_description, p_cover_alt: t.cover_alt,
    });
    if (error || !id) {
      console.error("[translate] apply failed", error?.code);
      throw new Error("Die Übersetzung konnte nicht gespeichert werden. Bestehende Fassungen sind unverändert.");
    }
    return { status: "saved" as const, id: id as string, overwritten: Boolean(existing) };
  });
