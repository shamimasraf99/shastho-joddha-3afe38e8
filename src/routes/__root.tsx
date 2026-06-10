import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { FloatingChatButtons } from "../components/layout/FloatingChatButtons";
import { ContentProtection } from "../components/ContentProtection";
import { Toaster } from "../components/ui/sonner";
import { logVisit } from "../lib/visitor.functions";
import logoAsset from "../assets/shasthopedia-logo-user.png.asset.json";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "স্বাস্থ্যপিডিয়া — বাংলাদেশের ডিজিটাল স্বাস্থ্য তথ্য ভান্ডার" },
      { name: "description", content: "নির্ভরযোগ্য বাংলা স্বাস্থ্য তথ্য, বিশেষজ্ঞ ডাক্তার, হাসপাতাল, ল্যাব ও রক্তদাতা ডিরেক্টরি।" },
      { name: "author", content: "স্বাস্থ্যপিডিয়া" },
      { property: "og:title", content: "স্বাস্থ্যপিডিয়া — বাংলাদেশের ডিজিটাল স্বাস্থ্য তথ্য ভান্ডার" },
      { property: "og:description", content: "নির্ভরযোগ্য বাংলা স্বাস্থ্য তথ্য, বিশেষজ্ঞ ডাক্তার, হাসপাতাল, ল্যাব ও রক্তদাতা ডিরেক্টরি।" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "স্বাস্থ্যপিডিয়া" },
      { property: "og:locale", content: "bn_BD" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "স্বাস্থ্যপিডিয়া — বাংলাদেশের ডিজিটাল স্বাস্থ্য তথ্য ভান্ডার" },
      { name: "twitter:description", content: "নির্ভরযোগ্য বাংলা স্বাস্থ্য তথ্য, বিশেষজ্ঞ ডাক্তার, হাসপাতাল, ল্যাব ও রক্তদাতা ডিরেক্টরি।" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&family=Hind+Siliguri:wght@400;600;700&display=swap",
      },
      {
        rel: "preload",
        as: "image",
        href: logoAsset.url,
        fetchPriority: "high",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://helthpidia.pp.ua/#organization",
              name: "স্বাস্থ্যপিডিয়া",
              alternateName: "Shasthopedia",
              url: "https://helthpidia.pp.ua",
              logo: "https://helthpidia.pp.ua/favicon.ico",
              sameAs: [],
            },
            {
              "@type": "WebSite",
              "@id": "https://helthpidia.pp.ua/#website",
              url: "https://helthpidia.pp.ua",
              name: "স্বাস্থ্যপিডিয়া",
              inLanguage: "bn-BD",
              publisher: { "@id": "https://helthpidia.pp.ua/#organization" },
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://helthpidia.pp.ua/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    let sid = "";
    try {
      sid = localStorage.getItem("vsid") ?? "";
      if (!sid) {
        sid = crypto.randomUUID();
        localStorage.setItem("vsid", sid);
      }
    } catch {
      sid = Math.random().toString(36).slice(2);
    }
    const track = () => {
      const path = window.location.pathname;
      if (path.startsWith("/admin") || path.startsWith("/auth")) return;
      logVisit({
        data: {
          session_id: sid,
          path,
          referrer: document.referrer || null,
        },
      }).catch(() => {});
    };
    track();
    const unsub = router.subscribe("onResolved", track);
    return () => unsub();
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ContentProtection />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <FloatingChatButtons />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
