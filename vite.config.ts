// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const backendUrl = "https://qdzacdyticfaqstihfyh.supabase.co";
const backendPublishableKey = "sb_publishable_g_tnhysQG5SsZeFresasjg_BqK9rFpG";
const backendProjectId = "qdzacdyticfaqstihfyh";

export default defineConfig({
  vite: {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(backendUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(backendPublishableKey),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(backendProjectId),
      "process.env.SUPABASE_URL": JSON.stringify(backendUrl),
      "process.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify(backendPublishableKey),
      "process.env.SUPABASE_PROJECT_ID": JSON.stringify(backendProjectId),
    },
  },
  nitro: {
    preset: "vercel",
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // SPA shell so static hosts (Vercel) can serve all routes via index.html fallback
    spa: { enabled: true },
  },
});
