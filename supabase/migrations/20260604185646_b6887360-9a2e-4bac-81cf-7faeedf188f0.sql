
DROP VIEW IF EXISTS public.blood_donors_public;

DROP POLICY IF EXISTS "Public read uploads bucket" ON storage.objects;
CREATE POLICY "Public read uploads bucket"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'uploads');
