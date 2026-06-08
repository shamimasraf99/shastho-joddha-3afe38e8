import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
  category_id: string | null;
};

type Category = {
  id: string;
  title: string;
  slug: string;
};

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "স্বাস্থ্য সংবাদ — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "সর্বশেষ স্বাস্থ্য সংবাদ ও আপডেট বাংলায়।" },
      { property: "og:title", content: "স্বাস্থ্য সংবাদ — স্বাস্থ্যপিডিয়া" },
      { property: "og:description", content: "সর্বশেষ স্বাস্থ্য সংবাদ ও আপডেট বাংলায়।" },
      { property: "og:url", content: "https://helthpidia.pp.ua/news" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://helthpidia.pp.ua/news" }],
  }),
  component: NewsPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-destructive">ত্রুটি: {error.message}</p>
        <button onClick={() => { reset(); router.invalidate(); }} className="mt-3 rounded bg-primary px-4 py-2 text-primary-foreground">আবার চেষ্টা করুন</button>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-8 text-center">পাওয়া যায়নি</div>,
});

function NewsPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string | "all">("all");

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase
        .from("articles")
        .select("id,title,slug,excerpt,cover_image,published_at,created_at,category_id")
        .eq("article_type", "news")
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("categories")
        .select("id,title,slug")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]).then(([a, c]) => {
      if (!active) return;
      setItems((a.data as Article[]) || []);
      setCategories((c.data as Category[]) || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const filtered = activeCat === "all" ? items : items.filter((i) => i.category_id === activeCat);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">নিউজ</div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">স্বাস্থ্য সংবাদ</h1>
        </div>
        <div className="mb-6">
          <div className="mb-2 text-sm font-semibold text-foreground">স্বাস্থ্য বিভাগসমূহ</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCat("all")}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${activeCat === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary hover:text-primary"}`}
            >
              সব
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${activeCat === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary hover:text-primary"}`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">কোনো সংবাদ পাওয়া যায়নি।</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <Link key={a.id} to="/article/$slug" params={{ slug: a.slug }} className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                {a.cover_image && <img src={a.cover_image} alt={a.title} className="h-44 w-full object-cover" loading="lazy" />}
                <div className="p-4">
                  <h2 className="line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-primary">{a.title}</h2>
                  {a.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{a.excerpt}</p>}
                  <p className="font-kalpurush mt-3 text-xs text-muted-foreground">{new Date(a.published_at || a.created_at).toLocaleDateString("bn-BD")}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}