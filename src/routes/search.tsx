import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";

const schema = z.object({ q: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(schema),
  component: SearchPage,
  errorComponent: ({ error }) => <div className="container mx-auto p-6">{error.message}</div>,
  notFoundComponent: () => <div className="container mx-auto p-6">পাওয়া যায়নি</div>,
});

type Item = { type: string; title: string; subtitle?: string; href: string };

async function runSearch(q: string): Promise<Item[]> {
  const term = q.trim();
  if (!term) return [];
  const like = `%${term}%`;
  const [articles, doctors, hospitals, labs, donors, videos, podcasts, myths, cats] = await Promise.all([
    supabase.from("articles").select("title,slug,excerpt,article_type").eq("is_published", true).or(`title.ilike.${like},excerpt.ilike.${like},content.ilike.${like}`).limit(20),
    supabase.from("doctors").select("name,slug,speciality,district").eq("is_active", true).or(`name.ilike.${like},speciality.ilike.${like},hospital.ilike.${like}`).limit(20),
    supabase.from("hospitals").select("name,slug,district,address").eq("is_active", true).or(`name.ilike.${like},district.ilike.${like},address.ilike.${like}`).limit(20),
    supabase.from("labs").select("id,name,test_type,district").eq("is_active", true).or(`name.ilike.${like},test_type.ilike.${like},district.ilike.${like}`).limit(20),
    supabase.from("blood_donors").select("id,name,blood_group,district").eq("is_available", true).or(`name.ilike.${like},district.ilike.${like},blood_group.ilike.${like}`).limit(20),
    supabase.from("videos").select("id,title,category").eq("is_published", true).or(`title.ilike.${like},category.ilike.${like}`).limit(20),
    supabase.from("podcasts").select("id,title,description").eq("is_published", true).or(`title.ilike.${like},description.ilike.${like}`).limit(20),
    supabase.from("mythbusters").select("id,title,claim,fact").eq("is_published", true).or(`title.ilike.${like},claim.ilike.${like},fact.ilike.${like}`).limit(20),
    supabase.from("categories").select("title,slug,description").eq("is_active", true).or(`title.ilike.${like},description.ilike.${like}`).limit(20),
  ]);

  const out: Item[] = [];
  for (const a of articles.data ?? []) {
    const type = a.article_type === "news" ? "সংবাদ" : "স্বাস্থ্যকোষ";
    out.push({ type, title: a.title, subtitle: a.excerpt ?? undefined, href: `/article/${a.slug}` });
  }
  for (const c of cats.data ?? []) out.push({ type: "ক্যাটাগরি", title: c.title, subtitle: c.description ?? undefined, href: `/category/${c.slug}` });
  for (const d of doctors.data ?? []) out.push({ type: "ডাক্তার", title: d.name, subtitle: [d.speciality, d.district].filter(Boolean).join(" • "), href: `/doctors?q=${encodeURIComponent(d.name)}` });
  for (const h of hospitals.data ?? []) out.push({ type: "হাসপাতাল", title: h.name, subtitle: [h.district, h.address].filter(Boolean).join(" • "), href: `/hospitals?q=${encodeURIComponent(h.name)}` });
  for (const l of labs.data ?? []) out.push({ type: "ল্যাব", title: l.name, subtitle: [l.test_type, l.district].filter(Boolean).join(" • "), href: `/labs` });
  for (const b of donors.data ?? []) out.push({ type: "রক্তদাতা", title: b.name, subtitle: [b.blood_group, b.district].filter(Boolean).join(" • "), href: `/donors` });
  for (const v of videos.data ?? []) out.push({ type: "ভিডিও", title: v.title, subtitle: v.category ?? undefined, href: `/videos` });
  for (const p of podcasts.data ?? []) out.push({ type: "পডকাস্ট", title: p.title, subtitle: p.description ?? undefined, href: `/podcasts` });
  for (const m of myths.data ?? []) out.push({ type: "Myth", title: m.title, subtitle: m.claim ?? undefined, href: `/myths` });
  return out;
}

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [term, setTerm] = useState(q);

  const { data, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: () => runSearch(q),
    enabled: q.trim().length > 0,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: { q: term.trim() } });
  };

  const grouped = (data ?? []).reduce<Record<string, Item[]>>((acc, it) => {
    (acc[it.type] ??= []).push(it);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">অনুসন্ধান</h1>
      <form onSubmit={submit} className="mb-6 max-w-2xl">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="রোগ, লক্ষণ, ঔষধ, ডাক্তার বা হাসপাতাল খুঁজুন..."
            className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-24 text-sm outline-none ring-primary/30 focus:ring-2"
            autoFocus
          />
          <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">খুঁজুন</button>
        </div>
      </form>

      {!q.trim() ? (
        <p className="text-muted-foreground">কীওয়ার্ড লিখে অনুসন্ধান করুন।</p>
      ) : isLoading ? (
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      ) : (data?.length ?? 0) === 0 ? (
        <p className="text-muted-foreground">"{q}" এর জন্য কোনো ফলাফল পাওয়া যায়নি।</p>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">"{q}" এর জন্য {data!.length} টি ফলাফল</p>
          {Object.entries(grouped).map(([type, items]) => (
            <section key={type}>
              <h2 className="mb-2 text-lg font-bold">{type} <span className="text-sm font-normal text-muted-foreground">({items.length})</span></h2>
              <div className="grid gap-2">
                {items.map((it, i) => (
                  <Link key={i} to={it.href} className="block rounded-lg border bg-card p-3 hover:bg-secondary/50">
                    <div className="font-semibold">{it.title}</div>
                    {it.subtitle && <div className="line-clamp-2 text-sm text-muted-foreground">{it.subtitle}</div>}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}