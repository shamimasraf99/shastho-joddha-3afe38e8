import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const getRuntimeEnv = (name: string) =>
  process.env[name] || (import.meta.env[name] as string | undefined) || "";

function getSupabaseUrl() {
  return getRuntimeEnv("SUPABASE_URL") || getRuntimeEnv("VITE_SUPABASE_URL");
}

function getSupabasePublishableKey() {
  return (
    getRuntimeEnv("SUPABASE_PUBLISHABLE_KEY") ||
    getRuntimeEnv("SUPABASE_ANON_KEY") ||
    getRuntimeEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    getRuntimeEnv("VITE_SUPABASE_ANON_KEY")
  );
}

let adminClient: SupabaseClient<Database> | undefined;

function getSupabaseAdminClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = getRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) throw new Error("Backend admin configuration is missing");

  adminClient ??= createClient<Database>(url, serviceRoleKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return adminClient;
}

async function getAuthenticatedUserId() {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();
  if (!url || !publishableKey) throw new Error("Backend auth configuration is missing");

  const request = getRequest();
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized: login required");

  const token = authHeader.replace("Bearer ", "").trim();
  const supabase = createClient<Database>(url, publishableKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized: invalid session");
  return data.user.id;
}

async function assertCurrentUserIsAdmin() {
  const userId = await getAuthenticatedUserId();
  await assertAdmin(userId);
  return userId;
}

async function assertAdmin(userId: string) {
  const supabaseAdmin = getSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin permission required");
}

async function findAuthUserByEmail(email: string) {
  const supabaseAdmin = getSupabaseAdminClient();
  const target = email.trim().toLowerCase();
  const perPage = 1000;
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const user = data.users.find((item) => item.email?.toLowerCase() === target);
    if (user) return user;
    if (data.users.length < perPage) return null;
  }
  return null;
}

export const hasAnyAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const supabaseAdmin = getSupabaseAdminClient();
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");
  if (error) throw new Error(error.message);
  return { exists: (count ?? 0) > 0 };
});

export const setupFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email().max(255),
        password: z.string().min(8).max(72),
        fullName: z.string().min(1).max(120),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabaseAdmin = getSupabaseAdminClient();
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("Setup already completed");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Failed to create user");

    const userId = created.user.id;
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (roleError) throw new Error(roleError.message);
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, full_name: data.fullName });
    if (profileError) throw new Error(profileError.message);
    return { ok: true };
  });

export const listAdmins = createServerFn({ method: "GET" }).handler(async () => {
    await assertCurrentUserIsAdmin();
    const supabaseAdmin = getSupabaseAdminClient();
    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("id, user_id, role, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((roles ?? []).map((r) => r.user_id)));
    const users = await Promise.all(
      ids.map((id) => supabaseAdmin.auth.admin.getUserById(id).then((r) => r.data.user)),
    );
    const userMap = new Map(users.filter(Boolean).map((u) => [u!.id, u!]));
    const grouped = new Map<
      string,
      { id: string; user_id: string; role: string; created_at: string; email: string }
    >();
    for (const r of roles ?? []) {
      const current = grouped.get(r.user_id);
      const role =
        current?.role === "admin" || r.role === "admin" ? "admin" : (current?.role ?? r.role);
      grouped.set(r.user_id, {
        id: current?.id ?? r.id,
        user_id: r.user_id,
        role,
        created_at: current?.created_at ?? r.created_at,
        email: userMap.get(r.user_id)?.email ?? "",
      });
    }
    return Array.from(grouped.values());
});

export const addAdminUser = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email().max(255),
        password: z.string().min(8).max(72),
        fullName: z.string().min(1).max(120),
        role: z.enum(["admin", "editor", "user"]).default("admin"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await assertCurrentUserIsAdmin();
    const supabaseAdmin = getSupabaseAdminClient();
    const normalizedEmail = data.email.trim().toLowerCase();
    const existingUser = await findAuthUserByEmail(normalizedEmail);
    const { data: created, error } = existingUser
      ? { data: { user: existingUser }, error: null }
      : await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password: data.password,
          email_confirm: true,
          user_metadata: { full_name: data.fullName },
        });
    if (error || !created.user) throw new Error(error?.message ?? "Failed");
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: created.user.id, role: data.role }, { onConflict: "user_id,role" });
    if (roleError) throw new Error(roleError.message);
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: created.user.id, full_name: data.fullName });
    if (profileError) throw new Error(profileError.message);
    if (existingUser) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          password: data.password,
          email_confirm: true,
          user_metadata: { full_name: data.fullName },
        },
      );
      if (updateError) return { ok: true, passwordWarning: updateError.message };
    }
    return { ok: true };
  });

export const removeAdminUser = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const currentUserId = await assertCurrentUserIsAdmin();
    if (data.userId === currentUserId) throw new Error("নিজেকে remove করা যাবে না");
    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        userId: z.string().uuid(),
        password: z.string().min(8).max(72),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await assertCurrentUserIsAdmin();
    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getDashboardCounts = createServerFn({ method: "GET" }).handler(async () => {
    await assertCurrentUserIsAdmin();
    const supabaseAdmin = getSupabaseAdminClient();
    const tables = [
      "articles",
      "categories",
      "doctors",
      "hospitals",
      "labs",
      "videos",
      "podcasts",
      "mythbusters",
      "questions",
      "blood_donors",
      "advertisements",
    ] as const;
    const entries = await Promise.all(
      tables.map(async (t) => {
        const { count } = await supabaseAdmin.from(t).select("*", { count: "exact", head: true });
        return [t, count ?? 0] as const;
      }),
    );
    return Object.fromEntries(entries) as Record<(typeof tables)[number], number>;
});
