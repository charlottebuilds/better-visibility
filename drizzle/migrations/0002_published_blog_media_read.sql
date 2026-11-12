CREATE OR REPLACE FUNCTION public.cms_public_media(p_path text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $function$
SELECT EXISTS (
  SELECT 1 FROM public.blog_posts p
  WHERE p.published_snapshot IS NOT NULL
    AND (p.status = 'published' OR (p.status = 'scheduled' AND p.scheduled_at <= now()))
    AND (
      p.published_snapshot->>'cover_path' = p_path
      OR position('/api/public/blog-media?path=' || p_path || '"' IN p.published_snapshot->>'content') > 0
      OR position('/api/public/blog-media?path=' || p_path || chr(39) IN p.published_snapshot->>'content') > 0
    )
);
$function$;

DROP POLICY IF EXISTS "Public published blog media read" ON storage.objects;
CREATE POLICY "Public published blog media read"
ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'blog-media'
  AND storage.allow_only_operation('storage.object.get')
  AND public.cms_public_media(name)
);