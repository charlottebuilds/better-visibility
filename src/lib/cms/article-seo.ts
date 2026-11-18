// Pure, browser- and server-safe helpers for article SEO/GEO features.
import { slugify } from "./types";

export const stripTags = (html: string) =>
  html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

export function wordCount(html: string) {
  const t = stripTags(html);
  return t ? t.split(" ").length : 0;
}
/** Reading time at 200 words per minute, at least one minute. */
export const readingMinutes = (words: number) => Math.max(1, Math.ceil(words / 200));

const block = (html: string, type: string) =>
  html.match(new RegExp(`<div[^>]*data-type="${type}"[^>]*>([\\s\\S]*?)</div>`))?.[1] ?? "";

/** Question/answer pairs from the FAQ block: each H3 is a question, following paragraphs its answer. */
export function extractFaq(html: string): { q: string; a: string }[] {
  const inner = block(html, "faq");
  const out: { q: string; a: string }[] = [];
  for (const part of inner.split(/<h3[^>]*>/).slice(1)) {
    const [q = "", rest = ""] = part.split("</h3>");
    const question = stripTags(q), answer = stripTags(rest);
    if (question && answer) out.push({ q: question, a: answer });
  }
  return out;
}

export type TocEntry = { id: string; text: string; level: 2 | 3 };

/** Adds heading anchors and links [n] markers to the sources list. */
export function enhanceArticle(html: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const used = new Set<string>();
  let out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g, (m, lvl: string, attrs: string, inner: string) => {
    if (/\sid=/.test(attrs)) return m;
    const text = stripTags(inner);
    if (!text) return m;
    let id = slugify(text) || "abschnitt";
    for (let i = 2; used.has(id); i++) id = `${slugify(text)}-${i}`;
    used.add(id);
    toc.push({ id, text, level: lvl === "2" ? 2 : 3 });
    return `<h${lvl} id="${id}"${attrs}>${inner}</h${lvl}>`;
  });
  const srcRe = /(<div[^>]*data-type="sources"[^>]*>)([\s\S]*?)(<\/div>)/;
  const src = out.match(srcRe);
  if (src) {
    let n = 0;
    const list = (src[2] ?? "").replace(/<li(\s[^>]*)?>/g, (_m, a = "") => `<li id="quelle-${++n}"${a}>`);
    const count = n;
    const [before, after] = out.split(src[0]);
    const link = (s: string) =>
      s.split(/(<[^>]*>)/).map((seg) => seg.startsWith("<") ? seg : seg.replace(/\[(\d{1,3})\]/g, (m, d: string) => {
        const k = Number(d);
        return k >= 1 && k <= count ? `<sup><a href="#quelle-${k}" class="cms-fn">[${k}]</a></sup>` : m;
      })).join("");
    out = link(before ?? "") + src[1] + list + src[3] + link(after ?? "");
  }
  return { html: out, toc };
}

export type SeoCheck = { label: string; ok: boolean };
export function seoChecks(
  p: { title: string; meta_title: string; meta_description: string; slug: string; content: string; cover_path: string | null; cover_alt: string },
  keyword: string,
): SeoCheck[] {
  const k = keyword.trim().toLowerCase();
  const has = (s: string) => !!k && s.toLowerCase().includes(k);
  const words = wordCount(p.content);
  const intro = stripTags(p.content).split(" ").slice(0, 100).join(" ");
  const imgs = [...p.content.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
  const title = p.meta_title || p.title;
  return [
    { label: "Fokus-Keyword im Titel", ok: has(p.title) },
    { label: "Fokus-Keyword im Meta-Title", ok: has(title) },
    { label: "Fokus-Keyword in der Meta-Description", ok: has(p.meta_description) },
    { label: "Fokus-Keyword in den ersten 100 Wörtern", ok: has(intro) },
    { label: "Fokus-Keyword in der URL", ok: !!k && p.slug.includes(slugify(k)) },
    { label: "Meta-Title 30–60 Zeichen", ok: title.length >= 30 && title.length <= 60 },
    { label: "Meta-Description 120–155 Zeichen", ok: p.meta_description.length >= 120 && p.meta_description.length <= 155 },
    { label: "Mindestens zwei H2-Zwischenüberschriften", ok: (p.content.match(/<h2/g) ?? []).length >= 2 },
    { label: "Mindestens 800 Wörter Texttiefe", ok: words >= 800 },
    { label: "Alle Bilder haben einen ALT-Text", ok: (!p.cover_path || !!p.cover_alt.trim()) && imgs.every((i) => /alt="[^"]+"/.test(i)) },
    { label: "„Auf einen Blick“-Box vorhanden", ok: p.content.includes('data-type="takeaways"') },
    { label: "FAQ-Block vorhanden", ok: extractFaq(p.content).length > 0 },
    { label: "Quellenverzeichnis vorhanden", ok: p.content.includes('data-type="sources"') },
  ];
}

/** Up to three other posts in the same language, preferring shared categories, newest first. */
export function relatedPosts<T extends { id: string; locale: string; category_ids: string[]; published_at: string | null }>(post: T, all: T[], n = 3): T[] {
  return all
    .filter((p) => p.id !== post.id && p.locale === post.locale)
    .map((p) => ({ p, s: p.category_ids.filter((c) => post.category_ids.includes(c)).length }))
    .sort((a, b) => b.s - a.s || (b.p.published_at ?? "").localeCompare(a.p.published_at ?? ""))
    .slice(0, n)
    .map((x) => x.p);
}
