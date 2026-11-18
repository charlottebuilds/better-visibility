import { mediaUrl, type PublicPost } from "@/lib/cms/types";
import { cmsText } from "@/locales/cms";
import { useEffect, useMemo, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { enhanceArticle, readingMinutes, wordCount } from "@/lib/cms/article-seo";
import { BUSINESS } from "@/lib/schema";
import portrait from "@/assets/portrait-charlotte.png";
import { supabase } from "@/integrations/supabase/client";
export function Article({
  post,
  categories = [],
  previewImage,
  related = [],
}: {
  post: PublicPost;
  categories?: { id: string; name: string }[];
  previewImage?: string;
  related?: PublicPost[];
}) {
  const { html, toc } = useMemo(() => enhanceArticle(post.content), [post.content]);
  const words = wordCount(post.content);
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!previewImage || !body.current) return;
    let live = true;
    body.current.querySelectorAll<HTMLImageElement>('img').forEach(async (img) => {
      const url = new URL(img.src, window.location.origin);
      const path = url.pathname === '/api/public/blog-media' ? url.searchParams.get('path') : null;
      if (!path) return;
      const { data } = await supabase.storage.from('blog-media').createSignedUrl(path, 3600);
      if (live && data) img.src = data.signedUrl;
    });
    return () => { live = false; };
  }, [post.content, previewImage]);
  const lang = post.locale === "en" || post.locale === "es" ? post.locale : "de";
  const text = cmsText[lang];
  const date = (value: string) =>
    new Date(value).toLocaleDateString(lang, { year: "numeric", month: "long", day: "numeric" });
  return (
    <article className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-4 flex flex-wrap gap-2 text-xs text-accent">
        {categories
          .filter((c) => post.category_ids.includes(c.id))
          .map((c) => (
            <span key={c.id}>{c.name}</span>
          ))}
      </div>
      <h1 className="break-words text-4xl font-bold leading-tight md:text-5xl">{post.title}</h1>
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {post.show_author && <span>{post.author}</span>}
        {post.published_at && <time dateTime={post.published_at}>{date(post.published_at)}</time>}
        <span>
          {readingMinutes(words)} {text.minutes}
        </span>
        {post.show_updated && post.updated_at && (
          <span>
            {text.updated}: <time dateTime={post.updated_at}>{date(post.updated_at)}</time>
          </span>
        )}
      </div>
      {post.cover_path && (
        <img
          src={previewImage ?? mediaUrl(post.cover_path)}
          alt={post.cover_alt}
          className="mt-8 aspect-[16/9] w-full rounded-lg object-cover"
        />
      )}
      {toc.filter((e) => e.level === 2).length >= 2 && (
        <nav aria-label={text.toc} className="mt-10 rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{text.toc}</p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {toc.map((e) => (
              <li key={e.id} className={e.level === 3 ? "pl-4" : ""}>
                <a href={`#${e.id}`} className="text-accent hover:underline">{e.text}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div ref={body} className="cms-content mt-10" dangerouslySetInnerHTML={{ __html: html }} />
      {post.show_author && (
        <aside className="mt-14 flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
          <img src={portrait} alt={post.author} loading="lazy" className="h-20 w-20 shrink-0 rounded-full object-cover" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{text.aboutAuthor}</p>
            <p className="mt-1 text-lg font-bold">{post.author}</p>
            <p className="mt-2 text-sm text-muted-foreground">{text.authorBio}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <a href={BUSINESS.linkedin} target="_blank" rel="noopener noreferrer me" className="text-accent hover:underline">LinkedIn</a>
              <Link to="/{-$locale}/" params={{ locale: lang === "de" ? undefined : lang }} hash="kontakt" className="text-accent hover:underline">{text.contact}</Link>
            </div>
          </div>
        </aside>
      )}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold">{text.related}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} to="/{-$locale}/blog/$slug/" params={{ locale: lang === "de" ? undefined : lang, slug: r.slug }} className="group overflow-hidden rounded-lg border border-border bg-card transition hover:-translate-y-0.5 hover:border-primary">
                {r.cover_path && <img src={mediaUrl(r.cover_path)} alt={r.cover_alt} loading="lazy" className="aspect-video w-full object-cover" />}
                <p className="p-4 text-sm font-semibold group-hover:text-accent">{r.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
