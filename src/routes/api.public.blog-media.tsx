import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
export const Route=createFileRoute('/api/public/blog-media')({server:{handlers:{GET:async({request})=>{
 const path=new URL(request.url).searchParams.get('path');if(!path || !/^[a-zA-Z0-9_.-]+$/.test(path))return new Response('Not found',{status:404});
 const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];if(!url||!key)return new Response('Unavailable',{status:503});
 const client=createClient<Database>(url,key,{auth:{persistSession:false},global:{fetch:(i,o)=>{const h=new Headers(o?.headers);h.delete('Authorization');h.set('apikey',key);return fetch(i,{...o,headers:h});}}});
 const {data:allowed}=await client.rpc('cms_public_media',{p_path:path});if(!allowed)return new Response('Not found',{status:404});
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');const {data,error}=await supabaseAdmin.storage.from('blog-media').download(path);
 if(error||!data)return new Response('Not found',{status:404});return new Response(data,{headers:{'Content-Type':data.type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}}}});
