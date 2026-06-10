import { createMiddleware } from "@tanstack/react-start";

function readAccessTokenFromStorage() {
  if (typeof window === "undefined") return "";

  const parseToken = (raw: string | null) => {
    if (!raw) return "";
    try {
      const parsed = JSON.parse(raw) as {
        access_token?: string;
        currentSession?: { access_token?: string };
      };
      return parsed.access_token || parsed.currentSession?.access_token || "";
    } catch {
      return "";
    }
  };

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
  const directToken = parseToken(
    projectId ? localStorage.getItem(`sb-${projectId}-auth-token`) : null,
  );
  if (directToken) return directToken;

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith("sb-") && key.endsWith("-auth-token")) {
      const token = parseToken(localStorage.getItem(key));
      if (token) return token;
    }
  }

  return "";
}

export const attachAuthToken = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const token = readAccessTokenFromStorage();
  return next({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
});
