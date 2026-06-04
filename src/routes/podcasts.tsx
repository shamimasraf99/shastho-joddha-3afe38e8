import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Youtube } from "lucide-react";

type Podcast = {
  id: string;
  title: string;
  description: string | null;
  youtube_link: string | null;
  spotify_link: string | null;
  thumbnail: string | null;
};

export const Route = createFileRoute("/podcasts")({
  head: () => ({
    meta: [
      { title: "পডকাস্ট — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "স্বাস্থ্য বিষয়ক পডকাস্ট সংগ্রহ।" },
    ],
  }),
  component: PodcastsPage,
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

function PodcastsPage() {
  const [items, setItems] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    supabase
      .from("podcasts")
      .select("id,title,description,youtube_link,spotify_link,thumbnail")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (alive) {
          setItems((data as Podcast[]) || []);
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
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">পডকাস্ট</h1>
        </div>
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">কোনো পডকাস্ট পাওয়া যায়নি।</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <article key={p.id} className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                {p.thumbnail ? (
                  <img src={p.thumbnail} alt={p.title} className="h-44 w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center bg-secondary"><Mic className="h-12 w-12 text-muted-foreground" /></div>
                )}
                <div className="p-4">
                  <h2 className="line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-primary">{p.title}</h2>
                  {p.description && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.youtube_link && (
                      <a href={p.youtube_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20">
                        <Youtube className="h-3.5 w-3.5" /> YouTube
                      </a>
                    )}
                    {p.spotify_link && (
                      <a href={p.spotify_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
                        Spotify
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}