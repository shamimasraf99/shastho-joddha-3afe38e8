import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Calendar, Newspaper } from "lucide-react";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  notFoundComponent: () => {
    const { slug } = Route.useParams();
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">বিভাগ পাওয়া যায়নি</h1>
          <p className="mt-2 text-muted-foreground">"{slug}" নামে কোনো বিভাগ নেই।</p>
          <Link to="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">হোমে যান</Link>
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

function CategoryPage() {
  const { slug } = Route.useParams();

  const { data: category, isLoading: catLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id,title,slug,description,content,icon")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: articles, isLoading: artLoading } = useQuery({
    queryKey: ["category-articles", category?.id],
    enabled: !!category?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id,title,slug,excerpt,cover_image,published_at,created_at,article_type")
        .eq("category_id", category!.id)
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
            <div className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">স্বাস্থ্য বিভাগ</div>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              {catLoading ? "লোড হচ্ছে..." : category?.title}
            </h1>
            {category?.description && (
              <p className="mt-3 max-w-2xl text-primary-foreground/85">{category.description}</p>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          {category?.content && (
            <div className="prose prose-sm mb-10 max-w-none whitespace-pre-wrap rounded-lg border border-border bg-card p-6 text-foreground">
              {category.content}
            </div>
          )}

          <h2 className="mb-6 text-2xl font-bold">এই বিভাগের আর্টিকেল</h2>

          {artLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-lg border border-border bg-secondary/40" />
              ))}
            </div>
          ) : !articles || articles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                এই বিভাগে এখনও কোনো আর্টিকেল প্রকাশিত হয়নি।
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