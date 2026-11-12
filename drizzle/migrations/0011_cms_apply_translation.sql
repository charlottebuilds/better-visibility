CREATE OR REPLACE FUNCTION public.cms_apply_translation(
  p_source_id uuid,
  p_locale text,
  p_title text,
  p_slug text,
  p_content text,
  p_excerpt text,
  p_meta_title text,
  p_meta_description text,
  p_cover_alt text
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_source public.blog_posts%ROWTYPE;
  v_target public.blog_posts%ROWTYPE;
  v_id uuid;
BEGIN
  IF NOT public.cms_is_admin() THEN
    RAISE EXCEPTION 'Keine Administratorrechte.' USING ERRCODE = '42501';
  END IF;
  IF p_locale IS NULL OR p_locale OPERATOR(pg_catalog.<>) ALL (ARRAY['de','en','es']::pg_catalog.text[]) THEN
    RAISE EXCEPTION 'Ungültige Zielsprache.' USING ERRCODE = '22023';
  END IF;
  IF pg_catalog.btrim(COALESCE(p_title, '')) = '' OR pg_catalog.btrim(COALESCE(p_content, '')) = ''
     OR COALESCE(p_slug, '') !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
    RAISE EXCEPTION 'Unvollständige oder ungültige Übersetzung.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_source FROM public.blog_posts WHERE id = p_source_id FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quellartikel nicht gefunden.' USING ERRCODE = 'P0002';
  END IF;
  IF v_source.locale = p_locale THEN
    RAISE EXCEPTION 'Zielsprache entspricht der Quellsprache.' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_source.translation_group::pg_catalog.text || ':' || p_locale, 0)
  );

  SELECT * INTO v_target FROM public.blog_posts
  WHERE translation_group = v_source.translation_group AND locale = p_locale
  FOR UPDATE;

  IF FOUND THEN
    IF v_target.translation_group IS DISTINCT FROM v_source.translation_group
       OR v_target.locale IS DISTINCT FROM p_locale THEN
      RAISE EXCEPTION 'Inkonsistente Sprachversion.' USING ERRCODE = '23514';
    END IF;
    INSERT INTO public.blog_revisions(post_id, snapshot)
    VALUES (v_target.id, pg_catalog.to_jsonb(v_target) || pg_catalog.jsonb_build_object('revision_kind', 'pre_translation'));
    UPDATE public.blog_posts SET
      title = p_title,
      slug = p_slug,
      content = p_content,
      excerpt = COALESCE(p_excerpt, ''),
      meta_title = COALESCE(p_meta_title, ''),
      meta_description = COALESCE(p_meta_description, ''),
      cover_alt = COALESCE(p_cover_alt, '')
    WHERE id = v_target.id;
    v_id := v_target.id;
  ELSE
    INSERT INTO public.blog_posts(
      translation_group, locale, title, slug, content, excerpt, cover_path, cover_alt,
      author, show_author, show_updated, meta_title, meta_description, canonical_url,
      status, scheduled_at, category_ids, published_snapshot, published_at, original_published_at, updated_at
    ) VALUES (
      v_source.translation_group, p_locale, p_title, p_slug, p_content, COALESCE(p_excerpt, ''),
      v_source.cover_path, COALESCE(p_cover_alt, ''), v_source.author, v_source.show_author,
      v_source.show_updated, COALESCE(p_meta_title, ''), COALESCE(p_meta_description, ''), '',
      'draft', NULL, v_source.category_ids, NULL, NULL, NULL, NULL
    ) RETURNING id INTO v_id;
  END IF;
  RETURN v_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.cms_apply_translation(uuid, text, text, text, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cms_apply_translation(uuid, text, text, text, text, text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.cms_apply_translation(uuid, text, text, text, text, text, text, text, text) TO authenticated, service_role;