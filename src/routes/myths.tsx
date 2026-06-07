import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Search, XCircle, CheckCircle, User, Video } from "lucide-react";

type Myth = {
  id: string;
  title: string;
  claim: string;
  fact: string;
  doctor_name: string | null;
  video: string | null;
};

export const Route = createFileRoute("/myths")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  head: () => ({
    meta: [
      { title: "মিথবাস্টার — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "সাধারণ স্বাস্থ্য বিষয়ক ভুল ধারণা এবং প্রকৃত তথ্য।" },
    ],
  }),
  component: MythsPage,
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

function MythsPage() {
  const { q: initialQ } = Route.useSearch();
  const [items, setItems] = useState<Myth[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    let active = true;
    supabase
      .from("mythbusters")
      .select("id,title,claim,fact,doctor_name,video")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => {
        if (active) {
          setItems((data as Myth[]) || []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const filtered = items.filter((m) => {
    if (!q) return true;
    const t = q.toLowerCase();
    const hay = `${m.title} ${m.claim} ${m.fact}`.toLowerCase();
    return hay.includes(t);
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">মিথবাস্টার</div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">সাধারণ ভুল ধারণা vs প্রকৃত তথ্য</h1>
          <p className="mt-1 text-sm text-muted-foreground">মোট {filtered.length} টি মিথ।</p>
        </div>

        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="মিথ খুঁজুন..."
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">কোনো মিথ পাওয়া যায়নি।</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((m) => (
              <article key={m.id} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <div className="p-4">
                  <h2 className="text-base font-bold text-foreground">{m.title}</h2>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <div>
                        <div className="text-xs font-semibold uppercase text-destructive">ভুল ধারণা</div>
                        <p className="mt-0.5 text-sm text-destructive/90">{m.claim}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-md bg-emerald-50 p-3 dark:bg-emerald-900/20">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <div>
                        <div className="text-xs font-semibold uppercase text-emerald-600">প্রকৃত তথ্য</div>
                        <p className="mt-0.5 text-sm text-emerald-700 dark:text-emerald-300">{m.fact}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    {m.doctor_name && (
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span>{m.doctor_name}</span>
                      </div>
                    )}
                    {m.video && (
                      <a href={m.video} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <Video className="h-3.5 w-3.5" />
                        <span>ভিডিও দেখুন</span>
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
