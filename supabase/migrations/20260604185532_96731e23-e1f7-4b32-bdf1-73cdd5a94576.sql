
DROP VIEW IF EXISTS public.blood_donors_public;
CREATE VIEW public.blood_donors_public AS
  SELECT id, name, blood_group, district, last_donation_date, is_available, created_at
  FROM public.blood_donors
  WHERE is_available = true;
GRANT SELECT ON public.blood_donors_public TO anon, authenticated;
