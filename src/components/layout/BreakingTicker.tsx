import { Megaphone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fallback = [
  "ডেঙ্গু সতর্কতা: বৃষ্টির পর জমা পানিতে এডিস মশার বংশবিস্তার বেড়েছে।",
  "ঢাকার হাসপাতালগুলোতে বিনামূল্যে চক্ষু পরীক্ষা ক্যাম্প চলছে।",
];

export function BreakingTicker() {
  const { data } = useQuery({
    queryKey: ["breaking-ticker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("title,slug")
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

  const articles = data && data.length > 0 ? data : null;
  const loop = articles
    ? [...articles, ...articles]
    : [...fallback, ...fallback].map((t) => ({ title: t, slug: "" }));
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center gap-3 px-4 py-2">
        <span className="flex shrink-0 items-center gap-1.5 rounded-sm bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
          <Megaphone className="h-3.5 w-3.5" /> ব্রেকিং
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track flex whitespace-nowrap text-sm">
            {loop.map((item, i) =>
              item.slug ? (
                <a
                  key={i}
                  href={`/news/${item.slug}`}
                  className="px-8 text-foreground/90 hover:text-primary"
                >
                  • {item.title}
                </a>
              ) : (
                <span key={i} className="px-8 text-foreground/90">• {item.title}</span>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}