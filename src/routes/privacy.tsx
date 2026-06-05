import { createFileRoute } from "@tanstack/react-router";
import { SitePageView } from "@/components/SitePageView";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "গোপনীয়তা নীতি — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "স্বাস্থ্যপিডিয়ার গোপনীয়তা নীতি।" },
    ],
  }),
  component: () => <SitePageView pageKey="page_privacy" fallbackTitle="গোপনীয়তা নীতি" />,
});