ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS autoplay boolean NOT NULL DEFAULT false;
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS autoplay boolean NOT NULL DEFAULT false;