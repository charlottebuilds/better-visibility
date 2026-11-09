import type { Database } from '@/integrations/supabase/types';
export type CmsPost = Database['public']['Tables']['blog_posts']['Row'];
export type Category = Database['public']['Tables']['blog_categories']['Row'];
export type PublicPost = Omit<CmsPost, 'published_snapshot' | 'modified_at' | 'created_at' | 'status' | 'scheduled_at'>;
export const mediaUrl = (path: string | null | undefined) => path ? `/api/public/blog-media?path=${encodeURIComponent(path)}` : '';
export const postPath = (locale: string, slug: string) => `/${locale}/blog/${slug}`;
export function emptyPost(locale = 'de', group?: string): CmsPost {
 const now = new Date().toISOString();
 return { id: crypto.randomUUID(), translation_group: group ?? crypto.randomUUID(), locale, title:'', slug:`beitrag-${crypto.randomUUID().slice(0,8)}`, content:'', excerpt:'', cover_path:null, cover_alt:'', author:'Charlotte Götz', show_author:true, show_updated:false, published_at:null, original_published_at:null, updated_at:null, meta_title:'', meta_description:'', canonical_url:'', status:'draft', scheduled_at:null, category_ids:[], published_snapshot:null, created_at:now, modified_at:now };
}
export const slugify = (text: string) => text.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function effectiveStatus(post: Pick<CmsPost,'status'|'scheduled_at'>, now = Date.now()) { return post.status === 'scheduled' && post.scheduled_at && Date.parse(post.scheduled_at) <= now ? 'published' : post.status; }
export function publicationDates(post: Pick<CmsPost,'published_at'|'original_published_at'|'updated_at'|'published_snapshot'>, now: string) {
 return { published_at: post.published_at ?? now, original_published_at: post.original_published_at ?? post.published_at ?? now, updated_at: post.published_snapshot ? post.updated_at ?? now : post.updated_at };
}
