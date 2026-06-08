import { createFileRoute } from "@tanstack/react-router";
import { SitePageView } from "@/components/SitePageView";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "শর্তাবলী — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "স্বাস্থ্যপিডিয়া ব্যবহারের শর্তাবলী।" },
      { property: "og:title", content: "শর্তাবলী — স্বাস্থ্যপিডিয়া" },
      { property: "og:description", content: "স্বাস্থ্যপিডিয়া ব্যবহারের শর্তাবলী।" },
      { property: "og:url", content: "https://helthpidia.pp.ua/terms" },
    ],
    links: [{ rel: "canonical", href: "https://helthpidia.pp.ua/terms" }],
  }),
  component: () => <SitePageView pageKey="page_terms" fallbackTitle="শর্তাবলী" />,
});