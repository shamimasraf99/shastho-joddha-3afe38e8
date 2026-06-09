import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin only");
}

export const logVisit = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        session_id: z.string().min(1).max(80),
        path: z.string().max(500).optional().nullable(),
        referrer: z.string().max(500).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const req = getRequest();
    const h = req?.headers;
    const country =
      h?.get("x-vercel-ip-country") ||
      h?.get("cf-ipcountry") ||
      h?.get("x-country-code") ||
      null;
    const ua = h?.get("user-agent")?.slice(0, 300) ?? null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("visitor_events").insert({
      session_id: data.session_id,
      path: data.path ?? null,
      referrer: data.referrer ?? null,
      country,
      user_agent: ua,
    });
    return { ok: true };
  });

export type VisitorStats = {
  today: number;
  yesterday: number;
  last30Days: number;
  uniqueToday: number;
  uniqueLast30: number;
  perDay: { day: string; visits: number }[];
  byCountry: { country: string; visits: number }[];
  topPaths: { path: string; visits: number }[];
};

export const getVisitorStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VisitorStats> => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const start30 = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);

    const isoToday = startOfToday.toISOString();
    const isoYesterday = startOfYesterday.toISOString();
    const iso30 = start30.toISOString();

    const [todayQ, yestQ, monthQ, recentQ] = await Promise.all([
      supabaseAdmin.from("visitor_events").select("*", { count: "exact", head: true }).gte("created_at", isoToday),
      supabaseAdmin
        .from("visitor_events")
        .select("*", { count: "exact", head: true })
        .gte("created_at", isoYesterday)
        .lt("created_at", isoToday),
      supabaseAdmin.from("visitor_events").select("*", { count: "exact", head: true }).gte("created_at", iso30),
      supabaseAdmin
        .from("visitor_events")
        .select("session_id, country, path, created_at")
        .gte("created_at", iso30)
        .order("created_at", { ascending: false })
        .limit(50000),
    ]);

    const rows = (recentQ.data ?? []) as {
      session_id: string;
      country: string | null;
      path: string | null;
      created_at: string;
    }[];

    const dayMap = new Map<string, Set<string>>();
    const countryMap = new Map<string, number>();
    const pathMap = new Map<string, number>();
    const sessionsToday = new Set<string>();
    const sessions30 = new Set<string>();

    for (const r of rows) {
      const d = new Date(r.created_at);
      const dayKey = d.toISOString().slice(0, 10);
      if (!dayMap.has(dayKey)) dayMap.set(dayKey, new Set());
      dayMap.get(dayKey)!.add(r.session_id);
      sessions30.add(r.session_id);
      if (d >= startOfToday) sessionsToday.add(r.session_id);
      const c = (r.country ?? "Unknown").toUpperCase();
      countryMap.set(c, (countryMap.get(c) ?? 0) + 1);
      const p = r.path ?? "/";
      pathMap.set(p, (pathMap.get(p) ?? 0) + 1);
    }

    const perDay: { day: string; visits: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      perDay.push({ day: key, visits: dayMap.get(key)?.size ?? 0 });
    }

    const byCountry = Array.from(countryMap.entries())
      .map(([country, visits]) => ({ country, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 25);

    const topPaths = Array.from(pathMap.entries())
      .map(([path, visits]) => ({ path, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 15);

    return {
      today: todayQ.count ?? 0,
      yesterday: yestQ.count ?? 0,
      last30Days: monthQ.count ?? 0,
      uniqueToday: sessionsToday.size,
      uniqueLast30: sessions30.size,
      perDay,
      byCountry,
      topPaths,
    };
  });