-- Backup before migration 0010 (2026-11-12). Read-only snapshot of the live database.
-- ACL cms_public_media(text): {postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}
-- ACL cms_media_request_probe(): {postgres=X/postgres,service_role=X/postgres}; non-internal dependencies: 0
CREATE OR REPLACE FUNCTION public.cms_public_media(p_path text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.cms_media_request_probe()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$ SELECT false; $function$;
