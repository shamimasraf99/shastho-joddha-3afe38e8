import { Facebook, Youtube, Send, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

function formatBnDateTime(d: Date) {
  try {
    const date = new Intl.DateTimeFormat("bn-BD", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(d);
    const time = new Intl.DateTimeFormat("bn-BD", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    }).format(d);
    return `${date} • ${time}`;
  } catch {
    return d.toLocaleString();
  }
}

export function TopBar() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-primary-dark text-primary-foreground text-xs">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-1.5">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> ঢাকা
          </span>
          <span className="text-[11px] opacity-90 sm:text-xs">
            {now ? formatBnDateTime(now) : "—"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" aria-label="Facebook" className="hover:text-accent transition-colors">
            <Facebook className="h-3.5 w-3.5" />
          </a>
          <a href="#" aria-label="YouTube" className="hover:text-accent transition-colors">
            <Youtube className="h-3.5 w-3.5" />
          </a>
          <a href="#" aria-label="Telegram" className="hover:text-accent transition-colors">
            <Send className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}