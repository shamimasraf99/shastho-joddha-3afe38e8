import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
  const [q, setQ] = useState("");
  const [mq, setMq] = useState("");
  const [cat, setCat] = useState("");
  const [mcat, setMcat] = useState("");
  const go = (val: string, category: string) => {
    const t = val.trim();
    if (!t) return;
    navigate({ to: "/search", search: { q: t, type: category ? [category] : [] } });
    setOpen(false);
  };
  const { data: settings } = useSiteSettings();
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

          <form className="hidden flex-1 md:block" onSubmit={(e) => { e.preventDefault(); go(q, cat); }}>
            <div className="relative mx-auto flex max-w-2xl items-stretch overflow-hidden rounded-md border border-border bg-background ring-primary/30 focus-within:ring-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="রোগ, লক্ষণ, ঔষধ, ডাক্তার বা হাসপাতাল খুঁজুন..."
                className="min-w-0 flex-1 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground"
              />
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                aria-label="বিভাগ"
                className="shrink-0 border-l border-border bg-secondary/60 px-3 text-sm text-foreground outline-none hover:bg-secondary"
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
              </select>
            </div>
          </form>

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