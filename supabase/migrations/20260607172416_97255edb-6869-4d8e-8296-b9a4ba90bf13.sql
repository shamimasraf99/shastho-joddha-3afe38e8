DROP POLICY IF EXISTS "Settings public read safe keys" ON public.settings;
CREATE POLICY "Settings public read safe keys" ON public.settings
FOR SELECT USING (key = ANY (ARRAY['page_privacy','page_terms','page_about','contact','site','meta','footer','emergency']));