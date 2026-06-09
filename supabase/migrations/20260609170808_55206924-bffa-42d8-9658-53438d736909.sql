
-- Re-create donors_public as a security_invoker view
DROP VIEW IF EXISTS public.donors_public;
CREATE VIEW public.donors_public
WITH (security_invoker = true) AS
SELECT id, name, blood_group, district, last_donation_date, is_available, created_at
FROM public.blood_donors
WHERE is_available = true;
GRANT SELECT ON public.donors_public TO anon, authenticated;

-- Re-establish an anon read policy on blood_donors but limit columns via GRANT
CREATE POLICY "Public read available donors safe cols"
ON public.blood_donors
FOR SELECT
TO anon
USING (is_available = true);

-- Column-level grant: anon can only see safe columns
GRANT SELECT (id, name, blood_group, district, last_donation_date, is_available, created_at)
ON public.blood_donors TO anon;
