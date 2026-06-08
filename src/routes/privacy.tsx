import { createFileRoute } from "@tanstack/react-router";
import { SitePageView } from "@/components/SitePageView";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "গোপনীয়তা নীতি — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "স্বাস্থ্যপিডিয়ার গোপনীয়তা নীতি।" },
      { property: "og:title", content: "গোপনীয়তা নীতি — স্বাস্থ্যপিডিয়া" },
      { property: "og:description", content: "স্বাস্থ্যপিডিয়ার গোপনীয়তা নীতি।" },
      { property: "og:url", content: "https://helthpidia.pp.ua/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://helthpidia.pp.ua/privacy" }],
  }),
  component: () => <SitePageView pageKey="page_privacy" fallbackTitle="গোপনীয়তা নীতি" />,
});