import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  site: { name?: string; tagline?: string; logo_url?: string };
  meta: { title?: string; description?: string; keywords?: string; og_image?: string };
  contact: {
    email?: string;
    phone?: string;
    address?: string;
    facebook?: string;
    youtube?: string;
    map_url?: string;
  };
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await supabase
        .from("settings")
        .select("key,value")
        .in("key", ["site", "meta", "contact"]);
      if (error) throw error;
      const out: SiteSettings = { site: {}, meta: {}, contact: {} };
      (data ?? []).forEach((r) => {
        (out as Record<string, unknown>)[r.key] = (r.value as Record<string, unknown>) ?? {};
      });
      return out;
    },
    staleTime: 60_000,
  });
}