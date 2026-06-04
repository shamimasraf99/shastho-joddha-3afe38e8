import { Link } from "@tanstack/react-router";
import { Search, LogIn, Menu, X, Heart } from "lucide-react";
import { useState } from "react";
import { TopBar } from "./TopBar";
import { BreakingTicker } from "./BreakingTicker";

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
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
              <Heart className="h-5 w-5 fill-current" />
            </span>
            <div className="leading-tight">
              <div className="text-lg font-bold text-primary">স্বাস্থ্যপিডিয়া</div>
              <div className="text-[10px] text-muted-foreground">HealthPedia • Bangladesh</div>
            </div>
          </Link>

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

          <Link
            to="/auth"
            className="hidden shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark md:inline-flex"
          >
            <LogIn className="h-4 w-4" /> লগইন
          </Link>

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
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="whitespace-nowrap px-3 py-2.5 text-sm font-medium text-primary-foreground/90 transition-colors hover:bg-primary-dark hover:text-primary-foreground data-[status=active]:bg-primary-dark data-[status=active]:text-primary-foreground"
              >
                {n.label}
              </Link>
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
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="rounded px-3 py-2 text-sm text-foreground hover:bg-secondary"
                  >
                    {n.label}
                  </Link>
                ))}
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="col-span-2 mt-2 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <LogIn className="h-4 w-4" /> লগইন
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <BreakingTicker />
    </header>
  );
}