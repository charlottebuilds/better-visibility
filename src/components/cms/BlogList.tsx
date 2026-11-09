import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { mediaUrl, type PublicPost, type Category } from "@/lib/cms/types";
import { cmsText } from "@/locales/cms";
export function BlogList({ posts, categories }: { posts: PublicPost[]; categories: Category[] }) {
  const { lang } = useI18n();
  const t = cmsText[lang];
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [order, setOrder] = useState("new");
  const [page, setPage] = useState(0);
  const filtered = posts
    .filter(
      (p) =>
        (!category || p.category_ids.includes(category)) &&
        `${p.title} ${p.excerpt}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort(
      (a, b) =>
        (Date.parse(b.published_at ?? "") - Date.parse(a.published_at ?? "")) *
        (order === "new" ? 1 : -1),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / 9));
  return (
    <>
      <div className="mt-8 flex flex-wrap gap-3 border-y border-border py-5">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            aria-label={t.search}
            placeholder={t.search}
            className="w-full bg-transparent py-2 outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <select
          aria-label={t.all}
          className="cms-input max-w-full"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
        >
          <option value="">{t.all}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label={t.sort}
          className="cms-input"
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
            setPage(0);
          }}
        >
          <option value="new">{t.newest}</option>
          <option value="old">{t.oldest}</option>
        </select>
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        {filtered.length} {t.results}
      </p>
      {filtered.length === 0 ? (
        <p className="py-16 text-muted-foreground">{t.empty}</p>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(page * 9, page * 9 + 9).map((p) => (
            <Link
              key={p.id}
              to="/{-$locale}/blog/$slug"
              params={{ locale: lang, slug: p.slug }}
              className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-accent"
            >
              {p.cover_path && (
                <img
                  src={mediaUrl(p.cover_path)}
                  alt={p.cover_alt}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover motion-safe:transition-transform motion-safe:group-hover:scale-[1.02]"
                />
              )}
              <div className="p-6">
                <p className="text-xs text-accent">
                  {categories
                    .filter((c) => p.category_ids.includes(c.id))
                    .map((c) => c.name)
                    .join(" · ")}
                </p>
                <h2 className="mt-2 break-words text-xl font-bold">{p.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{p.excerpt}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {p.show_author && <span>{p.author} · </span>}
                  {p.published_at && (
                    <time>{new Date(p.published_at).toLocaleDateString(lang)}</time>
                  )}
                  {p.show_updated && p.updated_at && (
                    <span>
                      {t.updated}: {new Date(p.updated_at).toLocaleDateString(lang)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            aria-label={t.previous}
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ArrowLeft />
          </Button>
          <span>
            {page + 1} / {pages}
          </span>
          <Button
            variant="outline"
            aria-label={t.next}
            disabled={page + 1 >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ArrowRight />
          </Button>
        </div>
      )}
    </>
  );
}
