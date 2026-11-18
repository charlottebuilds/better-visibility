CREATE TABLE public.site_texts (
  locale text NOT NULL CHECK (locale IN ('de','en','es')),
  path text NOT NULL CHECK (length(path) BETWEEN 1 AND 300),
  value text NOT NULL CHECK (length(value) <= 20000),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (locale, path)
);
GRANT SELECT ON public.site_texts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_texts TO authenticated;
GRANT ALL ON public.site_texts TO service_role;
ALTER TABLE public.site_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY site_texts_public ON public.site_texts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY site_texts_admin ON public.site_texts FOR ALL TO authenticated USING (public.cms_is_admin()) WITH CHECK (public.cms_is_admin());