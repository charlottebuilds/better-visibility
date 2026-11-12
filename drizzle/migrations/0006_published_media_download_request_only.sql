ALTER POLICY "Public published blog media read" ON storage.objects
USING (
  bucket_id = 'blog-media'
  AND current_setting('request.method', true) = 'GET'
  AND current_setting('request.path', true) IN (
    '/object/blog-media/' || name,
    '/object/authenticated/blog-media/' || name,
    '/storage/v1/object/blog-media/' || name,
    '/storage/v1/object/authenticated/blog-media/' || name
  )
  AND public.cms_public_media(name)
);