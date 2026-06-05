import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Search, BookOpen } from "lucide-react";

type Entry = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  tags: string[] | null;
};

export const Route = createFileRoute("/encyclopedia")({
  head: () => ({
    meta: [
      { title: "স্বাস্থ্যকোষ (Encyclopedia) — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "রোগ, লক্ষণ ও চিকিৎসা সম্পর্কিত বাংলা এনসাইক্লোপিডিয়া।" },
    ],
  }),
  component: EncyclopediaPage,
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

function EncyclopediaPage() {
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    supabase
      .from("articles")
      .select("id,title,slug,excerpt,cover_image,tags")
      .eq("article_type", "encyclopedia")
      .eq("is_published", true)
      .order("title", { ascending: true })
      .limit(500)
      .then(({ data }) => {
        if (active) {
          setItems((data as Entry[]) || []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!q) return items;
    const t = q.toLowerCase();
    return items.filter((i) =>
      `${i.title} ${i.excerpt ?? ""} ${(i.tags ?? []).join(" ")}`.toLowerCase().includes(t)
    );
  }, [items, q]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">এনসাইক্লোপিডিয়া</div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">স্বাস্থ্যকোষ</h1>
        </div>
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="রোগ, লক্ষণ বা টপিক খুঁজুন..."
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">কোনো এন্ট্রি পাওয়া যায়নি।</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <Link key={e.id} to="/article/$slug" params={{ slug: e.slug }} className="group rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-primary">{e.title}</h2>
                    {e.excerpt && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{e.excerpt}</p>}
                    {e.tags && e.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {e.tags.slice(0, 3).map((t) => (
                          <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
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