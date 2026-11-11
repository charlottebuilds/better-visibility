import { PUBLIC_CMS_ENABLED } from "@/lib/public-site";
import { getPublicBlog, getPublicRedirect } from "./public.functions";
import type { Category, PublicPost } from "./types";

// Public routes must never call the CMS while the site is served as static files.
export async function getWebsiteBlog(input: { data: { locale?: string } }): Promise<{
  posts: PublicPost[];
  categories: Category[];
}> {
  if (!PUBLIC_CMS_ENABLED) return { posts: [], categories: [] };
  return getPublicBlog(input);
}

export async function getWebsiteRedirect(input: { data: { locale: string; slug: string } }) {
  if (!PUBLIC_CMS_ENABLED) return null;
  return getPublicRedirect(input);
}