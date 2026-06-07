import { Facebook, Youtube, Send, Phone } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function SiteFooter() {
  const { data } = useSiteSettings();
  const footerTitle = data?.footer?.title || "স্বাস্থ্যপিডিয়া";
  const footerDesc =
    data?.footer?.description ||
    "বাংলাদেশের সবচেয়ে বড় ডিজিটাল স্বাস্থ্য তথ্য ভান্ডার। নির্ভরযোগ্য চিকিৎসা তথ্য, বিশেষজ্ঞ ডাক্তার ও হাসপাতাল ডিরেক্টরি।";
  const emergencyItems = data?.emergency?.items?.length
    ? data.emergency.items
    : [
        { label: "জাতীয় জরুরি সেবা", number: "999" },
        { label: "সরকারি তথ্যসেবা", number: "333" },
        { label: "স্বাস্থ্য বাতায়ন", number: "16263" },
        { label: "ফায়ার সার্ভিস হটলাইন", number: "102" },
      ];
  return (
    <footer className="mt-16 border-t border-border bg-primary-dark text-primary-foreground">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <div className="mb-2 text-lg font-bold">{footerTitle}</div>
          <p className="text-sm text-primary-foreground/80">{footerDesc}</p>
          <div className="mt-3 flex gap-3">
            <a href="#" aria-label="Facebook" className="hover:text-accent"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-accent"><Youtube className="h-4 w-4" /></a>
            <a href="#" aria-label="Telegram" className="hover:text-accent"><Send className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold uppercase tracking-wide opacity-80">প্রতিষ্ঠান</div>
          <ul className="space-y-1.5 text-sm">
            <li><a href="/about" className="hover:text-accent">আমাদের সম্পর্কে</a></li>
            <li><a href="/privacy" className="hover:text-accent">গোপনীয়তা নীতি</a></li>
            <li><a href="/terms" className="hover:text-accent">শর্তাবলী</a></li>
            <li><a href="/contact" className="hover:text-accent">যোগাযোগ</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold uppercase tracking-wide opacity-80">বিভাগসমূহ</div>
          <ul className="space-y-1.5 text-sm">
            <li><a href="/doctors" className="hover:text-accent">বিশেষজ্ঞ ডাক্তার</a></li>
            <li><a href="/hospitals" className="hover:text-accent">হাসপাতাল</a></li>
            <li><a href="/donors" className="hover:text-accent">রক্তদাতা</a></li>
            <li><a href="/tools" className="hover:text-accent">হেলথ ক্যালকুলেটর</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold uppercase tracking-wide opacity-80">জরুরি নম্বর</div>
          <ul className="space-y-1.5 text-sm">
            {emergencyItems.map((it, i) => (
              <li key={i} className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-accent" /> {it.label} —{" "}
                <strong className="font-kalpurush">{it.number}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-primary-foreground/70">
          <p>
            © {new Date().getFullYear()} {footerTitle} — সকল অধিকার সংরক্ষিত।
          </p>
          <p className="mt-1">
            Developer by{" "}
            <a
              href="https://www.shamimasraf.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-accent"
            >
              Shamim Asraf
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}