import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/pages")({
  component: PagesAdmin,
});

type PageV = { title?: string; body?: string };

const PAGES: { key: string; label: string }[] = [
  { key: "page_about", label: "আমাদের সম্পর্কে (About)" },
  { key: "page_privacy", label: "গোপনীয়তা নীতি (Privacy)" },
  { key: "page_terms", label: "শর্তাবলী (Terms)" },
];

function PagesAdmin() {
  const qc = useQueryClient();
  const keys = PAGES.map((p) => p.key);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("key,value").in("key", keys);
      if (error) throw error;
      const map: Record<string, PageV> = {};
      (data ?? []).forEach((r) => (map[r.key] = (r.value as PageV) ?? {}));
      return map;
    },
  });

  const [state, setState] = useState<Record<string, PageV>>({});
  useEffect(() => {
    if (data) setState(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async (p: { key: string; value: PageV }) => {
      const { error } = await supabase
        .from("settings")
        .upsert({ key: p.key, value: p.value as never, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("সংরক্ষিত হয়েছে");
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
      qc.invalidateQueries({ queryKey: ["site-page"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-4">লোড হচ্ছে...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">পেজ ম্যানেজমেন্ট</h1>
        <p className="text-sm text-muted-foreground">About, Privacy ও Terms পেজের কন্টেন্ট পরিবর্তন করুন। HTML সাপোর্টেড।</p>
      </div>
      {PAGES.map(({ key, label }) => {
        const v = state[key] ?? {};
        return (
          <Card key={key}>
            <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>শিরোনাম</Label>
                <Input
                  value={v.title ?? ""}
                  onChange={(e) => setState({ ...state, [key]: { ...v, title: e.target.value } })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>কন্টেন্ট (HTML)</Label>
                <Textarea
                  rows={14}
                  className="font-mono text-xs"
                  value={v.body ?? ""}
                  onChange={(e) => setState({ ...state, [key]: { ...v, body: e.target.value } })}
                  placeholder="<h2>...</h2><p>...</p>"
                />
              </div>
              <Button onClick={() => save.mutate({ key, value: v })} disabled={save.isPending}>সংরক্ষণ</Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}