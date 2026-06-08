import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://helthpidia.pp.ua";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/encyclopedia", changefreq: "weekly", priority: "0.9" },
  { path: "/doctors", changefreq: "weekly", priority: "0.9" },
  { path: "/hospitals", changefreq: "weekly", priority: "0.9" },
  { path: "/labs", changefreq: "weekly", priority: "0.8" },
  { path: "/donors", changefreq: "daily", priority: "0.8" },
  { path: "/news", changefreq: "daily", priority: "0.9" },
  { path: "/qa", changefreq: "weekly", priority: "0.7" },
  { path: "/tools", changefreq: "monthly", priority: "0.7" },
  { path: "/body", changefreq: "monthly", priority: "0.7" },
  { path: "/videos", changefreq: "weekly", priority: "0.6" },
  { path: "/podcasts", changefreq: "weekly", priority: "0.6" },
  { path: "/myths", changefreq: "weekly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [...STATIC_ENTRIES];

        try {
          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );

          const [articles, hospitals, labs, doctors, bodyParts, categories] =
            await Promise.all([
              supabaseAdmin
                .from("articles")
                .select("slug,updated_at,article_type")
                .eq("is_published", true)
                .limit(2000),
              supabaseAdmin
                .from("hospitals")
                .select("slug,updated_at")
                .eq("is_active", true)
                .limit(2000),
              supabaseAdmin
                .from("labs")
                .select("id,updated_at")
                .eq("is_active", true)
                .limit(2000),
              supabaseAdmin
                .from("doctors")
                .select("id,updated_at")
                .eq("is_active", true)
                .limit(2000),
              supabaseAdmin
                .from("body_parts")
                .select("slug,updated_at")
                .eq("is_active", true)
                .limit(500),
              supabaseAdmin
                .from("categories")
                .select("slug,updated_at")
                .eq("is_active", true)
                .limit(500),
            ]);

          for (const a of articles.data ?? []) {
            if (!a.slug) continue;
            entries.push({
              path: `/article/${a.slug}`,
              lastmod: a.updated_at
                ? new Date(a.updated_at).toISOString().slice(0, 10)
                : undefined,
              changefreq: "monthly",
              priority: "0.7",
            });
          }
          for (const h of hospitals.data ?? []) {
            if (!h.slug) continue;
            entries.push({
              path: `/hospital/${h.slug}`,
              lastmod: h.updated_at
                ? new Date(h.updated_at).toISOString().slice(0, 10)
                : undefined,
              changefreq: "monthly",
              priority: "0.6",
            });
          }
          for (const bp of bodyParts.data ?? []) {
            if (!bp.slug) continue;
            entries.push({
              path: `/body/${bp.slug}`,
              lastmod: bp.updated_at
                ? new Date(bp.updated_at).toISOString().slice(0, 10)
                : undefined,
              changefreq: "monthly",
              priority: "0.6",
            });
          }
          for (const c of categories.data ?? []) {
            if (!c.slug) continue;
            entries.push({
              path: `/category/${c.slug}`,
              lastmod: c.updated_at
                ? new Date(c.updated_at).toISOString().slice(0, 10)
                : undefined,
              changefreq: "weekly",
              priority: "0.7",
            });
          }
          // Use directory pages (labs, doctors) — individual rows have no public detail route
          // so we skip per-row URLs and just keep the directory entry already in STATIC_ENTRIES.
          void labs;
          void doctors;
        } catch (err) {
          console.error("sitemap dynamic fetch failed", err);
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${escapeXml(BASE_URL + e.path)}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});