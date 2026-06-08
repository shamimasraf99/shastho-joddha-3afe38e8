import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Building2, MapPin, Phone, Siren } from "lucide-react";

type Hospital = {
  id: string;
  name: string;
  district: string | null;
  address: string | null;
  phone: string | null;
  emergency_number: string | null;
  image: string | null;
  description: string | null;
  google_map: string | null;
  category: string | null;
};

export const Route = createFileRoute("/hospital/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("hospitals")
      .select("name,district,address,phone,emergency_number,image,description")
      .eq("slug", params.slug)
      .eq("is_active", true)
      .maybeSingle();
    return data;
  },
  head: ({ params, loaderData }) => {
    const h = loaderData;
    const title = h?.name
      ? `${h.name} — হাসপাতাল`
      : "হাসপাতাল তথ্য — স্বাস্থ্যপিডিয়া";
    const desc =
      h?.description ||
      [h?.name, h?.address, h?.district].filter(Boolean).join(", ") ||
      "হাসপাতালের ঠিকানা, ফোন ও জরুরি নম্বর।";
    const url = `https://helthpidia.pp.ua/hospital/${params.slug}`;
    const meta: { title?: string; name?: string; property?: string; content?: string }[] = [
      { title: `${title} — স্বাস্থ্যপিডিয়া` },
      { name: "description", content: desc.slice(0, 160) },
      { property: "og:title", content: title },
      { property: "og:description", content: desc.slice(0, 200) },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
    ];
    if (h?.image) {
      meta.push({ property: "og:image", content: h.image });
      meta.push({ name: "twitter:image", content: h.image });
      meta.push({ name: "twitter:card", content: "summary_large_image" });
    }
    const scripts = h
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Hospital",
              name: h.name,
              description: h.description,
              image: h.image,
              telephone: h.phone,
              address: {
                "@type": "PostalAddress",
                streetAddress: h.address,
                addressLocality: h.district,
                addressCountry: "BD",
              },
              url,
            }),
          },
        ]
      : [];
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts,
    };
  },
  component: HospitalDetailsPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-destructive">ত্রুটি: {error.message}</p>
        <button onClick={() => { reset(); router.invalidate(); }} className="mt-3 rounded bg-primary px-4 py-2 text-primary-foreground">আবার চেষ্টা করুন</button>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-8 text-center">পাওয়া যায়নি</div>,
});

function HospitalDetailsPage() {
  const { slug } = Route.useParams();
  const [item, setItem] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("hospitals")
      .select("id,name,district,address,phone,emergency_number,image,description,google_map,category")
      .eq("is_active", true)
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (active) {
          setItem((data as Hospital) || null);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <Link to="/hospitals" className="mb-4 inline-block text-sm font-semibold text-primary hover:underline">
          ← সব হাসপাতাল
        </Link>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : !item ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">হাসপাতাল পাওয়া যায়নি।</div>
        ) : (
          <article className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            {item.image && (
              <img src={item.image} alt={item.name} className="h-56 w-full object-cover md:h-72" loading="lazy" />
            )}
            <div className="p-5 md:p-6">
              <div className="flex items-start gap-3">
                <Building2 className="mt-1 h-6 w-6 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold leading-snug text-foreground md:text-3xl">{item.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {item.district && <span>{item.district}</span>}
                    {item.category && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">{item.category}</span>}
                  </div>
                </div>
              </div>

              {item.description && <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.description}</p>}

              <div className="mt-5 space-y-3 text-sm">
                {item.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-foreground">{item.address}</span>
                  </div>
                )}
                {item.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <a href={`tel:${item.phone}`} className="font-kalpurush font-medium text-primary hover:underline">{item.phone}</a>
                  </div>
                )}
                {item.emergency_number && (
                  <div className="flex items-start gap-2">
                    <Siren className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <a href={`tel:${item.emergency_number}`} className="font-kalpurush font-semibold text-destructive hover:underline">জরুরি: {item.emergency_number}</a>
                  </div>
                )}
              </div>

              {item.google_map && (
                <a href={item.google_map} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-semibold text-primary hover:underline">Google Map এ দেখুন →</a>
              )}
            </div>
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}