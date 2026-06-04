DROP POLICY IF EXISTS "Donors auth read" ON public.blood_donors;

-- Owners and admins can read full donor row (including phone)
CREATE POLICY "Owners and admins read donors"
ON public.blood_donors
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Public/authenticated users should query the blood_donors_public view (no phone)
COMMENT ON TABLE public.blood_donors IS 'Base table contains phone numbers. Use blood_donors_public view for directory listings.';