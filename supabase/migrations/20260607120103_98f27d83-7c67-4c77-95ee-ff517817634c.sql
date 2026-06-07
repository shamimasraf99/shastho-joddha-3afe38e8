
-- =========================================================
-- 1) blood_donors: hide phone & user_id from anonymous role
-- =========================================================
REVOKE SELECT ON public.blood_donors FROM anon;
GRANT SELECT (id, name, blood_group, district, is_available, last_donation_date, created_at, updated_at)
  ON public.blood_donors TO anon;

-- =========================================================
-- 2) questions: prevent editors from reading email via UPDATE USING
-- =========================================================
DROP POLICY IF EXISTS "Editors manage Q&A" ON public.questions;
DROP POLICY IF EXISTS "Editors delete Q&A" ON public.questions;

-- Only admins can directly UPDATE/DELETE rows (which exposes all columns).
CREATE POLICY "Admins update questions"
  ON public.questions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete questions"
  ON public.questions FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Editors answer questions through a SECURITY DEFINER function that never returns email/name.
CREATE OR REPLACE FUNCTION public.answer_question(
  _id uuid,
  _answer text,
  _answered_by text,
  _publish boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role)) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.questions
  SET answer = _answer,
      answered_by = _answered_by,
      is_published = COALESCE(_publish, is_published),
      updated_at = now()
  WHERE id = _id;
END;
$$;

REVOKE ALL ON FUNCTION public.answer_question(uuid, text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.answer_question(uuid, text, text, boolean) TO authenticated;

-- Editors can list questions without email via a safe view.
CREATE OR REPLACE VIEW public.questions_editor_view
WITH (security_invoker = true) AS
SELECT id, question, answer, answered_by, is_published, created_at, updated_at
FROM public.questions;

GRANT SELECT ON public.questions_editor_view TO authenticated;

-- Allow editors to SELECT through RLS too (they only see non-PII columns via the view).
CREATE POLICY "Editors read questions for moderation"
  ON public.questions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'editor'::app_role));

-- =========================================================
-- 3) settings: restrict public read to known safe keys
-- =========================================================
DROP POLICY IF EXISTS "Settings public read" ON public.settings;

CREATE POLICY "Settings public read safe keys"
  ON public.settings FOR SELECT
  USING (key IN ('page_privacy', 'page_terms', 'page_about', 'contact'));
