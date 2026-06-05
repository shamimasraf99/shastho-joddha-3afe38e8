import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SitePage = { title?: string; body?: string };

export function useSitePage(key: string) {
  return useQuery({
    queryKey: ["site-page", key],
    queryFn: async (): Promise<SitePage> => {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      return (data?.value as SitePage) ?? {};
    },
    staleTime: 60_000,
  });
}