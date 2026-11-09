import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { publicationDates } from './types';
import type { CmsPost } from './types';
import type { Json } from '@/integrations/supabase/types';

export const cleanContent = (html: string) => sanitizeHtml(html, {
 allowedTags:['p','br','h2','h3','h4','strong','em','u','s','ul','ol','li','a','img','figure','figcaption','table','thead','tbody','tr','th','td','blockquote','div','span','hr'],
 allowedAttributes:{'*':['style'],'a':['href','target','rel'],'img':['src','alt','width','height'],'th':['colspan','rowspan'],'td':['colspan','rowspan'],'div':['data-type'],'figure':['data-type']},
 allowedSchemes:['http','https','mailto','tel'], allowedStyles:{'*':{'text-align':[/^(left|center|right)$/],'width':[/^\d+(px|%)$/],'max-width':[/^\d+(px|%)$/]}},
 transformTags:{h1:'h2',a:(_tag,attributes)=>({tagName:'a',attribs:{...attributes,rel:'noopener noreferrer'}})},
});
const postSchema=z.object({id:z.string().uuid(),translation_group:z.string().uuid(),locale:z.enum(['de','en','es']),title:z.string().max(300),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),content:z.string().max(1000000),excerpt:z.string().max(2000),cover_path:z.string().nullable(),cover_alt:z.string(),author:z.string().max(200),show_author:z.boolean(),show_updated:z.boolean(),published_at:z.string().nullable(),updated_at:z.string().nullable(),meta_title:z.string().max(300),meta_description:z.string().max(2000),canonical_url:z.union([z.literal(''),z.string().url()]),status:z.enum(['draft','scheduled','published']),scheduled_at:z.string().nullable(),category_ids:z.array(z.string().uuid())});
export const savePost = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((data:{post:CmsPost;action:'save'|'publish'|'schedule'|'unpublish'})=>({post:postSchema.parse(data.post),action:z.enum(['save','publish','schedule','unpublish']).parse(data.action)})).handler(async({data,context})=>{
 const {data:admin}=await context.supabase.rpc('cms_is_admin');if(!admin)throw new Error('Keine Administratorrechte.');
 const {data:existing,error:readError}=await context.supabase.from('blog_posts').select('*').eq('id',data.post.id).maybeSingle();if(readError)throw readError;
 const post={...data.post,content:cleanContent(data.post.content)};
 if(data.action==='publish'||data.action==='schedule') {
  if(!post.title.trim() || !post.content.replace(/<[^>]+>/g,'').trim() || !post.cover_path || !post.cover_alt.trim()) throw new Error('Titel, Inhalt, Titelbild und ALT-Text sind vor der Veröffentlichung erforderlich.');
  if(data.action==='schedule' && (!post.scheduled_at || Date.parse(post.scheduled_at)<=Date.now())) throw new Error('Bitte einen zukünftigen Zeitpunkt wählen.');
 }
 const patch: Record<string,unknown>={...post};
 if(existing){patch['status']=existing.status;patch['scheduled_at']=existing.scheduled_at;}
 else {patch['status']='draft';patch['scheduled_at']=null;}
 if(data.action==='unpublish'){patch['status']='draft';patch['published_snapshot']=null;}
 if(data.action==='publish'||data.action==='schedule'){
  const dates=publicationDates({...post,original_published_at:existing?.original_published_at ?? null,published_snapshot:existing?.published_snapshot ?? null},data.action==='schedule' ? post.scheduled_at ?? new Date().toISOString() : new Date().toISOString());
  if(existing?.published_snapshot && post.content!==existing.content && post.updated_at===existing.updated_at) dates.updated_at=new Date().toISOString();
  Object.assign(patch,dates,{status:data.action==='publish'?'published':'scheduled',scheduled_at:data.action==='schedule'?post.scheduled_at:null});
  patch['published_snapshot']={...post,...dates};
 }
 const {data:saved,error}=await context.supabase.from('blog_posts').upsert(patch as unknown as CmsPost).select().single();
 if(error) throw new Error(error.code==='23505'?'Diese URL oder Sprachversion existiert bereits.':error.message);
 return saved;
});
export const restoreRevision=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((data:{id:string})=>z.object({id:z.string().uuid()}).parse(data)).handler(async({data,context})=>{
 const {data:admin}=await context.supabase.rpc('cms_is_admin');if(!admin)throw new Error('Keine Administratorrechte.');
 const {data:revision,error}=await context.supabase.from('blog_revisions').select('*').eq('id',data.id).single();if(error)throw error;
 const snapshot=revision.snapshot as unknown as CmsPost;
 const {data:saved,error:updateError}=await context.supabase.from('blog_posts').update({title:snapshot.title,content:snapshot.content,excerpt:snapshot.excerpt,cover_path:snapshot.cover_path,cover_alt:snapshot.cover_alt,author:snapshot.author,category_ids:snapshot.category_ids}).eq('id',revision.post_id).select().single();if(updateError)throw updateError;return saved;
});
export const manageUser=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((data:{email:string;admin:boolean})=>z.object({email:z.string().email(),admin:z.boolean()}).parse(data)).handler(async({data,context})=>{
 const {data:admin}=await context.supabase.rpc('cms_is_admin');if(!admin)throw new Error('Keine Administratorrechte.');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {data:invited,error}=await supabaseAdmin.auth.admin.inviteUserByEmail(data.email);if(error)throw error;
 if(data.admin && invited.user){const {error:roleError}=await supabaseAdmin.from('user_roles').insert({user_id:invited.user.id,role:'admin'});if(roleError)throw roleError;}
 return {success:true};
});
export const uploadMedia=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((data:{name:string;type:string;base64:string})=>z.object({name:z.string(),type:z.enum(['image/jpeg','image/png','image/webp','image/gif']),base64:z.string().max(14000000)}).parse(data)).handler(async({data,context})=>{
 const {data:admin}=await context.supabase.rpc('cms_is_admin');if(!admin)throw new Error('Keine Administratorrechte.');
 const bytes=Uint8Array.from(atob(data.base64),c=>c.charCodeAt(0));if(bytes.length>10*1024*1024)throw new Error('Bild darf maximal 10 MB groß sein.');
 const path=crypto.randomUUID()+'.'+({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'}[data.type]);
 const {error}=await context.supabase.storage.from('blog-media').upload(path,bytes,{contentType:data.type});if(error)throw error;
 const {error:dbError}=await context.supabase.from('blog_media').insert({path});if(dbError)throw dbError;
 const {data:signed}=await context.supabase.storage.from('blog-media').createSignedUrl(path,3600);
 return {path,preview:signed?.signedUrl ?? ''};
});
export type RevisionSnapshot = Json;
