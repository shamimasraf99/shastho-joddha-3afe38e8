CREATE TABLE public.body_parts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.article_body_parts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    body_part_id UUID NOT NULL REFERENCES public.body_parts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (article_id, body_part_id)
);

GRANT SELECT ON public.body_parts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_parts TO authenticated;
GRANT ALL ON public.body_parts TO service_role;

GRANT SELECT ON public.article_body_parts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.article_body_parts TO authenticated;
GRANT ALL ON public.article_body_parts TO service_role;

ALTER TABLE public.body_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_body_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Body parts public read" ON public.body_parts FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Editors manage body parts" ON public.body_parts FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Article body parts public read" ON public.article_body_parts FOR SELECT USING (true);
CREATE POLICY "Editors manage article body parts" ON public.article_body_parts FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- Seed common body parts
INSERT INTO public.body_parts (name, slug, icon, description, sort_order) VALUES
('মাথা', 'matha', 'Brain', 'মস্তিষ্ক, মাথাব্যথা, স্ট্রোক', 1),
('চোখ', 'chokh', 'Eye', 'চোখের রোগ, দৃষ্টিশক্তি', 2),
('কান', 'kan', 'Ear', 'কানের রোগ, শ্রবণশক্তি', 3),
('নাক', 'nak', 'Nose', 'নাকের রোগ, সাইনাস', 4),
('গলা', 'gola', 'Throat', 'গলার রোগ, টনসিল', 5),
('দাঁত', 'dat', 'Tooth', 'দাঁত ও মুখের রোগ', 6),
('ত্বক', 'twak', 'Skin', 'ত্বকের রোগ, অ্যালার্জি', 7),
('হৃদয়', 'hridoy', 'Heart', 'হৃদরোগ, রক্তচাপ', 8),
('ফুসফুস', 'fusfus', 'Lungs', 'ফুসফুসের রোগ, শ্বাসকষ্ট', 9),
('পেট', 'pet', 'Stomach', 'পেটের রোগ, হজম', 10),
('কিডনি', 'kidni', 'Kidney', 'কিডনির রোগ, প্রস্রাব', 11),
('লিভার', 'liver', 'Liver', 'লিভারের রোগ, হেপাটাইটিস', 12),
('হাড়', 'har', 'Bone', 'হাড়ের রোগ, আর্থ্রাইটিস', 13),
('হাত', 'hat', 'Hand', 'হাতের রোগ, পক্ষাঘাত', 14),
('পা', 'pa', 'Foot', 'পায়ের রোগ, ডায়াবেটিক ফুট', 15),
('মস্তিষ্ক', 'mostishko', 'Brain', 'স্নায়ু রোগ, মানসিক স্বাস্থ্য', 16),
('পায়ুপথ', 'payupoth', 'Colon', 'পায়ুপথের রোগ, কোলন', 17),
('গর্ভাশয়', 'gorbhashoy', 'Uterus', 'নারী স্বাস্থ্য, গynecological', 18),
('বৃক্ক', 'brikko', 'Kidney', 'বৃক্কের রোগ', 19),
('অগ্ন্যাশয়', 'ognyashoy', 'Pancreas', 'ডায়াবেটিস, অগ্ন্যাশয়ের রোগ', 20);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_body_parts_updated BEFORE UPDATE ON public.body_parts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_article_body_parts_updated BEFORE UPDATE ON public.article_body_parts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();