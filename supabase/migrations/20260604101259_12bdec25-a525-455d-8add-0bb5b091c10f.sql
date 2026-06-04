
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');
CREATE TYPE public.article_type AS ENUM ('encyclopedia', 'news', 'tip', 'research');
CREATE TYPE public.blood_group AS ENUM ('A+','A-','B+','B-','AB+','AB-','O+','O-');
CREATE TYPE public.ad_placement AS ENUM ('top_banner','sidebar','article','popup');

-- ============ TIMESTAMP HELPER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  district TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Now create the trigger (after user_roles table exists)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  content TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (is_active = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ARTICLES ============
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  audio_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  article_type article_type NOT NULL DEFAULT 'encyclopedia',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  views INT DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_published ON public.articles(is_published, published_at DESC);
CREATE INDEX idx_articles_type ON public.articles(article_type);
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Articles public read" ON public.articles FOR SELECT USING (is_published = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors manage articles" ON public.articles FOR ALL USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_articles_updated BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DOCTORS ============
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  speciality TEXT,
  designation TEXT,
  hospital TEXT,
  chamber TEXT,
  district TEXT,
  visiting_time TEXT,
  fee TEXT,
  phone TEXT,
  photo TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_doctors_district ON public.doctors(district);
CREATE INDEX idx_doctors_speciality ON public.doctors(speciality);
GRANT SELECT ON public.doctors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors public read" ON public.doctors FOR SELECT USING (is_active = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors manage doctors" ON public.doctors FOR ALL USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_doctors_updated BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ HOSPITALS ============
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  district TEXT,
  address TEXT,
  description TEXT,
  google_map TEXT,
  emergency_number TEXT,
  phone TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_hospitals_district ON public.hospitals(district);
GRANT SELECT ON public.hospitals TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hospitals TO authenticated;
GRANT ALL ON public.hospitals TO service_role;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hospitals public read" ON public.hospitals FOR SELECT USING (is_active = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors manage hospitals" ON public.hospitals FOR ALL USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_hospitals_updated BEFORE UPDATE ON public.hospitals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ LABS ============
CREATE TABLE public.labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  test_type TEXT,
  price NUMERIC,
  district TEXT,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_labs_district ON public.labs(district);
GRANT SELECT ON public.labs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.labs TO authenticated;
GRANT ALL ON public.labs TO service_role;
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Labs public read" ON public.labs FOR SELECT USING (is_active = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors manage labs" ON public.labs FOR ALL USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_labs_updated BEFORE UPDATE ON public.labs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BLOOD DONORS ============
CREATE TABLE public.blood_donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  blood_group blood_group NOT NULL,
  district TEXT NOT NULL,
  phone TEXT NOT NULL,
  last_donation_date DATE,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_donors_group ON public.blood_donors(blood_group);
CREATE INDEX idx_donors_district ON public.blood_donors(district);
GRANT SELECT ON public.blood_donors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blood_donors TO authenticated;
GRANT ALL ON public.blood_donors TO service_role;
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors public read" ON public.blood_donors FOR SELECT USING (true);
CREATE POLICY "Auth register as donor" ON public.blood_donors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own donor" ON public.blood_donors FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users delete own donor" ON public.blood_donors FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_donors_updated BEFORE UPDATE ON public.blood_donors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ VIDEOS ============
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_id TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.videos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videos public read" ON public.videos FOR SELECT USING (is_published = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors manage videos" ON public.videos FOR ALL USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_videos_updated BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PODCASTS ============
CREATE TABLE public.podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_link TEXT,
  spotify_link TEXT,
  thumbnail TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.podcasts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.podcasts TO authenticated;
GRANT ALL ON public.podcasts TO service_role;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Podcasts public read" ON public.podcasts FOR SELECT USING (is_published = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors manage podcasts" ON public.podcasts FOR ALL USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_podcasts_updated BEFORE UPDATE ON public.podcasts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MYTH BUSTERS ============
CREATE TABLE public.mythbusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  claim TEXT NOT NULL,
  fact TEXT NOT NULL,
  doctor_name TEXT,
  video TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mythbusters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mythbusters TO authenticated;
GRANT ALL ON public.mythbusters TO service_role;
ALTER TABLE public.mythbusters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Myths public read" ON public.mythbusters FOR SELECT USING (is_published = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors manage myths" ON public.mythbusters FOR ALL USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_myths_updated BEFORE UPDATE ON public.mythbusters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ QUESTIONS ============
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_by TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.questions TO anon, authenticated;
GRANT INSERT ON public.questions TO anon, authenticated;
GRANT UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published Q&A public read" ON public.questions FOR SELECT USING (is_published = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Anyone can ask" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Editors manage Q&A" ON public.questions FOR UPDATE USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors delete Q&A" ON public.questions FOR DELETE USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_questions_updated BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ADVERTISEMENTS ============
CREATE TABLE public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  placement ad_placement NOT NULL,
  image_url TEXT,
  link_url TEXT,
  html_code TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.advertisements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.advertisements TO authenticated;
GRANT ALL ON public.advertisements TO service_role;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active ads public read" ON public.advertisements FOR SELECT USING (is_active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage ads" ON public.advertisements FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ads_updated BEFORE UPDATE ON public.advertisements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SETTINGS (key-value) ============
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings public read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.settings FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ SEO (per-route) ============
CREATE TABLE public.seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  keywords TEXT,
  og_image TEXT,
  schema_jsonld JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seo TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.seo TO authenticated;
GRANT ALL ON public.seo TO service_role;
ALTER TABLE public.seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SEO public read" ON public.seo FOR SELECT USING (true);
CREATE POLICY "Admins manage seo" ON public.seo FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ SEED CATEGORIES ============
INSERT INTO public.categories (title, slug, icon, description, sort_order) VALUES
  ('হার্ট','heart','Heart','হৃদরোগ ও সংশ্লিষ্ট তথ্য',1),
  ('ডায়াবেটিস','diabetes','Droplet','ডায়াবেটিস ব্যবস্থাপনা',2),
  ('কিডনি','kidney','Activity','কিডনি স্বাস্থ্য',3),
  ('ক্যান্সার','cancer','Ribbon','ক্যান্সার সচেতনতা',4),
  ('মানসিক স্বাস্থ্য','mental-health','Brain','মানসিক সুস্থতা',5),
  ('নারী স্বাস্থ্য','womens-health','Female','নারীদের স্বাস্থ্য',6),
  ('শিশু','children','Baby','শিশু স্বাস্থ্য',7),
  ('পুষ্টি','nutrition','Apple','পুষ্টিকর খাদ্য',8),
  ('চর্ম','skin','Hand','ত্বকের যত্ন',9),
  ('চোখ','eye','Eye','চোখের যত্ন',10),
  ('দন্ত','dental','Smile','দাঁতের যত্ন',11),
  ('ঔষধ','medicine','Pill','ঔষধ সংক্রান্ত তথ্য',12);
