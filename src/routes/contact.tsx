import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Mail, Phone, MapPin, Facebook, Youtube } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "স্বাস্থ্যপিডিয়ার সাথে যোগাযোগ করুন।" },
      { property: "og:title", content: "যোগাযোগ — স্বাস্থ্যপিডিয়া" },
      { property: "og:description", content: "স্বাস্থ্যপিডিয়ার সাথে যোগাযোগ করুন।" },
      { property: "og:url", content: "https://helthpidia.pp.ua/contact" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://helthpidia.pp.ua/contact" }],
  }),
  component: ContactPage,
  notFoundComponent: () => <div className="p-8 text-center">পাওয়া যায়নি</div>,
});

function ContactPage() {
  const { data: settings } = useSiteSettings();
  const c = settings?.contact ?? {};
  const email = c.email || "info@helthpidia.pp.ua";
  const phone = c.phone || "+880 1700-000000";
  const address = c.address || "ঢাকা, বাংলাদেশ";
  const facebook = c.facebook || "#";
  const youtube = c.youtube || "#";
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">যোগাযোগ</div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">আমাদের সাথে যোগাযোগ করুন</h1>
          <p className="mt-2 text-sm text-muted-foreground">আপনার মতামত, প্রশ্ন বা পরামর্শ আমাদের জানান।</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Mail className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">ইমেইল</div>
                <a href={`mailto:${email}`} className="font-medium text-foreground hover:text-primary">{email}</a>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Phone className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">ফোন</div>
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="font-kalpurush font-medium text-foreground hover:text-primary">{phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">ঠিকানা</div>
                <div className="font-medium text-foreground whitespace-pre-line">{address}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <a href={facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"><Facebook className="h-4 w-4" /> Facebook</a>
              <a href={youtube} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20"><Youtube className="h-4 w-4" /> YouTube</a>
            </div>
            {c.map_url && (
              <div className="overflow-hidden rounded-lg border border-border">
                <iframe src={c.map_url} className="h-64 w-full" loading="lazy" />
              </div>
            )}
          </div>

          <form
            className="space-y-3 rounded-lg border border-border bg-card p-5"
            onSubmit={(e) => { e.preventDefault(); alert("ধন্যবাদ! আপনার বার্তা পাঠানো হয়েছে।"); }}
          >
            <h2 className="text-lg font-bold text-foreground">বার্তা পাঠান</h2>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">নাম</label>
              <input required type="text" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">ইমেইল</label>
              <input required type="email" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">বিষয়</label>
              <input type="text" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">বার্তা</label>
              <textarea required rows={5} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <button type="submit" className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">পাঠান</button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}