import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useSitePage } from "@/hooks/useSitePage";
import { TTSButton } from "@/components/TTSButton";

export function SitePageView({ pageKey, fallbackTitle }: { pageKey: string; fallbackTitle: string }) {
  const { data, isLoading } = useSitePage(pageKey);
  const title = data?.title || fallbackTitle;
  const body = data?.body || "";
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
          {body && (
            <TTSButton
              getText={() => {
                const tmp = document.createElement("div");
                tmp.innerHTML = body;
                return `${title}। ${tmp.textContent || ""}`;
              }}
            />
          )}
        </div>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">লোড হচ্ছে...</div>
        ) : body ? (
          <article
            className="prose prose-sm max-w-none rounded-lg border border-border bg-card p-6 md:prose-base dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            কন্টেন্ট এখনো যোগ করা হয়নি।
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}