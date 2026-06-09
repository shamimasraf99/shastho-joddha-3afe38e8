-- Revert view to security_invoker (Postgres-recommended default)
ALTER VIEW public.questions_editor_view SET (security_invoker = true);

-- Allow editors and admins to read questions (used through the editor view which omits PII columns)
DROP POLICY IF EXISTS "Editors and admins read questions" ON public.questions;
CREATE POLICY "Editors and admins read questions"
ON public.questions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'editor'::app_role)
);

-- The pre-existing "Admins read questions" policy becomes redundant; drop it
DROP POLICY IF EXISTS "Admins read questions" ON public.questions;
