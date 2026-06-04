
CREATE POLICY "Admins editors upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'uploads' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor')));

CREATE POLICY "Admins editors update uploads"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'uploads' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor')));

CREATE POLICY "Admins editors delete uploads"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'uploads' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor')));

CREATE POLICY "Authenticated read uploads"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'uploads');
