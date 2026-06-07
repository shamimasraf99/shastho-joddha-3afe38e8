-- Restrict anon SELECT on blood_donors to safe columns only (no phone/user_id)
REVOKE SELECT ON public.blood_donors FROM anon;
GRANT SELECT (id, name, blood_group, district, last_donation_date, is_available, created_at, updated_at) ON public.blood_donors TO anon;

-- Restrict question reads to admins only (emails are sensitive)
DROP POLICY IF EXISTS "Editors read questions" ON public.questions;
CREATE POLICY "Admins read questions"
  ON public.questions
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));