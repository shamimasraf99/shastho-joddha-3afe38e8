import { Search, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { TopBar } from "./TopBar";
import { BreakingTicker } from "./BreakingTicker";
import logoAsset from "@/assets/shasthopedia-logo-new.png.asset.json";

const nav = [
  { to: "/", label: "হোম" },
  { to: "/encyclopedia", label: "স্বাস্থ্যকোষ" },
  { to: "/doctors", label: "বিশেষজ্ঞ ডাক্তার" },
  { to: "/hospitals", label: "হাসপাতাল" },
  { to: "/labs", label: "ল্যাব টেস্ট" },
  { to: "/donors", label: "রক্তদাতা" },
  { to: "/news", label: "স্বাস্থ্য সংবাদ" },
  { to: "/tools", label: "ক্যালকুলেটর" },
  { to: "/qa", label: "প্রশ্নোত্তর" },
  { to: "/videos", label: "ভিডিও" },
  { to: "/podcasts", label: "পডকাস্ট" },
  { to: "/myths", label: "Myth Busters" },
  { to: "/contact", label: "যোগাযোগ" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full">
      <TopBar />
      <div className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <a href="/" className="flex shrink-0 items-center gap-2">
            <img
              src={logoAsset.url}
              alt="স্বাস্থ্যপিডিয়া"
              className="h-12 w-12 shrink-0 object-contain md:h-14 md:w-14"
            />
            <div className="leading-tight">
              <div className="text-2xl font-extrabold md:text-3xl">
                <span style={{ color: "#1f7a3a" }}>স্বাস্থ্য</span>
                <span style={{ color: "#e63946" }}>পিডিয়া</span>
              </div>
              <div className="text-[11px] text-muted-foreground md:text-xs">HealthPedia • Bangladesh</div>
            </div>
          </a>

          <form className="hidden flex-1 md:block" onSubmit={(e) => e.preventDefault()}>
            <div className="relative mx-auto max-w-2xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="রোগ, লক্ষণ, ঔষধ, ডাক্তার বা হাসপাতাল খুঁজুন..."
                className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2"
              />
            </div>
          </form>

          <a
            href="/auth"
            className="hidden shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark md:inline-flex"
          >
            <LogIn className="h-4 w-4" /> লগইন
          </a>

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
          <div className="container mx-auto flex items-center gap-1 overflow-x-auto px-2">
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
              <form onSubmit={(e) => e.preventDefault()} className="mb-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="খুঁজুন..."
                    className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none"
                  />
                </div>
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
                <a
                  href="/auth"
                  className="col-span-2 mt-2 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <LogIn className="h-4 w-4" /> লগইন
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      <BreakingTicker />
    </header>
  );
}