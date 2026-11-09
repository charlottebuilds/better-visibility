import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import type { PublicPost, Category } from './types';

export const getPublicBlog = createServerFn({method:'GET'}).inputValidator((data: {locale?: string}) => data).handler(async ({data}) => {
 const url=process.env['SUPABASE_URL']; const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
 if (!url || !key) throw new Error('Blog momentan nicht erreichbar.');
 const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{ const h=new Headers(init?.headers); if(key.startsWith('sb_') && h.get('Authorization')===`Bearer ${key}`) h.delete('Authorization'); h.set('apikey',key); return fetch(input,{...init,headers:h}); }}});
 const [rows,categories]=await Promise.all([client.rpc('cms_public_posts', {p_locale:data.locale}),client.from('blog_categories').select('*').eq('active',true).order('name')]);
 if(rows.error || categories.error) throw new Error('Blog konnte nicht geladen werden.');
 return { posts: (rows.data ?? []) as unknown as PublicPost[], categories: (categories.data ?? []) as Category[] };
});
export const getPublicRedirect = createServerFn({method:'GET'}).inputValidator((data:{locale:string;slug:string})=>data).handler(async ({data})=>{
 const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY']; if(!url || !key) return null;
 const client=createClient<Database>(url,key,{auth:{persistSession:false},global:{fetch:(i,o)=>{const h=new Headers(o?.headers);h.delete('Authorization');h.set('apikey',key);return fetch(i,{...o,headers:h});}}});
 const result=await client.rpc('cms_public_redirect',{p_locale:data.locale,p_slug:data.slug});if(result.error)throw new Error('Weiterleitung konnte nicht geprüft werden.'); return result.data;
});
