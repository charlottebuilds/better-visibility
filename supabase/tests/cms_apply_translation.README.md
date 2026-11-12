Integration check for public.cms_apply_translation: run as one DO block that ends with
RAISE EXCEPTION 'TESTRESULT ...' so every change is rolled back. Expected: 1..6 OK
(non-admin rejected, new draft insert, update without duplicate + revision,
published snapshot/status/dates untouched, failure rollback, same-locale rejected).
