import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function decodeBasicHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function renderPlainArticleContent(raw: string): string {
  if (!raw) return "";
  let html = raw;
  // If it's a full HTML document, extract <body> contents
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) html = bodyMatch[1];
  // Strip <script>, <style>, <link>, <meta>, <title>, <head>
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
  html = html.replace(/<link[^>]*>/gi, "");
  html = html.replace(/<meta[^>]*>/gi, "");
  html = html.replace(/<title[\s\S]*?<\/title>/gi, "");
  html = html.replace(/<head[\s\S]*?<\/head>/gi, "");
  // Remove inline event handlers and style/class attributes, then display as plain news text.
  html = html.replace(/\son\w+="[^"]*"/gi, "");
  html = html.replace(/\son\w+='[^']*'/gi, "");
  html = html.replace(/\sstyle="[^"]*"/gi, "");
  html = html.replace(/\sstyle='[^']*'/gi, "");
  html = html.replace(/\sclass="[^"]*"/gi, "");
  const text = decodeBasicHtmlEntities(
    html
      .replace(/<\s*br\s*\/?\s*>/gi, "\n")
      .replace(/<\/(p|div|section|article|h[1-6]|li|tr|table|ul|ol)>/gi, "\n\n")
      .replace(/<[^>]+>/g, ""),
  );
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((part) => part.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
  return paragraphs.map((part) => `<p>${escapeHtml(part).replace(/\n/g, "<br />")}</p>`).join("");
}

// Detect if the stored content is a full standalone HTML document.
function isFullHtmlDocument(raw: string): boolean {
  if (!raw) return false;
  const head = raw.slice(0, 2000).toLowerCase();
  return (
    head.includes("<!doctype html") ||
    head.includes("<html") ||
    (head.includes("<head") && head.includes("<body"))
  );
}

function HtmlDocumentFrame({ html, title }: { html: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(800);
  // Inject a small script that posts the document height to the parent,
  // so we can resize without needing allow-same-origin (which would defeat the sandbox).
  const FRAME_TAG = "__lvFrameId";
  const frameId = useRef<string>(`f_${Math.random().toString(36).slice(2)}`);
  const wrappedHtml = (() => {
    const script = `<script>(function(){function s(){try{var h=Math.max(document.documentElement.scrollHeight,document.body?document.body.scrollHeight:0);parent.postMessage({${FRAME_TAG}:"${frameId.current}",height:h},"*");}catch(e){}}window.addEventListener("load",s);setInterval(s,800);var ro=window.ResizeObserver?new ResizeObserver(s):null;if(ro&&document.body)ro.observe(document.body);})();</script>`;
    if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, script + "</body>");
    return html + script;
  })();
  useEffect(() => {
    const id = frameId.current;
    const onMsg = (e: MessageEvent) => {
      const d = e.data;
      if (d && typeof d === "object" && d[FRAME_TAG] === id && typeof d.height === "number") {
        setHeight(Math.max(200, d.height + 24));
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  return (
    <iframe
      ref={ref}
      title={title}
      srcDoc={wrappedHtml}
      sandbox="allow-scripts"
      className="mt-6 w-full rounded-lg border border-border bg-white"
      style={{ height }}
    />
  );
}

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  audio_url: string | null;
  published_at: string | null;
  created_at: string;
  article_type: string;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
};

export const Route = createFileRoute("/article/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("articles")
      .select(
        "title,slug,excerpt,cover_image,published_at,created_at,article_type,meta_title,meta_description",
      )
      .eq("slug", params.slug)
      .eq("is_published", true)
      .maybeSingle();
    return data;
  },
  head: ({ params, loaderData }) => {
    const a = loaderData;
    const title = a?.meta_title || a?.title || "আর্টিকেল — স্বাস্থ্যপিডিয়া";
    const desc =
      a?.meta_description ||
      a?.excerpt ||
      "স্বাস্থ্যপিডিয়ায় বাংলা স্বাস্থ্য তথ্য পড়ুন।";
    const url = `https://helthpidia.pp.ua/article/${params.slug}`;
    const meta: { title?: string; name?: string; property?: string; content?: string }[] = [
      { title: `${title} — স্বাস্থ্যপিডিয়া` },
      { name: "description", content: desc.slice(0, 160) },
      { property: "og:title", content: title },
      { property: "og:description", content: desc.slice(0, 200) },
      { property: "og:url", content: url },
      { property: "og:type", content: "article" },
    ];
    if (a?.cover_image) {
      meta.push({ property: "og:image", content: a.cover_image });
      meta.push({ name: "twitter:image", content: a.cover_image });
      meta.push({ name: "twitter:card", content: "summary_large_image" });
    }
    const scripts = a
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: a.title,
              description: desc,
              image: a.cover_image ? [a.cover_image] : undefined,
              datePublished: a.published_at || a.created_at,
              dateModified: a.published_at || a.created_at,
              mainEntityOfPage: url,
              publisher: {
                "@type": "Organization",
                name: "স্বাস্থ্যপিডিয়া",
                url: "https://helthpidia.pp.ua",
              },
            }),
          },
        ]
      : [];
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts,
    };
  },
  component: ArticlePage,
  errorComponent: ArticleError,
  notFoundComponent: () => <div className="p-8 text-center">পাওয়া যায়নি</div>,
});

function ArticleError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="container mx-auto p-8 text-center">
      <p className="text-destructive">ত্রুটি: {error.message}</p>
      <button
        onClick={() => {
          reset();
          router.invalidate();
        }}
        className="mt-3 rounded bg-primary px-4 py-2 text-primary-foreground"
      >
        আবার চেষ্টা করুন
      </button>
    </div>
  );
}

function ArticlePage() {
  const { slug } = Route.useParams();
  const [item, setItem] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("articles")
      .select(
        "id,title,slug,excerpt,content,cover_image,audio_url,published_at,created_at,article_type,tags,meta_title,meta_description",
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setItem((data as Article) || null);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const backTo = item?.article_type === "encyclopedia" ? "/encyclopedia" : "/news";
  const backLabel = item?.article_type === "encyclopedia" ? "স্বাস্থ্যকোষ" : "স্বাস্থ্য সংবাদ";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : !item ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            পোস্ট পাওয়া যায়নি।
          </div>
        ) : (
          <article className="mx-auto max-w-3xl">
            <Link
              to={backTo}
              className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> {backLabel}
            </Link>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">
              {backLabel}
            </div>
            <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">{item.title}</h1>
            <p className="font-kalpurush mt-2 text-xs text-muted-foreground">
              {new Date(item.published_at || item.created_at).toLocaleDateString("bn-BD")}
            </p>
            {item.cover_image && (
              <img
                src={item.cover_image}
                alt={item.title}
                className="mt-4 w-full rounded-lg border border-border object-cover"
              />
            )}
            {item.audio_url && <audio controls src={item.audio_url} className="mt-4 w-full" />}
            {item.excerpt && <p className="mt-4 text-base text-muted-foreground">{item.excerpt}</p>}
            {isFullHtmlDocument(item.content) ? (
              <HtmlDocumentFrame html={item.content} title={item.title} />
            ) : (
              <div
                className="article-content plain-news-content mt-6 max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: renderPlainArticleContent(item.content) }}
              />
            )}
            {item.tags && item.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
