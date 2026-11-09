import { mediaUrl, type PublicPost } from "@/lib/cms/types";
import { cmsText } from "@/locales/cms";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
export function Article({
  post,
  categories = [],
  previewImage,
}: {
  post: PublicPost;
  categories?: { id: string; name: string }[];
  previewImage?: string;
}) {
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
      <div ref={body} className="cms-content mt-10" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
