import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Search, HelpCircle, MessageCircle, User } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

type QA = {
  id: string;
  name: string;
  question: string;
  answer: string | null;
  answered_by: string | null;
};

export const Route = createFileRoute("/qa")({
  loader: async () => {
    const { data } = await supabase
      .from("questions")
      .select("question,answer")
      .eq("is_published", true)
      .not("answer", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data ?? []) as { question: string; answer: string | null }[];
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: "প্রশ্ন-উত্তর — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "স্বাস্থ্য বিষয়ক সাধারণ প্রশ্ন ও বিশেষজ্ঞ উত্তর।" },
      { property: "og:title", content: "প্রশ্ন-উত্তর — স্বাস্থ্যপিডিয়া" },
      { property: "og:description", content: "স্বাস্থ্য বিষয়ক সাধারণ প্রশ্ন ও বিশেষজ্ঞ উত্তর।" },
      { property: "og:url", content: "https://helthpidia.pp.ua/qa" },
    ],
    links: [{ rel: "canonical", href: "https://helthpidia.pp.ua/qa" }],
    scripts:
      loaderData && loaderData.length
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: loaderData.map((q) => ({
                  "@type": "Question",
                  name: q.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: (q.answer ?? "").replace(/<[^>]+>/g, "").slice(0, 1000),
                  },
                })),
              }),
            },
          ]
        : [],
  }),
  component: QAPage,
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

function QAPage() {
  const [items, setItems] = useState<QA[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    supabase
      .from("questions")
      .select("id,name,question,answer,answered_by")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => {
        if (active) {
          setItems((data as QA[]) || []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const filtered = items.filter((item) => {
    if (!q) return true;
    const t = q.toLowerCase();
    const hay = `${item.question} ${item.answer ?? ""}`.toLowerCase();
    return hay.includes(t);
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">Q&A</div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">প্রশ্ন-উত্তর</h1>
          <p className="mt-1 text-sm text-muted-foreground">মোট {filtered.length} টি প্রশ্ন-উত্তর।</p>
        </div>

        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="প্রশ্ন খুঁজুন..."
              aria-label="প্রশ্ন খুঁজুন"
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">কোনো প্রশ্ন-উত্তর পাওয়া যায়নি।</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <div className="p-4">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{item.question}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{item.name}</span>
                      </div>
                    </div>
                  </div>
                  {item.answer && (
                    <div className="mt-3 flex items-start gap-2 rounded-md bg-primary/5 p-3">
                      <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold uppercase text-primary">উত্তর</div>
                        <div
                          className="mt-1 text-sm text-foreground"
                          dangerouslySetInnerHTML={{ __html: item.answer }}
                        />
                        {item.answered_by && (
                          <div className="mt-1 text-xs text-muted-foreground">— {item.answered_by}</div>
                        )}
                      </div>
                    </div>
                  )}
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
