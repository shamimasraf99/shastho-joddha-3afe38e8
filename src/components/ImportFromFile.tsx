import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { toast } from "sonner";

type Imported = { title?: string; content?: string };

function normalizePlainText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \f\v]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Try to detect embedded JSON data arrays inside <script> tags
// (common in single-file HTML "apps" where the visible UI is empty until JS runs).
// If found, format the largest array of plain objects as readable plain text.
function extractEmbeddedData(rawHtml: string): string | null {
  try {
    const matches = rawHtml.match(/\[\s*\{[\s\S]*?\}\s*\]/g) || [];
    let best: Array<Record<string, unknown>> | null = null;
    for (const m of matches) {
      try {
        const arr = JSON.parse(m);
        if (
          Array.isArray(arr) &&
          arr.length > 0 &&
          typeof arr[0] === "object" &&
          arr[0] !== null
        ) {
          if (!best || arr.length > best.length) best = arr as Array<Record<string, unknown>>;
        }
      } catch {
        // skip non-JSON match
      }
    }
    if (!best || best.length < 3) return null;
    const keys = Object.keys(best[0]);
    const lines: string[] = [];
    lines.push(`মোট রেকর্ড: ${best.length}`);
    lines.push("");
    // Group by first key if it looks categorical (e.g. district)
    const groupKey = keys[0];
    const groups: Record<string, Array<Record<string, unknown>>> = {};
    for (const row of best) {
      const g = String(row[groupKey] ?? "—");
      (groups[g] ||= []).push(row);
    }
    const groupNames = Object.keys(groups).sort();
    const useGrouping = groupNames.length > 1 && groupNames.length < best.length / 2;
    if (useGrouping) {
      for (const g of groupNames) {
        lines.push(`${groupKey}: ${g}`);
        for (const row of groups[g]) {
          const parts = keys
            .slice(1)
            .map((k) => `${k}: ${String(row[k] ?? "")}`)
            .join(" | ");
          lines.push(`• ${parts}`);
        }
        lines.push("");
      }
    } else {
      for (const row of best) {
        lines.push(keys.map((k) => `${k}: ${String(row[k] ?? "")}`).join(" | "));
      }
    }
    return lines.join("\n");
  } catch {
    return null;
  }
}

export function ImportFromFile({ onImport }: { onImport: (data: Imported) => void }) {
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const name = file.name.toLowerCase();
      if (name.endsWith(".html") || name.endsWith(".htm") || file.type.includes("html")) {
        const text = await file.text();
        const doc = new DOMParser().parseFromString(text, "text/html");
        const title =
          doc.querySelector("h1")?.textContent?.trim() ||
          doc.querySelector("title")?.textContent?.trim() ||
          file.name.replace(/\.[^.]+$/, "");
        // If the HTML embeds a JS data array (common for SPA-style single-file apps),
        // extract it as readable text — the static body text alone is usually empty UI chrome.
        const embedded = extractEmbeddedData(text);
        let content: string;
        if (embedded) {
          content = embedded;
        } else {
          doc.querySelectorAll("script,style,noscript,iframe").forEach((el) => el.remove());
          const body = doc.body || doc.documentElement;
          content = normalizePlainText(body.textContent || "");
        }
        onImport({ title, content });
        toast.success("HTML থেকে আমদানি সম্পন্ন");
      } else if (name.endsWith(".pdf") || file.type === "application/pdf") {
        const pdfjs = await import("pdfjs-dist");
        (
          pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }
        ).GlobalWorkerOptions.workerSrc =
          `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        const buf = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buf }).promise;
        const paragraphs: string[] = [];
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          const tc = await page.getTextContent();
          const lines: string[] = [];
          let last = "";
          for (const item of tc.items as Array<{ str: string; hasEOL?: boolean }>) {
            last += item.str;
            if (item.hasEOL) {
              if (last.trim()) lines.push(last.trim());
              last = "";
            } else {
              last += " ";
            }
          }
          if (last.trim()) lines.push(last.trim());
          paragraphs.push(lines.join("\n"));
        }
        const fullText = paragraphs.join("\n\n").trim();
        const firstLine =
          fullText.split("\n").find((l) => l.trim().length > 0) ||
          file.name.replace(/\.[^.]+$/, "");
        onImport({ title: firstLine.slice(0, 200), content: fullText });
        toast.success(`PDF থেকে ${pdf.numPages} পৃষ্ঠা আমদানি সম্পন্ন`);
      } else {
        toast.error("শুধু PDF বা HTML ফাইল সাপোর্ট করে");
      }
    } catch (e) {
      toast.error("আমদানি ব্যর্থ: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
      <div className="mb-2 text-sm font-semibold text-foreground">দ্রুত আমদানি (PDF / HTML)</div>
      <p className="mb-2 text-xs text-muted-foreground">
        ফাইল আপলোড করলে শিরোনাম ও কন্টেন্ট স্বয়ংক্রিয়ভাবে পূরণ হবে।
      </p>
      <label className="inline-flex cursor-pointer items-center gap-2">
        <input
          type="file"
          accept=".pdf,.html,.htm,application/pdf,text/html"
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
            <FileUp className="mr-1 h-4 w-4" />
            {busy ? "প্রসেস হচ্ছে..." : "ফাইল নির্বাচন করুন"}
          </span>
        </Button>
      </label>
    </div>
  );
}
