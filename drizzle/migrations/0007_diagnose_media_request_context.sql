CREATE OR REPLACE FUNCTION public.cms_media_request_probe()
RETURNS boolean LANGUAGE plpgsql STABLE SET search_path = public
AS $function$
BEGIN
  RAISE EXCEPTION 'media request context: method=%, path=%, operation=%', current_setting('request.method', true), current_setting('request.path', true), current_setting('storage.operation', true);
END;
$function$;
GRANT EXECUTE ON FUNCTION public.cms_media_request_probe() TO anon, authenticated;
ALTER POLICY "Public published blog media read" ON storage.objects
USING (bucket_id = 'blog-media' AND public.cms_public_media(name) AND public.cms_media_request_probe());