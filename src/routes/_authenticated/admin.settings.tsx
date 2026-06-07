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
import { Upload, X as XIcon, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

type SiteV = { name?: string; tagline?: string; logo_url?: string };
type MetaV = { title?: string; description?: string; keywords?: string; og_image?: string };
type ContactV = {
  email?: string;
  phone?: string;
  address?: string;
  facebook?: string;
  youtube?: string;
  map_url?: string;
  whatsapp?: string;
  telegram?: string;
};
type FooterV = { title?: string; description?: string };
type EmergencyItem = { label: string; number: string };
type EmergencyV = { items?: EmergencyItem[] };

const KEYS = ["site", "meta", "contact", "footer", "emergency"] as const;

function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site-settings-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("key,value").in("key", KEYS as unknown as string[]);
      if (error) throw error;
      const map: Record<string, Record<string, unknown>> = {};
      (data ?? []).forEach((r) => (map[r.key] = (r.value as Record<string, unknown>) ?? {}));
      return map;
    },
  });

  const [site, setSite] = useState<SiteV>({});
  const [meta, setMeta] = useState<MetaV>({});
  const [contact, setContact] = useState<ContactV>({});
  const [footer, setFooter] = useState<FooterV>({});
  const [emergency, setEmergency] = useState<EmergencyV>({ items: [] });

  useEffect(() => {
    if (!data) return;
    setSite((data.site as SiteV) ?? {});
    setMeta((data.meta as MetaV) ?? {});
    setContact((data.contact as ContactV) ?? {});
    setFooter((data.footer as FooterV) ?? {});
    const em = (data.emergency as EmergencyV) ?? {};
    setEmergency({ items: em.items ?? [] });
  }, [data]);

  const save = useMutation({
    mutationFn: async (payload: { key: string; value: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("settings")
        .upsert({ key: payload.key, value: payload.value as never, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("সংরক্ষিত হয়েছে");
      qc.invalidateQueries({ queryKey: ["site-settings-admin"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-4">লোড হচ্ছে...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">সাইট সেটিংস</h1>
        <p className="text-sm text-muted-foreground">লোগো, সাইটের নাম, মেটা ডেটা ও যোগাযোগের তথ্য পরিবর্তন করুন।</p>
      </div>

      <Card>
        <CardHeader><CardTitle>সাইট তথ্য ও লোগো</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="সাইটের নাম">
            <Input value={site.name ?? ""} onChange={(e) => setSite({ ...site, name: e.target.value })} placeholder="স্বাস্থ্যপিডিয়া" />
          </Field>
          <Field label="ট্যাগলাইন">
            <Input value={site.tagline ?? ""} onChange={(e) => setSite({ ...site, tagline: e.target.value })} placeholder="HealthPedia • Bangladesh" />
          </Field>
          <Field label="লোগো">
            <ImageUploader prefix="site-logo" value={site.logo_url} onChange={(v) => setSite({ ...site, logo_url: v })} />
          </Field>
          <Button onClick={() => save.mutate({ key: "site", value: site as Record<string, unknown> })} disabled={save.isPending}>
            সংরক্ষণ
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>মেটা ডেটা (SEO)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Meta Title">
            <Input value={meta.title ?? ""} onChange={(e) => setMeta({ ...meta, title: e.target.value })} />
          </Field>
          <Field label="Meta Description">
            <Textarea rows={3} value={meta.description ?? ""} onChange={(e) => setMeta({ ...meta, description: e.target.value })} />
          </Field>
          <Field label="Keywords (কমা দিয়ে)">
            <Input value={meta.keywords ?? ""} onChange={(e) => setMeta({ ...meta, keywords: e.target.value })} />
          </Field>
          <Field label="OG Image">
            <ImageUploader prefix="og-image" value={meta.og_image} onChange={(v) => setMeta({ ...meta, og_image: v })} />
          </Field>
          <Button onClick={() => save.mutate({ key: "meta", value: meta as Record<string, unknown> })} disabled={save.isPending}>
            সংরক্ষণ
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>যোগাযোগ পেজের তথ্য</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="ইমেইল">
            <Input value={contact.email ?? ""} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          </Field>
          <Field label="ফোন">
            <Input value={contact.phone ?? ""} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
          </Field>
          <Field label="ঠিকানা">
            <Textarea rows={2} value={contact.address ?? ""} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
          </Field>
          <Field label="Facebook URL">
            <Input value={contact.facebook ?? ""} onChange={(e) => setContact({ ...contact, facebook: e.target.value })} />
          </Field>
          <Field label="YouTube URL">
            <Input value={contact.youtube ?? ""} onChange={(e) => setContact({ ...contact, youtube: e.target.value })} />
          </Field>
          <Field label="Google Map URL (embed)">
            <Input value={contact.map_url ?? ""} onChange={(e) => setContact({ ...contact, map_url: e.target.value })} />
          </Field>
          <Field label="WhatsApp নম্বর (E.164, যেমন +8801XXXXXXXXX)">
            <Input value={contact.whatsapp ?? ""} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} placeholder="+8801XXXXXXXXX" />
          </Field>
          <Field label="Telegram ইউজারনেম বা লিংক (যেমন @username বা https://t.me/username)">
            <Input value={contact.telegram ?? ""} onChange={(e) => setContact({ ...contact, telegram: e.target.value })} placeholder="@username" />
          </Field>
          <Button onClick={() => save.mutate({ key: "contact", value: contact as Record<string, unknown> })} disabled={save.isPending}>
            সংরক্ষণ
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>ফুটার</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="ফুটার টাইটেল">
            <Input value={footer.title ?? ""} onChange={(e) => setFooter({ ...footer, title: e.target.value })} placeholder="স্বাস্থ্যপিডিয়া" />
          </Field>
          <Field label="ফুটার ডিসক্রিপশন">
            <Textarea rows={3} value={footer.description ?? ""} onChange={(e) => setFooter({ ...footer, description: e.target.value })} />
          </Field>
          <Button onClick={() => save.mutate({ key: "footer", value: footer as Record<string, unknown> })} disabled={save.isPending}>
            সংরক্ষণ
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>জরুরি নম্বর</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {(emergency.items ?? []).map((it, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <Input
                  placeholder="লেবেল (যেমন জাতীয় জরুরি সেবা)"
                  value={it.label}
                  onChange={(e) => {
                    const items = [...(emergency.items ?? [])];
                    items[idx] = { ...items[idx], label: e.target.value };
                    setEmergency({ items });
                  }}
                />
                <Input
                  placeholder="নম্বর (যেমন 999)"
                  value={it.number}
                  onChange={(e) => {
                    const items = [...(emergency.items ?? [])];
                    items[idx] = { ...items[idx], number: e.target.value };
                    setEmergency({ items });
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const items = [...(emergency.items ?? [])];
                    items.splice(idx, 1);
                    setEmergency({ items });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setEmergency({ items: [...(emergency.items ?? []), { label: "", number: "" }] })
              }
            >
              <Plus className="h-4 w-4 mr-1" /> নতুন নম্বর যোগ করুন
            </Button>
          </div>
          <Button
            onClick={() =>
              save.mutate({
                key: "emergency",
                value: {
                  items: (emergency.items ?? []).filter((i) => i.label.trim() && i.number.trim()),
                } as Record<string, unknown>,
              })
            }
            disabled={save.isPending}
          >
            সংরক্ষণ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ImageUploader({ prefix, value, onChange }: { prefix: string; value?: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("uploads").upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data, error: sErr } = await supabase.storage.from("uploads").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr) throw sErr;
      onChange(data.signedUrl);
      toast.success("আপলোড সম্পন্ন");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
        <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
          <label className="cursor-pointer">
            <Upload className="h-4 w-4 mr-1" /> {uploading ? "..." : "আপলোড"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
          </label>
        </Button>
      </div>
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="preview" className="h-20 rounded border" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}