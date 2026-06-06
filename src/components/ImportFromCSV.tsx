import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ResourceDef, FieldDef } from "@/lib/admin-resources";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQ = false;
  const t = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQ) {
      if (c === '"') {
        if (t[i + 1] === '"') { field += '"'; i++; } else { inQ = false; }
      } else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { cur.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && t[i + 1] === "\n") i++;
        cur.push(field); field = "";
        if (cur.some((x) => x.trim() !== "")) rows.push(cur);
        cur = [];
      } else field += c;
    }
  }
  if (field !== "" || cur.length) { cur.push(field); if (cur.some((x) => x.trim() !== "")) rows.push(cur); }
  return rows;
}

function coerce(field: FieldDef, raw: string): unknown {
  const v = (raw ?? "").trim();
  if (v === "") return null;
  if (field.type === "number") { const n = Number(v); return isNaN(n) ? null : n; }
  if (field.type === "boolean") return /^(1|true|yes|y|হ্যাঁ|t)$/i.test(v);
  if (field.type === "tags") return v.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  if (field.type === "json") { try { return JSON.parse(v); } catch { return v; } }
  return v;
}

function slugify(s: string) {
  return String(s).trim().toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

export function ImportFromCSV({ def, onDone }: { def: ResourceDef; onDone: () => void }) {
  const [busy, setBusy] = useState(false);

  const downloadTemplate = () => {
    const headers = def.fields.map((f) => f.key);
    const csv = headers.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${def.table}-template.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length < 2) throw new Error("CSV ফাইলে কোনো ডাটা নেই");
      const headers = rows[0].map((h) => h.trim());
      const fieldMap = new Map(def.fields.map((f) => [f.key, f]));
      const records: Record<string, unknown>[] = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const rec: Record<string, unknown> = { ...(def.defaults ?? {}) };
        headers.forEach((h, i) => {
          const f = fieldMap.get(h);
          if (!f) return;
          rec[h] = coerce(f, row[i] ?? "");
        });
        // auto slug
        if (fieldMap.has("slug") && (!rec.slug || String(rec.slug).trim() === "")) {
          const base = rec.title || rec.name;
          if (base) {
            const s = slugify(String(base));
            rec.slug = s ? `${s}-${Date.now().toString(36)}-${r}` : `row-${Date.now().toString(36)}-${r}`;
          }
        }
        records.push(rec);
      }
      if (records.length === 0) throw new Error("কোনো রেকর্ড পাওয়া যায়নি");
      const { error } = await supabase.from(def.table as never).insert(records as never);
      if (error) throw error;
      toast.success(`${records.length} টি রেকর্ড আমদানি সম্পন্ন`);
      onDone();
    } catch (e) {
      toast.error("CSV আমদানি ব্যর্থ: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-foreground">CSV থেকে একাধিক রেকর্ড আমদানি</div>
        <Button type="button" size="sm" variant="ghost" onClick={downloadTemplate}>
          <Download className="mr-1 h-4 w-4" /> টেমপ্লেট
        </Button>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">
        প্রথম সারিতে কলাম নাম থাকবে ({def.fields.slice(0, 4).map((f) => f.key).join(", ")}{def.fields.length > 4 ? ", ..." : ""}). আপলোড করলে সব রেকর্ড একসাথে যোগ হবে।
      </p>
      <label className="inline-flex cursor-pointer items-center gap-2">
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <Button type="button" size="sm" variant="secondary" disabled={busy} asChild>
          <span>
            <FileSpreadsheet className="mr-1 h-4 w-4" />
            {busy ? "আমদানি হচ্ছে..." : "CSV ফাইল নির্বাচন করুন"}
          </span>
        </Button>
      </label>
    </div>
  );
}