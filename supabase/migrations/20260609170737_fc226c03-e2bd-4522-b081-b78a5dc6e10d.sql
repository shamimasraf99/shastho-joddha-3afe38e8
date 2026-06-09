
-- 1) Restrict anon access to blood_donors via a safe public view
DROP POLICY IF EXISTS "Public read available donors" ON public.blood_donors;
REVOKE SELECT ON public.blood_donors FROM anon;

CREATE OR REPLACE VIEW public.donors_public
WITH (security_invoker = true) AS
SELECT id, name, blood_group, district, last_donation_date, is_available, created_at
FROM public.blood_donors
WHERE is_available = true;

-- Allow anon read of the view; view runs as invoker but we need a permissive
-- policy on the base table for the anon role for available rows with only safe cols.
-- Simpler: switch the view to security_definer-style by using a SECURITY DEFINER function
-- Re-create view as security_definer owned by postgres so RLS on base is bypassed safely.
DROP VIEW public.donors_public;
CREATE VIEW public.donors_public AS
SELECT id, name, blood_group, district, last_donation_date, is_available, created_at
FROM public.blood_donors
WHERE is_available = true;
ALTER VIEW public.donors_public OWNER TO postgres;
GRANT SELECT ON public.donors_public TO anon, authenticated;

-- 2) Remove editor direct SELECT on questions; editors must use questions_editor_view
DROP POLICY IF EXISTS "Editors read questions for moderation" ON public.questions;
