import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { PlayCircle } from "lucide-react";

type Video = {
  id: string;
  title: string;
  description: string | null;
  youtube_id: string;
  thumbnail: string | null;
  category: string | null;
};

export const Route = createFileRoute("/videos")({
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === "string" ? s.id : "",
  }),
  head: () => ({
    meta: [
      { title: "ভিডিও — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "স্বাস্থ্য বিষয়ক ভিডিও সংগ্রহ।" },
    ],
  }),
  component: VideosPage,
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

function VideosPage() {
  const { id: focusId } = Route.useSearch();
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Video | null>(null);

  useEffect(() => {
    let alive = true;
    supabase
      .from("videos")
      .select("id,title,description,youtube_id,thumbnail,category")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (alive) {
          setItems((data as Video[]) || []);
          setLoading(false);
        }
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (focusId && items.length) {
      const v = items.find((x) => x.id === focusId);
      if (v) setActive(v);
    }
  }, [focusId, items]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">মিডিয়া</div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">ভিডিও</h1>
        </div>

        {active && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setActive(null)}>
            <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${active.youtube_id}?autoplay=1`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
              <button onClick={() => setActive(null)} className="mt-3 rounded bg-primary px-4 py-2 text-sm text-primary-foreground">বন্ধ করুন</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">কোনো ভিডিও পাওয়া যায়নি।</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((v) => (
              <button key={v.id} onClick={() => setActive(v)} className="group overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                <div className="relative aspect-video w-full bg-muted">
                  <img src={v.thumbnail || `https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`} alt={v.title} className="h-full w-full object-cover" loading="lazy" />
                  <PlayCircle className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-lg transition-transform group-hover:scale-110" />
                </div>
                <div className="p-4">
                  <h2 className="line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-primary">{v.title}</h2>
                  {v.category && <p className="mt-1 text-xs text-muted-foreground">{v.category}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}