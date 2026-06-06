import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LocationMap } from "@/components/LocationMap";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart, Droplet, Activity, Ribbon, Brain, Baby, Apple,
  Hand, Eye, Smile, Pill, User, Search, Stethoscope, Newspaper, Calendar,
  Scissors, Flower2, BookOpen, BrainCircuit,
} from "lucide-react";
import kidneyIcon from "@/assets/kidney-icon.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "স্বাস্থ্যপিডিয়া — বাংলাদেশের ডিজিটাল স্বাস্থ্য তথ্য ভান্ডার" },
      { name: "description", content: "বাংলায় নির্ভরযোগ্য স্বাস্থ্য তথ্য, বিশেষজ্ঞ ডাক্তার, হাসপাতাল, ল্যাব ও রক্তদাতা — এক ঠিকানায়।" },
      { property: "og:title", content: "স্বাস্থ্যপিডিয়া" },
      { property: "og:description", content: "বাংলাদেশের সবচেয়ে বড় ডিজিটাল স্বাস্থ্য তথ্য ভান্ডার।" },
    ],
  }),
  component: Index,
});

type CategoryItem = {
  title: string;
  slug: string;
  color: string;
  Icon?: React.ComponentType<{ className?: string }>;
  image?: string;
};

const categories: CategoryItem[] = [
  { title: "হার্ট", slug: "heart", Icon: Heart, color: "text-rose-600" },
  { title: "ডায়াবেটিস", slug: "diabetes", Icon: Droplet, color: "text-sky-600" },
  { title: "কিডনি", slug: "kidney", image: kidneyIcon.url, color: "text-amber-600" },
  { title: "ক্যান্সার", slug: "cancer", Icon: Ribbon, color: "text-pink-600" },
  { title: "মানসিক স্বাস্থ্য", slug: "mental-health", Icon: Brain, color: "text-violet-600" },
  { title: "নারী স্বাস্থ্য", slug: "womens-health", Icon: User, color: "text-fuchsia-600" },
  { title: "শিশু", slug: "children", Icon: Baby, color: "text-orange-500" },
  { title: "পুষ্টি", slug: "nutrition", Icon: Apple, color: "text-emerald-600" },
  { title: "চর্ম", slug: "skin", Icon: Hand, color: "text-yellow-700" },
  { title: "চোখ", slug: "eye", Icon: Eye, color: "text-cyan-600" },
  { title: "দন্ত", slug: "dental", Icon: Smile, color: "text-blue-600" },
  { title: "ঔষধ", slug: "medicine", Icon: Pill, color: "text-teal-600" },
  { title: "মেডিসিন", slug: "medicine-dept", Icon: Stethoscope, color: "text-indigo-600" },
  { title: "সার্জারি", slug: "surgery", Icon: Scissors, color: "text-red-600" },
  { title: "গাইনি এন্ড অবস", slug: "gynae-obs", Icon: Flower2, color: "text-pink-500" },
  { title: "ডাইরেক্টরি", slug: "directory", Icon: BookOpen, color: "text-slate-700" },
  { title: "নিউরো", slug: "neuro", Icon: BrainCircuit, color: "text-purple-600" },
];

