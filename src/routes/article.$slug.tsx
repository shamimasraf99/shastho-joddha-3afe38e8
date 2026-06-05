import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  component: ArticlePage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-destructive">ত্রুটি: {error.message}</p>
        <button onClick={() => { reset(); router.invalidate(); }} className="mt-3 rounded bg-primary px-4 py-2 text-primary-foreground">আবার চেষ্টা করুন</button>
      </div>
    );
  },
  notFoundComponent: () => <div className="p-8 text-center">পাওয়া যায়নি</div>,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const [item, setItem] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("articles")
      .select("id,title,slug,excerpt,content,cover_image,audio_url,published_at,created_at,article_type,tags,meta_title,meta_description")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setItem((data as Article) || null);
        setLoading(false);
      });
    return () => { active = false; };
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
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">পোস্ট পাওয়া যায়নি।</div>
        ) : (
          <article className="mx-auto max-w-3xl">
            <Link to={backTo} className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> {backLabel}
            </Link>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">{backLabel}</div>
            <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">{item.title}</h1>
            <p className="font-kalpurush mt-2 text-xs text-muted-foreground">
              {new Date(item.published_at || item.created_at).toLocaleDateString("bn-BD")}
            </p>
            {item.cover_image && (
              <img src={item.cover_image} alt={item.title} className="mt-4 w-full rounded-lg border border-border object-cover" />
            )}
            {item.audio_url && (
              <audio controls src={item.audio_url} className="mt-4 w-full" />
            )}
            {item.excerpt && (
              <p className="mt-4 text-base text-muted-foreground">{item.excerpt}</p>
            )}
            <div
              className="article-content plain-news-content mt-6 max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: renderPlainArticleContent(item.content) }}
            />
            {item.tags && item.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1">
                {item.tags.map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{t}</span>
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