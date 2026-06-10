import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type AppRole = "admin" | "editor" | "user";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
  });

const getAdminClient = () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Backend admin configuration is missing");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

const normalizeEmail = (email: unknown) =>
  String(email ?? "")
    .trim()
    .toLowerCase();
const normalizeText = (value: unknown) => String(value ?? "").trim();

async function assertAdmin(req: Request, supabaseAdmin: ReturnType<typeof getAdminClient>) {
  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) throw new Error("Unauthorized: login required");

  const token = header.replace("Bearer ", "").trim();
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized: invalid session");

  const { data: role, error: roleError } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (roleError) throw new Error(roleError.message);
  if (!role) throw new Error("Admin permission required");
  return data.user.id;
}

async function findAuthUserByEmail(
  email: string,
  supabaseAdmin: ReturnType<typeof getAdminClient>,
) {
  const perPage = 1000;
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const user = data.users.find((item) => item.email?.toLowerCase() === email);
    if (user) return user;
    if (data.users.length < perPage) return null;
  }
  return null;
}

async function listAdmins(supabaseAdmin: ReturnType<typeof getAdminClient>) {
  const { data: roles, error } = await supabaseAdmin
    .from("user_roles")
    .select("id, user_id, role, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const ids = Array.from(new Set((roles ?? []).map((role) => role.user_id)));
  const users = await Promise.all(
    ids.map((id) => supabaseAdmin.auth.admin.getUserById(id).then((result) => result.data.user)),
  );
  const userMap = new Map(users.filter(Boolean).map((user) => [user!.id, user!]));
  const grouped = new Map<
    string,
    { id: string; user_id: string; role: string; created_at: string; email: string }
  >();

  for (const role of roles ?? []) {
    const current = grouped.get(role.user_id);
    grouped.set(role.user_id, {
      id: current?.id ?? role.id,
      user_id: role.user_id,
      role:
        current?.role === "admin" || role.role === "admin"
          ? "admin"
          : (current?.role ?? role.role),
      created_at: current?.created_at ?? role.created_at,
      email: userMap.get(role.user_id)?.email ?? "",
    });
  }

  return Array.from(grouped.values());
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseAdmin = getAdminClient();
    const currentUserId = await assertAdmin(req, supabaseAdmin);
    const body = await req.json().catch(() => ({}));
    const action = normalizeText(body.action);

    if (action === "list") return json(await listAdmins(supabaseAdmin));

    if (action === "add") {
      const email = normalizeEmail(body.email);
      const password = normalizeText(body.password);
      const fullName = normalizeText(body.fullName);
      const role = normalizeText(body.role || "admin") as AppRole;
      if (!email.includes("@")) throw new Error("Valid email required");
      if (password.length < 8) throw new Error("Password must be at least 8 characters");
      if (!fullName) throw new Error("Full name required");
      if (!["admin", "editor", "user"].includes(role)) throw new Error("Invalid role");

      const existingUser = await findAuthUserByEmail(email, supabaseAdmin);
      const { data: created, error } = existingUser
        ? { data: { user: existingUser }, error: null }
        : await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName },
          });
      if (error || !created.user) throw new Error(error?.message ?? "Failed to create user");

      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: created.user.id, role }, { onConflict: "user_id,role" });
      if (roleError) throw new Error(roleError.message);

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({ id: created.user.id, full_name: fullName });
      if (profileError) throw new Error(profileError.message);

      if (existingUser) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName },
          },
        );
        if (updateError) return json({ ok: true, passwordWarning: updateError.message });
      }

      return json({ ok: true });
    }

    if (action === "remove") {
      const userId = normalizeText(body.userId);
      if (userId === currentUserId) throw new Error("নিজেকে remove করা যাবে না");
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw new Error(error.message);
      return json({ ok: true });
    }

    if (action === "resetPassword") {
      const userId = normalizeText(body.userId);
      const password = normalizeText(body.password);
      if (password.length < 8) throw new Error("Password must be at least 8 characters");
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
      if (error) throw new Error(error.message);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin request failed";
    const status = message.startsWith("Unauthorized")
      ? 401
      : message.includes("permission")
        ? 403
        : 400;
    return json({ error: message }, status);
  }
});