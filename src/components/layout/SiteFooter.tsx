import { Facebook, Youtube, Send, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-primary-dark text-primary-foreground">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <div className="mb-2 text-lg font-bold">স্বাস্থ্যপিডিয়া</div>
          <p className="text-sm text-primary-foreground/80">
            বাংলাদেশের সবচেয়ে বড় ডিজিটাল স্বাস্থ্য তথ্য ভান্ডার। নির্ভরযোগ্য
            চিকিৎসা তথ্য, বিশেষজ্ঞ ডাক্তার ও হাসপাতাল ডিরেক্টরি।
          </p>
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
            <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-accent" /> জাতীয় জরুরি সেবা — <strong>999</strong></li>
            <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-accent" /> সরকারি তথ্যসেবা — <strong>333</strong></li>
            <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-accent" /> স্বাস্থ্য বাতায়ন — <strong>16263</strong></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} স্বাস্থ্যপিডিয়া — সকল অধিকার সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
}