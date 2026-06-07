import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Calendar, Newspaper, Heart, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/body/$slug")({
  component: BodyPartPage,
  notFoundComponent: () => {
    const { slug } = Route.useParams();
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">অঙ্গ পাওয়া যায়নি</h1>
          <p className="mt-2 text-muted-foreground">"{slug}" নামে কোনো অঙ্গের তথ্য নেই।</p>
          <Link to="/body" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            সব অঙ্গ দেখুন
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  },
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">কিছু একটা ভুল হয়েছে</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </main>
      <SiteFooter />
    </div>
  ),
});

function BodyPartPage() {
  const { slug } = Route.useParams();

  const { data: bodyPart, isLoading: bpLoading } = useQuery({
    queryKey: ["body-part", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("body_parts")
        .select("id,name,slug,icon,description")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: articles, isLoading: artLoading } = useQuery({
    queryKey: ["body-part-articles", bodyPart?.id],
    enabled: !!bodyPart?.id,
    queryFn: async () => {
      const { data: links, error: linkError } = await supabase
        .from("article_body_parts")
        .select("article_id")
        .eq("body_part_id", bodyPart!.id);
      if (linkError) throw linkError;
      const ids = links?.map((l) => l.article_id) ?? [];
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from("articles")
        .select("id,title,slug,excerpt,cover_image,published_at,created_at,article_type")
        .in("id", ids)
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-gradient-to-br from-primary via-primary to-primary-dark text-primary-foreground">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <Link to="/body" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground/80 hover:text-primary-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> শরীরের অঙ্গ
            </Link>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              {bpLoading ? "লোড হচ্ছে..." : bodyPart?.name}
            </h1>
            {bodyPart?.description && (
              <p className="mt-3 max-w-2xl text-primary-foreground/85">{bodyPart.description}</p>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
            <Heart className="h-6 w-6 text-primary" />
            সম্পর্কিত আর্টিকেল
          </h2>

          {artLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-lg border border-border bg-secondary/40" />
              ))}
            </div>
          ) : !articles || articles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                এই অঙ্গের জন্য এখনও কোনো আর্টিকেল যোগ করা হয়নি।
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((n) => {
                const href = `/article/${n.slug}`;
                return (
                  <a
                    key={n.id}
                    href={href}
                    className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden bg-secondary">
                      {n.cover_image ? (
                        <img src={n.cover_image} alt={n.title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-muted-foreground">
                          <Newspaper className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-base font-bold text-foreground group-hover:text-primary">{n.title}</h3>
                      {n.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{n.excerpt}</p>}
                      <div className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(n.published_at ?? n.created_at).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
