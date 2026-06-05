ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS category text DEFAULT 'cancer';
UPDATE public.hospitals SET category = 'cancer' WHERE category IS NULL;