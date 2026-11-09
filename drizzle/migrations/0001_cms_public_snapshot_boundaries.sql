CREATE OR REPLACE FUNCTION public.cms_public_posts(p_locale text DEFAULT NULL) RETURNS SETOF jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT p.published_snapshot || jsonb_build_object('id',p.id,'locale',p.locale,'translation_group',p.translation_group,'original_published_at',p.original_published_at) FROM public.blog_posts p WHERE p.published_snapshot IS NOT NULL AND (p.status='published' OR (p.status='scheduled' AND p.scheduled_at<=now())) AND (p_locale IS NULL OR p.locale=p_locale) $$;
CREATE OR REPLACE FUNCTION public.cms_before_post() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
NEW.modified_at:=now();
IF TG_OP='UPDATE' THEN
NEW.original_published_at:=OLD.original_published_at;
IF OLD.published_snapshot IS NOT NULL AND NEW.published_snapshot IS DISTINCT FROM OLD.published_snapshot THEN
INSERT INTO public.blog_revisions(post_id,snapshot) VALUES(OLD.id,OLD.published_snapshot);
IF NEW.published_snapshot IS NOT NULL AND OLD.published_snapshot->>'slug' <> NEW.published_snapshot->>'slug' THEN INSERT INTO public.blog_redirects(locale,old_slug,post_id) VALUES(OLD.locale,OLD.published_snapshot->>'slug',OLD.id) ON CONFLICT(locale,old_slug) DO UPDATE SET post_id=EXCLUDED.post_id; END IF;
END IF;
END IF;
IF NEW.status IN ('published','scheduled') AND NEW.published_snapshot IS NOT NULL AND NEW.original_published_at IS NULL THEN NEW.original_published_at:=COALESCE(NEW.published_at,NEW.scheduled_at,now()); END IF;
RETURN NEW; END $$;
CREATE OR REPLACE FUNCTION public.cms_public_redirect(p_locale text,p_slug text) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT p.published_snapshot->>'slug' FROM public.blog_redirects r JOIN public.blog_posts p ON p.id=r.post_id WHERE r.locale=p_locale AND r.old_slug=p_slug AND p.published_snapshot->>'slug'<>p_slug AND p.published_snapshot IS NOT NULL AND (p.status='published' OR (p.status='scheduled' AND p.scheduled_at<=now())) $$;
REVOKE ALL ON FUNCTION public.cms_create_profile() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cms_before_post() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cms_sync_categories() FROM PUBLIC,anon,authenticated;