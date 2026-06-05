import { createFileRoute, useParams, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resources, type FieldDef, type ResourceDef } from "@/lib/admin-resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Upload, X as XIcon } from "lucide-react";
import { ImportFromFile } from "@/components/ImportFromFile";

export const Route = createFileRoute("/_authenticated/admin/$resource")({
  beforeLoad: ({ params }) => {
    if (!resources[params.resource]) throw notFound();
  },
  component: ResourcePage,
});

function ResourcePage() {
  const { resource } = useParams({ from: "/_authenticated/admin/$resource" });
  const def = resources[resource] as ResourceDef;
  const pk = def.pk ?? "id";
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<unknown>(null);

  const queryKey = ["admin-list", def.table, def.filter?.value ?? null, search];

  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase.from(def.table as never).select("*");
      if (def.filter) q = q.eq(def.filter.column, def.filter.value as never);
      if (def.orderBy) q = q.order(def.orderBy.column, { ascending: def.orderBy.ascending });
      if (search && def.searchColumn) q = q.ilike(def.searchColumn, `%${search}%`);
      const { data, error } = await q.limit(500);
      if (error) throw error;
      return data as Record<string, unknown>[];
    },
  });

  const upsertMut = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const merged = { ...(def.defaults ?? {}), ...values };
      const { error } = await supabase.from(def.table as never).upsert(merged as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-list", def.table] });
      toast.success("সংরক্ষিত হয়েছে");
      setShowForm(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: unknown) => {
      const { error } = await supabase.from(def.table as never).delete().eq(pk, id as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-list", def.table] });
      toast.success("ডিলিট হয়েছে");
      setDeletingId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{def.title}</h2>
          <p className="text-sm text-muted-foreground">{rows.length} টি রেকর্ড</p>
        </div>
        <div className="flex items-center gap-2">
          {def.searchColumn && (
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          )}
          <Button onClick={() => { setEditing({ ...(def.defaults ?? {}) }); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1" /> নতুন
          </Button>
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {def.listColumns.map((c) => (
                <TableHead key={c.key}>{c.label}</TableHead>
              ))}
              <TableHead className="w-32 text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={def.listColumns.length + 1} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={def.listColumns.length + 1} className="text-center py-8 text-muted-foreground">কোনো রেকর্ড নেই</TableCell></TableRow>
            ) : (
              rows.map((row, i) => (
                <TableRow key={(row[pk] as string) ?? i}>
                  {def.listColumns.map((c) => (
                    <TableCell key={c.key} className="max-w-xs truncate">{renderCell(row[c.key])}</TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(row); setShowForm(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingId(row[pk])}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <FormDialog
        open={showForm}
        onOpenChange={(v) => { setShowForm(v); if (!v) setEditing(null); }}
        def={def}
        initial={editing}
        onSubmit={(vals) => upsertMut.mutate(vals)}
        submitting={upsertMut.isPending}
      />

      <AlertDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই রেকর্ড স্থায়ীভাবে মুছে যাবে।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId !== null && deleteMut.mutate(deletingId)}>
              ডিলিট
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function renderCell(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "✓" : "✗";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function FormDialog({
  open,
  onOpenChange,
  def,
  initial,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  def: ResourceDef;
  initial: Record<string, unknown> | null;
  onSubmit: (v: Record<string, unknown>) => void;
  submitting: boolean;
}) {
  const isEdit = !!(initial && Object.keys(initial).length > 0);
  const pk = def.pk ?? "id";

  const [values, setValues] = useState<Record<string, unknown>>({});

  useMemo(() => {
    const v: Record<string, unknown> = {};
    for (const f of def.fields) {
      const raw = initial?.[f.key];
      if (f.type === "tags") v[f.key] = Array.isArray(raw) ? raw.join(", ") : (raw ?? "");
      else if (f.type === "json") v[f.key] = raw ? (typeof raw === "string" ? raw : JSON.stringify(raw, null, 2)) : "";
      else if (f.type === "boolean") v[f.key] = raw ?? false;
      else v[f.key] = raw ?? "";
    }
    setValues(v);
    return null;
  }, [initial, def]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const out: Record<string, unknown> = {};
    if (isEdit && initial?.[pk] !== undefined) out[pk] = initial[pk];
    for (const f of def.fields) {
      const v = values[f.key];
      if (f.type === "number") out[f.key] = v === "" || v === null ? null : Number(v);
      else if (f.type === "boolean") out[f.key] = !!v;
      else if (f.type === "tags") {
        const s = String(v ?? "").trim();
        out[f.key] = s ? s.split(",").map((x) => x.trim()).filter(Boolean) : null;
      } else if (f.type === "json") {
        const s = String(v ?? "").trim();
        if (!s) { out[f.key] = null; continue; }
        try { out[f.key] = JSON.parse(s); } catch { toast.error(`${f.label}: invalid JSON`); throw new Error("invalid json"); }
      } else if (f.type === "date") {
        out[f.key] = v ? String(v) : null;
      } else {
        const s = String(v ?? "");
        out[f.key] = s === "" ? null : s;
      }
    }
    // Auto-generate slug from title if slug field exists but is empty
    if ("slug" in out && (!out.slug || String(out.slug).trim() === "") && out.title) {
      const base = String(out.title)
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);
      out.slug = base ? `${base}-${Date.now().toString(36)}` : `post-${Date.now().toString(36)}`;
    }
    onSubmit(out);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `${def.singular} সম্পাদনা` : `নতুন ${def.singular}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {def.table === "articles" && (
            <ImportFromFile
              onImport={(d) =>
                setValues((prev) => ({
                  ...prev,
                  ...(d.title ? { title: d.title } : {}),
                  ...(d.content ? { content: d.content } : {}),
                }))
              }
            />
          )}
          {def.fields.map((f) => (
            <FieldInput
              key={f.key}
              field={f}
              value={values[f.key]}
              onChange={(nv) => setValues((p) => ({ ...p, [f.key]: nv }))}
            />
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>বাতিল</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "সংরক্ষণ..." : "সংরক্ষণ"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldInput({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const { data: remoteOptions } = useQuery({
    queryKey: ["field-options", field.optionsFrom?.table, field.optionsFrom?.valueColumn, field.optionsFrom?.labelColumn],
    enabled: !!field.optionsFrom,
    queryFn: async () => {
      const src = field.optionsFrom!;
      let q = supabase.from(src.table as never).select(`${src.valueColumn},${src.labelColumn}`);
      if (src.orderBy) q = q.order(src.orderBy.column, { ascending: src.orderBy.ascending });
      const { data, error } = await q.limit(500);
      if (error) throw error;
      return (data as Record<string, unknown>[]).map((r) => ({
        value: String(r[src.valueColumn]),
        label: String(r[src.labelColumn]),
      }));
    },
  });
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${field.key}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
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
  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-md border p-3">
        <Label>{field.label}</Label>
        <Switch checked={!!value} onCheckedChange={onChange} />
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div>
        <Label>{field.label}{field.required && " *"}</Label>
        <Textarea value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} rows={3} />
      </div>
    );
  }
  if (field.type === "richtext" || field.type === "json") {
    return (
      <div>
        <Label>{field.label}{field.required && " *"}</Label>
        <Textarea value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} rows={8} className="font-mono text-xs" />
      </div>
    );
  }
  if (field.type === "image") {
    const url = (value as string) ?? "";
    return (
      <div>
        <Label>{field.label}{field.required && " *"}</Label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={url}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            placeholder="https://... অথবা আপলোড করুন"
          />
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md border bg-card px-3 text-sm hover:bg-accent">
            <Upload className="h-4 w-4" />
            <span>{uploading ? "..." : "আপলোড"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {url && (
          <div className="mt-2 flex items-center gap-2">
            <img src={url} alt="" className="h-20 w-20 rounded border object-cover" />
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              <XIcon className="h-4 w-4 mr-1" /> সরান
            </Button>
          </div>
        )}
      </div>
    );
  }
  if (field.type === "select") {
    const opts = field.optionsFrom ? (remoteOptions ?? []) : (field.options ?? []);
    return (
      <div>
        <Label>{field.label}{field.required && " *"}</Label>
        <Select value={(value as string) ?? ""} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
          <SelectContent>
            {opts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }
  return (
    <div>
      <Label>{field.label}{field.required && " *"}</Label>
      <Input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={(value as string | number) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        placeholder={field.placeholder}
      />
    </div>
  );
}