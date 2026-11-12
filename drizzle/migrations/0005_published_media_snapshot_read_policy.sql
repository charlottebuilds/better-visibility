ALTER POLICY "Public published blog media read" ON storage.objects
USING (bucket_id = 'blog-media' AND public.cms_public_media(name));