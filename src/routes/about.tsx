import { createFileRoute } from "@tanstack/react-router";
import { SitePageView } from "@/components/SitePageView";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের সম্পর্কে — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "স্বাস্থ্যপিডিয়া সম্পর্কে বিস্তারিত জানুন।" },
      { property: "og:title", content: "আমাদের সম্পর্কে — স্বাস্থ্যপিডিয়া" },
      { property: "og:description", content: "স্বাস্থ্যপিডিয়া সম্পর্কে বিস্তারিত জানুন।" },
      { property: "og:url", content: "https://helthpidia.pp.ua/about" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://helthpidia.pp.ua/about" }],
  }),
  component: () => <SitePageView pageKey="page_about" fallbackTitle="আমাদের সম্পর্কে" />,
});