
-- Revoke direct EXECUTE on SECURITY DEFINER funcs (RLS still works since policies run as table owner)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- Tighten public Q&A submission
DROP POLICY IF EXISTS "Anyone can ask" ON public.questions;
CREATE POLICY "Anyone can ask"
ON public.questions FOR INSERT
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 100
  AND length(trim(email)) BETWEEN 3 AND 255
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(trim(question)) BETWEEN 10 AND 2000
  AND is_published = false
  AND answer IS NULL
);
