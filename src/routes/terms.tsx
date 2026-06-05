import { createFileRoute } from "@tanstack/react-router";
import { SitePageView } from "@/components/SitePageView";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "শর্তাবলী — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "স্বাস্থ্যপিডিয়া ব্যবহারের শর্তাবলী।" },
    ],
  }),
  component: () => <SitePageView pageKey="page_terms" fallbackTitle="শর্তাবলী" />,
});