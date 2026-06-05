-- Restrict anon access to blood_donors so phone numbers and user_id are not exposed publicly.
-- Revoke broad SELECT from anon and re-grant only non-sensitive columns.
REVOKE SELECT ON public.blood_donors FROM anon;
GRANT SELECT (id, name, blood_group, district, is_available, last_donation_date, created_at, updated_at) ON public.blood_donors TO anon;

-- Authenticated users still need full row access governed by RLS (owners + admins).
GRANT SELECT ON public.blood_donors TO authenticated;