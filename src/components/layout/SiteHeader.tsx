import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "./TopBar";
import { BreakingTicker } from "./BreakingTicker";
import logoAsset from "@/assets/shasthopedia-logo-user.png.asset.json";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const nav = [
  { to: "/", label: "হোম" },
  { to: "/encyclopedia", label: "স্বাস্থ্যকোষ" },
  { to: "/doctors", label: "বিশেষজ্ঞ ডাক্তার" },
  { to: "/hospitals", label: "হাসপাতাল" },
  { to: "/labs", label: "ল্যাব টেস্ট" },
  { to: "/donors", label: "রক্তদাতা" },
  { to: "/news", label: "স্বাস্থ্য সংবাদ" },
  { to: "/tools", label: "ক্যালকুলেটর" },
  { to: "/body", label: "শরীরের অঙ্গ" },
  { to: "/qa", label: "প্রশ্নোত্তর" },
  { to: "/videos", label: "ভিডিও" },
  { to: "/podcasts", label: "পডকাস্ট" },
  { to: "/myths", label: "Myth Busters" },
  { to: "/contact", label: "যোগাযোগ" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [mq, setMq] = useState("");
  const [mcat, setMcat] = useState("");
  const go = (val: string, category: string) => {
    const t = val.trim();
    if (!t) return;
    navigate({ to: "/search", search: { q: t, type: category ? [category] : [] } });
    setOpen(false);
  };
  const { data: settings } = useSiteSettings();
  const { data: headerAd } = useQuery({
    queryKey: ["header-bar-ad"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("advertisements")
        .select("id,title,image_url,link_url,html_code,start_date,end_date")
        .eq("placement", "header_bar")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      const ad = (data ?? []).find((a) => {
        if (a.start_date && a.start_date > today) return false;
        if (a.end_date && a.end_date < today) return false;
        return true;
      });
      return ad ?? null;
    },
    staleTime: 60_000,
  });
  const logoUrl = settings?.site.logo_url || logoAsset.url;
  const siteName = settings?.site.name || "স্বাস্থ্যপিডিয়া";
  const tagline = settings?.site.tagline || "HealthPedia • Bangladesh";
  return (
    <header className="sticky top-0 z-50 w-full">
      <TopBar />
      <div className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <a href="/" className="flex shrink-0 items-center gap-2">
            <img
              src={logoUrl}
              alt={siteName}
              className="h-16 w-16 shrink-0 object-contain md:h-20 md:w-20"
            />
            <div className="leading-tight">
              <div className="text-2xl font-extrabold md:text-3xl">
                {settings?.site.name ? (
                  <span style={{ color: "#1f7a3a" }}>{siteName}</span>
                ) : (
                  <>
                    <span style={{ color: "#1f7a3a" }}>স্বাস্থ্য</span>
                    <span style={{ color: "#e63946" }}>পিডিয়া</span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground md:text-xs">{tagline}</div>
            </div>
          </a>

          <div className="hidden flex-1 md:flex justify-center">
            {headerAd ? (
              <div className="w-full max-w-2xl overflow-hidden rounded-md">
                {headerAd.html_code ? (
                  <div dangerouslySetInnerHTML={{ __html: headerAd.html_code }} />
                ) : headerAd.image_url ? (
                  headerAd.link_url ? (
                    <a href={headerAd.link_url} target="_blank" rel="noopener noreferrer">
                      <img src={headerAd.image_url} alt={headerAd.title} className="h-16 w-full object-contain" />
                    </a>
                  ) : (
                    <img src={headerAd.image_url} alt={headerAd.title} className="h-16 w-full object-contain" />
                  )
                ) : null}
              </div>
            ) : (
              <div className="grid h-16 w-full max-w-2xl place-items-center rounded-md border border-dashed border-border bg-secondary/30 text-xs text-muted-foreground">
                বিজ্ঞাপনের স্থান (হেডার বার এডস)
              </div>
            )}
          </div>

          <button
            type="button"
            className="ml-auto md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <nav className="hidden border-t border-border bg-primary text-primary-foreground md:block">
          <div className="container mx-auto flex items-center gap-1 overflow-x-auto px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {nav.map((n) => (
              <a
                key={n.to}
                href={n.to}
                className="whitespace-nowrap px-3 py-2.5 text-base font-semibold text-primary-foreground/95 transition-colors hover:bg-primary-dark hover:text-primary-foreground"
              >
                {n.label}
              </a>
            ))}
          </div>
        </nav>

        {open && (
          <div className="border-t border-border bg-card md:hidden">
            <div className="container mx-auto px-4 py-3">
              <form onSubmit={(e) => { e.preventDefault(); go(mq, mcat); }} className="mb-3 space-y-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={mq}
                    onChange={(e) => setMq(e.target.value)}
                    placeholder="খুঁজুন..."
                    className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none"
                  />
                </div>
                <select
                  value={mcat}
                  onChange={(e) => setMcat(e.target.value)}
                  aria-label="বিভাগ"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none"
                >
                  <option value="">সব বিভাগ</option>
                  <option value="সংবাদ">সংবাদ</option>
                  <option value="স্বাস্থ্যকোষ">স্বাস্থ্যকোষ</option>
                  <option value="ক্যাটাগরি">ক্যাটাগরি</option>
                  <option value="ডাক্তার">ডাক্তার</option>
                  <option value="হাসপাতাল">হাসপাতাল</option>
                  <option value="ল্যাব">ল্যাব</option>
                  <option value="রক্তদাতা">রক্তদাতা</option>
                  <option value="ভিডিও">ভিডিও</option>
                  <option value="পডকাস্ট">পডকাস্ট</option>
                  <option value="Myth">Myth</option>
                  <option value="বডি">বডি</option>
                </select>
              </form>
              <div className="grid grid-cols-2 gap-1">
                {nav.map((n) => (
                  <a
                    key={n.to}
                    href={n.to}
                    className="rounded px-3 py-2 text-sm text-foreground hover:bg-secondary"
                  >
                    {n.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <BreakingTicker />
    </header>
  );
}