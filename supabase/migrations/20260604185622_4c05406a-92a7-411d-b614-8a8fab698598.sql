
DROP POLICY IF EXISTS "Public read available donors" ON public.blood_donors;
REVOKE SELECT ON public.blood_donors FROM anon;
GRANT SELECT (id, name, blood_group, district, last_donation_date, is_available, created_at, updated_at, user_id)
  ON public.blood_donors TO anon;
CREATE POLICY "Public read available donors"
  ON public.blood_donors FOR SELECT
  TO anon
  USING (is_available = true);
