
-- Remove the public policy that exposed phone numbers to anonymous users
DROP POLICY IF EXISTS "Public read available donors" ON public.blood_donors;

-- Create a safe public view that omits the phone column
CREATE OR REPLACE VIEW public.public_blood_donors
WITH (security_invoker = false) AS
SELECT
  id,
  name,
  blood_group,
  district,
  last_donation_date,
  is_available,
  created_at
FROM public.blood_donors
WHERE is_available = true;

GRANT SELECT ON public.public_blood_donors TO anon, authenticated;
