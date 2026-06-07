import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Phone, FlaskConical } from "lucide-react";

type Lab = {
  id: string;
  name: string;
  test_type: string | null;
  price: number | null;
  district: string | null;
  address: string | null;
  phone: string | null;
};

export const Route = createFileRoute("/labs")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  head: () => ({
    meta: [
      { title: "ল্যাব — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "বাংলাদেশের ডায়াগনস্টিক ল্যাবের তালিকা — টেস্ট, মূল্য ও যোগাযোগ।" },
    ],
  }),
  component: LabsPage,
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

function LabsPage() {
  const { q: initialQ } = Route.useSearch();
  const [items, setItems] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState("");
  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    let active = true;
    supabase
      .from("labs")
      .select("id,name,test_type,price,district,address,phone")
      .eq("is_active", true)
      .order("name", { ascending: true })
      .limit(500)
      .then(({ data }) => {
        if (active) {
          setItems((data as Lab[]) || []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const districts = useMemo(
    () => Array.from(new Set(items.map((l) => l.district).filter(Boolean))) as string[],
    [items]
  );

  const filtered = items.filter((l) => {
    if (district && l.district !== district) return false;
    if (q) {
      const t = q.toLowerCase();
      const hay = `${l.name} ${l.test_type ?? ""} ${l.address ?? ""} ${l.district ?? ""}`.toLowerCase();
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
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">ল্যাব</h1>
          <p className="mt-1 text-sm text-muted-foreground">মোট {filtered.length} টি ল্যাব।</p>
        </div>

        <div className="mb-6 grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ল্যাব, টেস্ট বা ঠিকানা..."
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
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">কোনো ল্যাব পাওয়া যায়নি।</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => (
              <article key={l.id} className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                <div className="p-4">
                  <div className="flex items-start gap-2">
                    <FlaskConical className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold leading-snug text-foreground group-hover:text-primary">{l.name}</h2>
                      {l.district && <p className="text-xs text-muted-foreground">{l.district}</p>}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm">
                    {l.test_type && (
                      <div className="text-muted-foreground">টেস্ট: {l.test_type}</div>
                    )}
                    {l.price !== null && (
                      <div className="font-kalpurush font-semibold text-foreground">মূল্য: ৳{l.price}</div>
                    )}
                    {l.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">{l.address}</span>
                      </div>
                    )}
                    {l.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <a href={`tel:${l.phone}`} className="font-kalpurush font-medium text-primary hover:underline">{l.phone}</a>
                      </div>
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
