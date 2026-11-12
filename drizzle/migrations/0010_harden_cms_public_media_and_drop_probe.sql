CREATE OR REPLACE FUNCTION public.cms_public_media(p_path text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
SELECT EXISTS (
  SELECT 1 FROM public.blog_posts p
  WHERE p.published_snapshot IS NOT NULL
    AND (
      p.status = 'published'
      OR (p.status = 'scheduled' AND p.scheduled_at <= pg_catalog.now())
    )
    AND (
      p.published_snapshot->>'cover_path' = p_path
      OR pg_catalog.strpos(p.published_snapshot->>'content', '/api/public/blog-media?path=' || p_path || '"') > 0
      OR pg_catalog.strpos(p.published_snapshot->>'content', '/api/public/blog-media?path=' || p_path || pg_catalog.chr(39)) > 0
    )
);
$function$;

REVOKE ALL ON FUNCTION public.cms_public_media(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cms_public_media(text) TO anon, authenticated, service_role;

DROP FUNCTION IF EXISTS public.cms_media_request_probe();