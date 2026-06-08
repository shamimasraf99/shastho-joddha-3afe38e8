import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Phone, Building2, Siren } from "lucide-react";

type Hospital = {
  id: string;
  name: string;
  district: string | null;
  address: string | null;
  phone: string | null;
  emergency_number: string | null;
  image: string | null;
  description: string | null;
  google_map: string | null;
  category: string | null;
};

const categories: { key: string; label: string }[] = [
  { key: "", label: "সব" },
  { key: "cancer", label: "ক্যান্সার" },
  { key: "maternal", label: "মা / মাতৃত্ব" },
  { key: "child", label: "শিশু" },
];

export const Route = createFileRoute("/hospitals")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    id: typeof s.id === "string" ? s.id : "",
  }),
  head: () => ({
    meta: [
      { title: "হাসপাতাল — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "বাংলাদেশের হাসপাতালের তালিকা — ঠিকানা, ফোন ও জরুরি নম্বর সহ।" },
      { property: "og:title", content: "হাসপাতাল — স্বাস্থ্যপিডিয়া" },
      { property: "og:description", content: "বাংলাদেশের হাসপাতালের তালিকা — ঠিকানা, ফোন ও জরুরি নম্বর সহ।" },
      { property: "og:url", content: "https://helthpidia.pp.ua/hospitals" },
    ],
    links: [{ rel: "canonical", href: "https://helthpidia.pp.ua/hospitals" }],
  }),
  component: HospitalsPage,
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

function HospitalsPage() {
  const { q: initialQ, id: focusId } = Route.useSearch();
  const [items, setItems] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState("");
  const [q, setQ] = useState(initialQ);
  const [cat, setCat] = useState("");

  useEffect(() => {
    let active = true;
    supabase
      .from("hospitals")
      .select("id,name,district,address,phone,emergency_number,image,description,google_map,category")
      .eq("is_active", true)
      .order("name", { ascending: true })
      .limit(500)
      .then(({ data }) => {
        if (active) {
          setItems((data as Hospital[]) || []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const districts = useMemo(
    () => Array.from(new Set(items.map((h) => h.district).filter(Boolean))) as string[],
    [items]
  );

  const filtered = items.filter((h) => {
    if (focusId) return h.id === focusId;
    if (cat && h.category !== cat) return false;
    if (district && h.district !== district) return false;
    if (q) {
      const t = q.toLowerCase();
      const hay = `${h.name} ${h.address ?? ""} ${h.district ?? ""} ${h.description ?? ""}`.toLowerCase();
      if (!hay.includes(t)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">ডিরেক্টরি</div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">হাসপাতাল</h1>
          <p className="mt-1 text-sm text-muted-foreground">মোট {filtered.length} টি হাসপাতাল।</p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
                (cat === c.key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-muted")
              }
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mb-6 grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="হাসপাতাল বা ঠিকানা..."
              aria-label="হাসপাতাল খুঁজুন"
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">সব জেলা</option>
            {districts.map((d) => (<option key={d} value={d}>{d}</option>))}
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">কোনো হাসপাতাল পাওয়া যায়নি।</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((h) => (
              <article key={h.id} className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                {h.image && (
                  <img src={h.image} alt={h.name} className="h-40 w-full object-cover" loading="lazy" />
                )}
                <div className="p-4">
                  <div className="flex items-start gap-2">
                    <Building2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold leading-snug text-foreground group-hover:text-primary">{h.name}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {h.district && <span className="text-xs text-muted-foreground">{h.district}</span>}
                        {h.category && (
                          <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide " + (h.category === 'cancer' ? "bg-rose-100 text-rose-700" : h.category === 'maternal' ? "bg-pink-100 text-pink-700" : "bg-sky-100 text-sky-700")}>
                            {h.category === 'cancer' ? 'ক্যান্সার' : h.category === 'maternal' ? 'মা / মাতৃত্ব' : 'শিশু'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm">
                    {h.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">{h.address}</span>
                      </div>
                    )}
                    {h.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <a href={`tel:${h.phone}`} className="font-kalpurush font-medium text-primary hover:underline">{h.phone}</a>
                      </div>
                    )}
                    {h.emergency_number && (
                      <div className="flex items-start gap-2">
                        <Siren className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        <a href={`tel:${h.emergency_number}`} className="font-kalpurush font-semibold text-destructive hover:underline">জরুরি: {h.emergency_number}</a>
                      </div>
                    )}
                  </div>
                  {h.google_map && (
                    <a href={h.google_map} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">Google Map এ দেখুন →</a>
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