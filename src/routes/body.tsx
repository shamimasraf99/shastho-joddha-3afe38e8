import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/body")({
  component: BodyPartsPage,
  head: () => ({
    meta: [
      { title: "শরীরের অঙ্গ — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "শরীরের বিভিন্ন অঙ্গ অনুযায়ী স্বাস্থ্য তথ্য ব্রাউজ করুন।" },
    ],
  }),
});

function BodyPartsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["body-parts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("body_parts")
        .select("id,name,slug,icon,description")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-gradient-to-br from-primary via-primary to-primary-dark text-primary-foreground">
          <div className="container mx-auto px-4 py-12 text-center md:py-16">
            <h1 className="text-3xl font-bold md:text-4xl">শরীরের অঙ্গ</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/85">
              শরীরের বিভিন্ন অঙ্গ অনুযায়ী রোগ, লক্ষণ ও স্বাস্থ্য তথ্য খুঁজুন।
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg border border-border bg-secondary/40" />
              ))}
            </div>
          ) : !data || data.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">কোনো অঙ্গের তথ্য পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.map((bp) => (
                <Link
                  key={bp.id}
                  to={`/body/${bp.slug}`}
                  className="group flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-teal-50 text-teal-700 transition-transform group-hover:scale-110">
                    <Heart className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground group-hover:text-primary">{bp.name}</h3>
                  {bp.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{bp.description}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
