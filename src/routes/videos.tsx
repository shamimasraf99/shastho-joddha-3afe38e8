import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

type Video = {
  id: string;
  title: string;
  description: string | null;
  youtube_id: string;
  thumbnail: string | null;
  category: string | null;
  autoplay: boolean | null;
};

function extractYouTubeId(input: string): string {
  if (!input) return "";
  const s = input.trim();
  // If it's already an ID (no slashes/dots), return as-is
  if (!/[\/.?=&]/.test(s)) return s;
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/(?:embed|shorts|v)\/)([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  const fallback = s.match(/([\w-]{11})/);
  return fallback ? fallback[1] : s;
}

export const Route = createFileRoute("/videos")({
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === "string" ? s.id : "",
  }),
  head: () => ({
    meta: [
      { title: "ভিডিও — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "স্বাস্থ্য বিষয়ক ভিডিও সংগ্রহ।" },
      { property: "og:title", content: "ভিডিও — স্বাস্থ্যপিডিয়া" },
      { property: "og:description", content: "বাংলায় স্বাস্থ্য বিষয়ক বাছাই করা ভিডিও।" },
      { property: "og:url", content: "https://helthpidia.pp.ua/videos" },
    ],
    links: [{ rel: "canonical", href: "https://helthpidia.pp.ua/videos" }],
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

  useEffect(() => {
    let alive = true;
    supabase
      .from("videos")
      .select("id,title,description,youtube_id,thumbnail,category,autoplay")
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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">মিডিয়া</div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">ভিডিও</h1>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">কোনো ভিডিও পাওয়া যায়নি।</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(focusId ? items.filter((x) => x.id === focusId) : items).map((v) => {
              const vid = extractYouTubeId(v.youtube_id);
              const ap = v.autoplay ? 1 : 0;
              return (
                <article key={v.id} className="group overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition-all hover:border-primary hover:shadow-md">
                  <div className="aspect-video w-full overflow-hidden bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${vid}?autoplay=${ap}&mute=${ap}&rel=0`}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      className="h-full w-full"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="line-clamp-2 text-base font-bold leading-snug text-foreground">{v.title}</h2>
                    {v.category && <p className="mt-1 text-xs text-muted-foreground">{v.category}</p>}
                    {v.description && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{v.description}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}