ALTER POLICY "Public published blog media read" ON storage.objects
USING (bucket_id = 'blog-media' AND public.cms_public_media(name));
CREATE OR REPLACE FUNCTION public.cms_media_request_probe()
RETURNS boolean LANGUAGE sql STABLE SET search_path = public
AS $function$ SELECT false; $function$;
REVOKE ALL ON FUNCTION public.cms_media_request_probe() FROM PUBLIC, anon, authenticated;
COMMENT ON FUNCTION public.cms_media_request_probe() IS 'DEPRECATED: temporary request-context diagnosis; not used by any policy.';