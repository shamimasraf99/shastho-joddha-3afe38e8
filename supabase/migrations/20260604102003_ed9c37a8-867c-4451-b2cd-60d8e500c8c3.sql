
-- 1) profiles: restrict base table; add public-safe view
DROP POLICY IF EXISTS "Profiles viewable by all" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR has_role(auth.uid(), 'admin'));

CREATE OR REPLACE VIEW public.profiles_public WITH (security_invoker=on) AS
  SELECT id, full_name, avatar_url FROM public.profiles;
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- 2) blood_donors: restrict base table; add public-safe view (no phone)
DROP POLICY IF EXISTS "Donors public read" ON public.blood_donors;
CREATE POLICY "Donors auth read" ON public.blood_donors FOR SELECT
  TO authenticated USING (true);

CREATE OR REPLACE VIEW public.blood_donors_public WITH (security_invoker=on) AS
  SELECT id, name, district, blood_group, is_available, last_donation_date, created_at
  FROM public.blood_donors;
GRANT SELECT ON public.blood_donors_public TO anon, authenticated;

-- 3) questions: restrict base table; add public-safe view (no email)
DROP POLICY IF EXISTS "Published Q&A public read" ON public.questions;
CREATE POLICY "Editors read questions" ON public.questions FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE OR REPLACE VIEW public.questions_public WITH (security_invoker=on) AS
  SELECT id, name, question, answer, answered_by, created_at, updated_at
  FROM public.questions WHERE is_published = true;
GRANT SELECT ON public.questions_public TO anon, authenticated;

-- 4) Harden has_role against NULL user ids
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;
