import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Phone, Stethoscope, Building2 } from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  speciality: string | null;
  designation: string | null;
  hospital: string | null;
  chamber: string | null;
  district: string | null;
  phone: string | null;
  fee: string | null;
};

export const Route = createFileRoute("/doctors")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  head: () => ({
    meta: [
      { title: "বিশেষজ্ঞ ডাক্তার — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "বাংলাদেশের বিশেষজ্ঞ ডাক্তারদের তালিকা — কার্ডিয়াক সার্জনসহ সকল বিশেষজ্ঞ, চেম্বার ও ফোন নম্বর সহ।" },
    ],
  }),
  component: DoctorsPage,
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

function DoctorsPage() {
  const { q: initialQ } = Route.useSearch();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [speciality, setSpeciality] = useState<string>(initialQ ? "" : "কার্ডিয়াক সার্জন");
  const [district, setDistrict] = useState<string>("");
  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("doctors")
      .select("id,name,speciality,designation,hospital,chamber,district,phone,fee")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(500)
      .then(({ data }) => {
        if (active) {
          setDoctors((data as Doctor[]) || []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const specialities = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.speciality).filter(Boolean))) as string[],
    [doctors]
  );
  const districts = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.district).filter(Boolean))) as string[],
    [doctors]
  );

  const filtered = doctors.filter((d) => {
    if (speciality && d.speciality !== speciality) return false;
    if (district && d.district !== district) return false;
    if (q) {
      const t = q.toLowerCase();
      const hay = `${d.name} ${d.hospital ?? ""} ${d.chamber ?? ""}`.toLowerCase();
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
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">বিশেষজ্ঞ ডাক্তার</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            বিশেষজ্ঞতা ও জেলা অনুযায়ী খুঁজুন। মোট {filtered.length} জন ডাক্তার।
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
              placeholder="ডাক্তার বা হাসপাতালের নাম..."
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={speciality}
            onChange={(e) => setSpeciality(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">সব বিশেষজ্ঞতা</option>
            {specialities.map((s) => (
              <option key={s} value={s}>{s}</option>
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
            কোনো ডাক্তার পাওয়া যায়নি।
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
                    {d.designation && (
                      <p className="text-xs text-muted-foreground">{d.designation}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  {d.speciality && (
                    <div className="flex items-start gap-2">
                      <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span className="text-foreground">{d.speciality}</span>
                    </div>
                  )}
                  {d.hospital && (
                    <div className="flex items-start gap-2">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-foreground">{d.hospital}</span>
                    </div>
                  )}
                  {d.chamber && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">{d.chamber}</span>
                    </div>
                  )}
                  {d.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <a href={`tel:${d.phone}`} className="font-kalpurush font-medium text-primary hover:underline">
                        {d.phone}
                      </a>
                    </div>
                  )}
                </div>
                {d.fee && (
                  <div className="mt-3 border-t border-border pt-2 text-xs font-semibold text-primary">
                    {d.fee}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}