function Index() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary via-primary to-primary-dark text-primary-foreground">
          <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="container relative mx-auto px-4 py-14 text-center md:py-20">
            <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
              বাংলাদেশের সবচেয়ে বড় ডিজিটাল স্বাস্থ্য তথ্য ভান্ডার
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-primary-foreground/85 md:text-base">
              রোগ, লক্ষণ, চিকিৎসা, বিশেষজ্ঞ ডাক্তার, হাসপাতাল, ল্যাব ও রক্তদাতা — সব
              নির্ভরযোগ্য তথ্য বাংলায়, এক ঠিকানায়।
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); const t = q.trim(); if (t) navigate({ to: "/search", search: { q: t } }); }}
              className="mx-auto mt-6 max-w-2xl"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="যেমন: হার্ট অ্যাটাক, ডায়াবেটিস, প্যারাসিটামল..."
                  className="w-full rounded-lg border border-white/20 bg-card py-4 pl-12 pr-32 text-base text-foreground shadow-lg outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
                >
                  খুঁজুন
                </button>
              </div>
            </form>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href="/encyclopedia"
                className="inline-flex items-center gap-2 rounded-md bg-card px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary"
              >
                <Heart className="h-4 w-4" /> স্বাস্থ্য খুঁজুন
              </a>
              <a
                href="/doctors"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-transparent px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-white/10"
              >
                <Stethoscope className="h-4 w-4" /> বিশেষজ্ঞ খুঁজুন
              </a>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                স্বাস্থ্যকোষ
              </div>
              <h2 className="text-2xl font-bold md:text-3xl">স্বাস্থ্য বিভাগসমূহ</h2>
            </div>
            <a href="/encyclopedia" className="text-sm font-medium text-primary hover:text-primary-dark">
              সব দেখুন →
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map(({ title, slug, Icon, image, color }) => (
              <a
                key={slug}
                href={`/category/${slug}`}
                className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <span className={`grid h-12 w-12 place-items-center rounded-full bg-secondary ${color} transition-transform group-hover:scale-110`}>
                  {image ? (
                    <img src={image} alt={title} className="h-8 w-8 object-contain" />
                  ) : Icon ? (
                    <Icon className="h-6 w-6" />
                  ) : null}
                </span>
                <span className="text-sm font-semibold text-foreground">{title}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Quick directories CTAs */}
        <section className="container mx-auto px-4 pb-12">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { href: "/doctors", title: "বিশেষজ্ঞ ডাক্তার", desc: "সারা দেশের ডাক্তার ও বিশেষজ্ঞ" },
              { href: "/hospitals", title: "হাসপাতাল", desc: "জরুরি নম্বর ও ঠিকানা সহ" },
              { href: "/labs", title: "ল্যাব টেস্ট", desc: "মূল্য ও জেলাভিত্তিক ল্যাব" },
              { href: "/donors", title: "রক্তদাতা", desc: "ব্লাড গ্রুপ ও জেলা অনুযায়ী" },
            ].map((c) => (
              <a
                key={c.href}
                href={c.href}
                className="group rounded-lg border-l-4 border-accent bg-card p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="text-base font-bold text-primary group-hover:text-primary-dark">{c.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{c.desc}</div>
              </a>
            ))}
          </div>
        </section>

        {/* Health News */}
        <NewsSection />

        {/* Location Map */}
        <LocationMap />
      </main>
      <SiteFooter />
    </div>
  );
}

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
};

function NewsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["home", "news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id,title,slug,excerpt,cover_image,published_at,created_at")
        .eq("article_type", "news")
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []) as NewsItem[];
    },
  });

  return (
    <section className="container mx-auto px-4 pb-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
            <Newspaper className="h-4 w-4" /> সর্বশেষ
          </div>
          <h2 className="text-2xl font-bold md:text-3xl">স্বাস্থ্য সংবাদ</h2>
        </div>
        <a href="/news" className="text-sm font-medium text-primary hover:text-primary-dark">
          সব সংবাদ →
        </a>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg border border-border bg-secondary/40" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            এখনও কোনো স্বাস্থ্য সংবাদ প্রকাশিত হয়নি। অ্যাডমিন প্যানেল থেকে সংবাদ পোস্ট করলে এখানে স্বয়ংক্রিয়ভাবে দেখা যাবে।
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((n) => (
            <a
              key={n.id}
              href={`/news/${n.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-secondary">
                {n.cover_image ? (
                  <img
                    src={n.cover_image}
                    alt={n.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-muted-foreground">
                    <Newspaper className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-base font-bold text-foreground group-hover:text-primary">
                  {n.title}
                </h3>
                {n.excerpt && (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{n.excerpt}</p>
                )}
                <div className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(n.published_at ?? n.created_at).toLocaleDateString("bn-BD", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
