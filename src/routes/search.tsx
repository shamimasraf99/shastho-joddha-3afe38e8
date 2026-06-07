import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, FileText, User, Building2, FlaskConical, Droplet, Video, Podcast, ShieldAlert, Layers, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    type: typeof search.type === "string" && search.type ? search.type.split(",") : [],
  }),
  component: SearchPage,
  head: () => ({
    meta: [
      { title: "অনুসন্ধান — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "স্বাস্থ্যপিডিয়ায় রোগ, ডাক্তার, হাসপাতাল ও আরও অনেক কিছু খুঁজুন।" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">পাওয়া যায়নি</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  ),
});

type Item = { type: string; title: string; subtitle?: string; href: string };

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "সংবাদ": FileText,
  "স্বাস্থ্যকোষ": FileText,
  "ক্যাটাগরি": Layers,
  "ডাক্তার": User,
  "হাসপাতাল": Building2,
  "ল্যাব": FlaskConical,
  "রক্তদাতা": Droplet,
  "ভিডিও": Video,
  "পডকাস্ট": Podcast,
  "Myth": ShieldAlert,
  "বডি": Heart,
};

const typeColors: Record<string, string> = {
  "সংবাদ": "bg-sky-50 text-sky-700 border-sky-200",
  "স্বাস্থ্যকোষ": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "ক্যাটাগরি": "bg-violet-50 text-violet-700 border-violet-200",
  "ডাক্তার": "bg-rose-50 text-rose-700 border-rose-200",
  "হাসপাতাল": "bg-blue-50 text-blue-700 border-blue-200",
  "ল্যাব": "bg-amber-50 text-amber-700 border-amber-200",
  "রক্তদাতা": "bg-red-50 text-red-700 border-red-200",
  "ভিডিও": "bg-pink-50 text-pink-700 border-pink-200",
  "পডকাস্ট": "bg-orange-50 text-orange-700 border-orange-200",
  "Myth": "bg-purple-50 text-purple-700 border-purple-200",
  "বডি": "bg-teal-50 text-teal-700 border-teal-200",
};

async function runSearch(q: string): Promise<Item[]> {
  const term = q.trim();
  if (!term) return [];
  const like = `%${term}%`;
  const [articles, doctors, hospitals, labs, donors, videos, podcasts, myths, cats, bodyParts] = await Promise.all([
    supabase.from("articles").select("title,slug,excerpt,article_type").eq("is_published", true).or(`title.ilike.${like},excerpt.ilike.${like},content.ilike.${like}`).limit(20),
    supabase.from("doctors").select("id,name,slug,speciality,district").eq("is_active", true).or(`name.ilike.${like},speciality.ilike.${like},hospital.ilike.${like}`).limit(20),
    supabase.from("hospitals").select("id,name,slug,district,address").eq("is_active", true).or(`name.ilike.${like},district.ilike.${like},address.ilike.${like}`).limit(20),
    supabase.from("labs").select("id,name,test_type,district").eq("is_active", true).or(`name.ilike.${like},test_type.ilike.${like},district.ilike.${like}`).limit(20),
    supabase.from("blood_donors").select("id,name,blood_group,district").eq("is_available", true).or(`name.ilike.${like},district.ilike.${like},blood_group.ilike.${like}`).limit(20),
    supabase.from("videos").select("id,title,category").eq("is_published", true).or(`title.ilike.${like},category.ilike.${like}`).limit(20),
    supabase.from("podcasts").select("id,title,description").eq("is_published", true).or(`title.ilike.${like},description.ilike.${like}`).limit(20),
    supabase.from("mythbusters").select("id,title,claim,fact").eq("is_published", true).or(`title.ilike.${like},claim.ilike.${like},fact.ilike.${like}`).limit(20),
    supabase.from("categories").select("title,slug,description").eq("is_active", true).or(`title.ilike.${like},description.ilike.${like}`).limit(20),
    supabase.from("body_parts").select("name,slug,description").eq("is_active", true).or(`name.ilike.${like},description.ilike.${like}`).limit(20),
  ]);

  const out: Item[] = [];
  for (const a of articles.data ?? []) {
    const type = a.article_type === "news" ? "সংবাদ" : "স্বাস্থ্যকোষ";
    out.push({ type, title: a.title, subtitle: a.excerpt ?? undefined, href: `/article/${a.slug}` });
  }
  for (const c of cats.data ?? []) out.push({ type: "ক্যাটাগরি", title: c.title, subtitle: c.description ?? undefined, href: `/category/${c.slug}` });
  for (const d of doctors.data ?? []) out.push({ type: "ডাক্তার", title: d.name, subtitle: [d.speciality, d.district].filter(Boolean).join(" • "), href: `/doctors?id=${d.id}` });
  for (const h of hospitals.data ?? []) {
    const href = h.slug ? `/hospitals/${h.slug}` : `/hospitals?id=${h.id}`;
    out.push({ type: "হাসপাতাল", title: h.name, subtitle: [h.district, h.address].filter(Boolean).join(" • "), href });
  }
  for (const l of labs.data ?? []) out.push({ type: "ল্যাব", title: l.name, subtitle: [l.test_type, l.district].filter(Boolean).join(" • "), href: `/labs?id=${l.id}` });
  for (const b of donors.data ?? []) out.push({ type: "রক্তদাতা", title: b.name, subtitle: [b.blood_group, b.district].filter(Boolean).join(" • "), href: `/donors?id=${b.id}` });
  for (const v of videos.data ?? []) out.push({ type: "ভিডিও", title: v.title, subtitle: v.category ?? undefined, href: `/videos?id=${v.id}` });
  for (const p of podcasts.data ?? []) out.push({ type: "পডকাস্ট", title: p.title, subtitle: p.description ?? undefined, href: `/podcasts?id=${p.id}` });
  for (const m of myths.data ?? []) out.push({ type: "Myth", title: m.title, subtitle: m.claim ?? undefined, href: `/myths?id=${m.id}` });
  for (const bp of bodyParts.data ?? []) out.push({ type: "বডি", title: bp.name, subtitle: bp.description ?? undefined, href: `/body/${bp.slug}` });
  return out;
}

