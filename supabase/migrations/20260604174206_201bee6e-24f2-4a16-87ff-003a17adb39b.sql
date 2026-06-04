
DROP VIEW IF EXISTS public.public_blood_donors;

-- Re-add anon read policy, but rely on column grants to hide phone
CREATE POLICY "Public read available donors"
ON public.blood_donors
FOR SELECT
TO anon
USING (is_available = true);

-- Restrict anon to safe columns only (no phone, no user_id)
REVOKE SELECT ON public.blood_donors FROM anon;
GRANT SELECT (id, name, blood_group, district, last_donation_date, is_available, created_at)
ON public.blood_donors TO anon;
