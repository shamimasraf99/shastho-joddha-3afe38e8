import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardCounts } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

const labels: Record<string, string> = {
  articles: "আর্টিকেল",
  categories: "ক্যাটাগরি",
  doctors: "ডাক্তার",
  hospitals: "হাসপাতাল",
  labs: "ল্যাব",
  videos: "ভিডিও",
  podcasts: "পডকাস্ট",
  mythbusters: "মিথবাস্টার",
  questions: "প্রশ্ন",
  blood_donors: "রক্তদাতা",
  advertisements: "বিজ্ঞাপন",
};

function DashboardPage() {
  const fn = useServerFn(getDashboardCounts);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-counts"], queryFn: () => fn() });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">স্বাগতম</h2>
        <p className="text-muted-foreground text-sm">আপনার সাইটের সংক্ষিপ্ত পরিসংখ্যান</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(labels).map(([key, label]) => (
          <div key={key} className="rounded-xl border bg-card p-5">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-3xl font-bold mt-2">
              {isLoading ? "…" : (data?.[key as keyof typeof data] ?? 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}