const allTypes = ["সংবাদ", "স্বাস্থ্যকোষ", "ক্যাটাগরি", "ডাক্তার", "হাসপাতাল", "ল্যাব", "রক্তদাতা", "ভিডিও", "পডকাস্ট", "Myth", "বডি"];

function SearchPage() {
  const { q, type } = Route.useSearch();
  const selectedTypes = new Set(type);
  const navigate = useNavigate({ from: "/search" });
  const [term, setTerm] = useState(q);

  const { data, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: () => runSearch(q),
    enabled: q.trim().length > 0,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: { q: term.trim(), type: Array.from(selectedTypes) } });
  };

  const toggleFilter = (t: string) => {
    const next = new Set(selectedTypes);
    if (next.has(t)) {
      next.delete(t);
    } else {
      next.add(t);
    }
    navigate({ search: { q, type: Array.from(next) } });
  };

  const clearFilters = () => {
    navigate({ search: { q, type: [] } });
  };

  const filteredData = (data ?? []).filter((it) => {
    if (selectedTypes.size === 0) return true;
    return selectedTypes.has(it.type);
  });

  const grouped = filteredData.reduce<Record<string, Item[]>>((acc, it) => {
    (acc[it.type] ??= []).push(it);
    return acc;
  }, {});

  const typeOrder = ["সংবাদ", "স্বাস্থ্যকোষ", "ক্যাটাগরি", "ডাক্তার", "হাসপাতাল", "ল্যাব", "রক্তদাতা", "ভিডিও", "পডকাস্ট", "Myth", "বডি"];
  const sortedTypes = Object.keys(grouped).sort((a, b) => {
    const ai = typeOrder.indexOf(a);
    const bi = typeOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero search bar */}
        <section className="border-b border-border bg-gradient-to-br from-primary via-primary to-primary-dark text-primary-foreground">
          <div className="container mx-auto px-4 py-10 text-center md:py-14">
            <h1 className="text-2xl font-bold md:text-3xl">অনুসন্ধান</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-primary-foreground/85">
              রোগ, লক্ষণ, ঔষধ, ডাক্তার বা হাসপাতাল খুঁজুন...
            </p>
            <form onSubmit={submit} className="mx-auto mt-5 max-w-2xl">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="যেমন: হার্ট অ্যাটাক, ডায়াবেটিস, প্যারাসিটামল..."
                  className="w-full rounded-lg border border-white/20 bg-card py-4 pl-12 pr-32 text-base text-foreground shadow-lg outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
                >
                  খুঁজুন
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Results */}
        <section className="container mx-auto px-4 py-8 md:py-10">
          {/* Category filter chips */}
          {q.trim().length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">বিভাগ:</span>
              <button
                type="button"
                onClick={() => clearFilters()}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTypes.size === 0
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                সব
              </button>
              {allTypes.map((t) => {
                const Icon = typeIcons[t];
                const active = selectedTypes.has(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleFilter(t)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
                    }`}
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {t}
                  </button>
                );
              })}
            </div>
          )}

          {!q.trim() ? (
            <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-8 text-center">
              <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <p className="mt-3 text-muted-foreground">কীওয়ার্ড লিখে অনুসন্ধান করুন।</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-6 w-32 animate-pulse rounded bg-secondary" />
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-24 animate-pulse rounded-lg border border-border bg-secondary/40" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (filteredData.length ?? 0) === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-8 text-center">
              <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <p className="mt-3 text-muted-foreground">
                "<span className="font-semibold text-foreground">{q}</span>" এর জন্য কোনো ফলাফল পাওয়া যায়নি।
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <p className="text-sm text-muted-foreground">
                "<span className="font-semibold text-foreground">{q}</span>" এর জন্য{" "}
                <span className="font-semibold text-foreground">{filteredData.length}</span> টি ফলাফল
              </p>
              {sortedTypes.map((type) => {
                const items = grouped[type];
                const Icon = typeIcons[type] || FileText;
                const badgeClass = typeColors[type] || "bg-secondary text-foreground border-border";
                return (
                  <section key={type}>
                    <div className="mb-3 flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-bold text-foreground">{type}</h2>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                        {items.length}
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((it, i) => (
                        <a
                          key={i}
                          href={it.href}
                          className="group flex flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                        >
                          <div className="font-semibold text-foreground group-hover:text-primary">
                            {it.title}
                          </div>
                          {it.subtitle && (
                            <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {it.subtitle}
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </section>
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
