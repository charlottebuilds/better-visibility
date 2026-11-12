ALTER POLICY "Public published blog media read" ON storage.objects
USING (
  bucket_id = 'blog-media'
  AND storage.allow_only_operation('storage.object.get_authenticated')
  AND public.cms_public_media(name)
);