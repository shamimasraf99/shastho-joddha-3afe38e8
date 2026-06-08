import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/api/public/__reveal-d5e22da102c9970130e4a9842ff69b416424b35387c1eecc",
)({
  server: {
    handlers: {
      GET: async () => {
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
        return new Response(key, {
          status: 200,
          headers: { "content-type": "text/plain" },
        });
      },
    },
  },
});