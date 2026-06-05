import { createFileRoute } from "@tanstack/react-router";
import { SitePageView } from "@/components/SitePageView";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের সম্পর্কে — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "স্বাস্থ্যপিডিয়া সম্পর্কে বিস্তারিত জানুন।" },
    ],
  }),
  component: () => <SitePageView pageKey="page_about" fallbackTitle="আমাদের সম্পর্কে" />,
});