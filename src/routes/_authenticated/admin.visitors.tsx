import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getVisitorStats } from "@/lib/visitor.functions";
import { Card } from "@/components/ui/card";
import { BarChart3, Globe, Users, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/visitors")({
  component: VisitorsPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="p-6">
        <p className="text-destructive">ত্রুটি: {error.message}</p>
        <button
          onClick={() => { reset(); router.invalidate(); }}
          className="mt-3 rounded bg-primary px-4 py-2 text-primary-foreground"
        >আবার চেষ্টা করুন</button>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-6">পাওয়া যায়নি</div>,
});

const countryName: Record<string, string> = {
  BD: "বাংলাদেশ", IN: "ভারত", PK: "পাকিস্তান", US: "যুক্তরাষ্ট্র",
  GB: "যুক্তরাজ্য", SA: "সৌদি আরব", AE: "সংযুক্ত আরব আমিরাত", MY: "মালয়েশিয়া",
  SG: "সিঙ্গাপুর", QA: "কাতার", KW: "কুয়েত", OM: "ওমান", CA: "কানাডা",
  AU: "অস্ট্রেলিয়া", DE: "জার্মানি", FR: "ফ্রান্স", IT: "ইতালি", JP: "জাপান",
  CN: "চীন", TR: "তুরস্ক", UNKNOWN: "অজানা",
};

function fmtBn(n: number) {
  return new Intl.NumberFormat("bn-BD").format(n);
}

function VisitorsPage() {
  const fn = useServerFn(getVisitorStats);
  const { data, isLoading } = useQuery({
    queryKey: ["visitor-stats"],
    queryFn: () => fn(),
    refetchInterval: 60_000,
  });

  if (isLoading || !data) return <div className="p-6 text-muted-foreground">লোড হচ্ছে…</div>;

  const maxDay = Math.max(1, ...data.perDay.map((d) => d.visits));
  const maxCountry = Math.max(1, ...data.byCountry.map((c) => c.visits));

  const stats = [
    { label: "আজ", value: data.today, sub: `${fmtBn(data.uniqueToday)} ইউনিক`, icon: CalendarDays },
    { label: "গতকাল", value: data.yesterday, icon: CalendarDays },
    { label: "গত ৩০ দিন", value: data.last30Days, sub: `${fmtBn(data.uniqueLast30)} ইউনিক`, icon: BarChart3 },
    { label: "মোট দেশ", value: data.byCountry.length, icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">ভিজিটর অ্যানালিটিক্স</h1>
      </div>
      <p className="text-sm text-muted-foreground">সেশনভিত্তিক গণনা; ১ মিনিট পরপর রিফ্রেশ হয়।</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold">{fmtBn(s.value)}</p>
            {s.sub && <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>}
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h2 className="mb-3 font-semibold">গত ৩০ দিনের ইউনিক ভিজিটর</h2>
        <div className="flex h-48 items-end gap-1">
          {data.perDay.map((d) => (
            <div key={d.day} className="group relative flex-1">
              <div
                className="rounded-t bg-primary/80 transition hover:bg-primary"
                style={{ height: `${(d.visits / maxDay) * 100}%`, minHeight: d.visits ? 2 : 0 }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-xs text-background group-hover:block">
                {d.day} • {fmtBn(d.visits)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{data.perDay[0]?.day}</span>
          <span>{data.perDay[data.perDay.length - 1]?.day}</span>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 font-semibold">দেশ অনুযায়ী ভিজিটর (৩০ দিন)</h2>
          {data.byCountry.length === 0 ? (
            <p className="text-sm text-muted-foreground">কোনো তথ্য নেই</p>
          ) : (
            <ul className="space-y-2">
              {data.byCountry.map((c) => (
                <li key={c.country} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {countryName[c.country] ?? c.country}{" "}
                      <span className="text-xs text-muted-foreground">({c.country})</span>
                    </span>
                    <span className="tabular-nums text-muted-foreground">{fmtBn(c.visits)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(c.visits / maxCountry) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 font-semibold">টপ পেজ (৩০ দিন)</h2>
          {data.topPaths.length === 0 ? (
            <p className="text-sm text-muted-foreground">কোনো তথ্য নেই</p>
          ) : (
            <ul className="divide-y">
              {data.topPaths.map((p) => (
                <li key={p.path} className="flex justify-between gap-3 py-2 text-sm">
                  <span className="truncate font-mono text-xs text-muted-foreground">{p.path}</span>
                  <span className="tabular-nums">{fmtBn(p.visits)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}