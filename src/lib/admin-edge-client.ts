import { supabase } from "@/integrations/supabase/client";

export type AdminRole = "admin" | "editor" | "user";

export type AdminUserRow = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email: string;
};

type AdminAction =
  | "list"
  | "add"
  | "remove"
  | "resetPassword";

async function callAdminUsers<T>(action: AdminAction, payload: Record<string, unknown> = {}) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (sessionError || !token) throw new Error("Unauthorized: login required");

  const backendUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!backendUrl) throw new Error("Backend URL missing");

  const response = await fetch(`${backendUrl}/functions/v1/admin-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });

  const result = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(result.error || "Admin request failed");
  return result;
}

export const listAdminsFromBackend = () => callAdminUsers<AdminUserRow[]>("list");

export const addAdminFromBackend = (data: {
  email: string;
  password: string;
  fullName: string;
  role: AdminRole;
}) => callAdminUsers<{ ok: true; passwordWarning?: string }>("add", data);

export const removeAdminFromBackend = (userId: string) =>
  callAdminUsers<{ ok: true }>("remove", { userId });

export const resetAdminPasswordFromBackend = (userId: string, password: string) =>
  callAdminUsers<{ ok: true }>("resetPassword", { userId, password });