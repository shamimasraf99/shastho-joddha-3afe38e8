import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Droplet, User } from "lucide-react";

type Donor = {
  id: string;
  name: string;
  blood_group: string;
  district: string;
  last_donation_date: string | null;
  is_available: boolean;
};

export const Route = createFileRoute("/donors")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  head: () => ({
    meta: [
      { title: "রক্তদাতা — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "বাংলাদেশের রক্তদাতাদের তালিকা — ব্লাড গ্রুপ ও জেলা অনুযায়ী খুঁজুন।" },
    ],
  }),
  component: DonorsPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-destructive">ত্রুটি: {error.message}</p>
        <button
          onClick={() => { reset(); router.invalidate(); }}
          className="mt-3 rounded bg-primary px-4 py-2 text-primary-foreground"
        >আবার চেষ্টা করুন</button>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-8 text-center">পাওয়া যায়নি</div>,
});

function DonorsPage() {
  const { q: initialQ } = Route.useSearch();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("blood_donors")
      .select("id,name,blood_group,district,last_donation_date,is_available")
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => {
        if (active) {
          setDonors((data as Donor[]) || []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const bloodGroups = useMemo(
    () => Array.from(new Set(donors.map((d) => d.blood_group).filter(Boolean))) as string[],
    [donors]
  );
  const districts = useMemo(
    () => Array.from(new Set(donors.map((d) => d.district).filter(Boolean))) as string[],
    [donors]
  );

  const filtered = donors.filter((d) => {
    if (bloodGroup && d.blood_group !== bloodGroup) return false;
    if (district && d.district !== district) return false;
    if (q) {
      const t = q.toLowerCase();
      const hay = `${d.name} ${d.district ?? ""} ${d.blood_group ?? ""}`.toLowerCase();
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
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">রক্তদাতা</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ব্লাড গ্রুপ ও জেলা অনুযায়ী খুঁজুন। মোট {filtered.length} জন রক্তদাতা।
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="নাম, জেলা বা ব্লাড গ্রুপ..."
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">সব ব্লাড গ্রুপ</option>
            {bloodGroups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">সব জেলা</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            কোনো রক্তদাতা পাওয়া যায়নি।
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d, idx) => (
              <article
                key={d.id}
                className="group rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="font-kalpurush grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold leading-snug text-foreground group-hover:text-primary">
                      {d.name}
                    </h2>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-destructive">
                      <Droplet className="h-3.5 w-3.5" />
                      {d.blood_group}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  {d.district && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-foreground">{d.district}</span>
                    </div>
                  )}
                  {d.last_donation_date && (
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        শেষ দান: {new Date(d.last_donation_date).toLocaleDateString("bn-BD", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
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
