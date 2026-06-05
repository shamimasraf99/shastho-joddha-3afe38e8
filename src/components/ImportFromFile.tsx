import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { toast } from "sonner";

type Imported = { title?: string; content?: string };

export function ImportFromFile({ onImport }: { onImport: (data: Imported) => void }) {
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const name = file.name.toLowerCase();
      if (name.endsWith(".html") || name.endsWith(".htm") || file.type.includes("html")) {
        const text = await file.text();
        const doc = new DOMParser().parseFromString(text, "text/html");
        // Strip scripts/styles
        doc.querySelectorAll("script,style,noscript,iframe").forEach((el) => el.remove());
        const title =
          doc.querySelector("h1")?.textContent?.trim() ||
          doc.querySelector("title")?.textContent?.trim() ||
          file.name.replace(/\.[^.]+$/, "");
        const body = doc.body || doc.documentElement;
        const content = (body.innerHTML || "").trim();
        onImport({ title, content });
        toast.success("HTML থেকে আমদানি সম্পন্ন");
      } else if (name.endsWith(".pdf") || file.type === "application/pdf") {
        const pdfjs = await import("pdfjs-dist");
        // Use a worker via CDN matching the installed version
        // @ts-expect-error - GlobalWorkerOptions exists at runtime
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
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
        const firstLine = fullText.split("\n").find((l) => l.trim().length > 0) || file.name.replace(/\.[^.]+$/, "");
        // Convert plain text to simple HTML paragraphs preserving line breaks
        const html = paragraphs
          .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
          .join("\n");
        onImport({ title: firstLine.slice(0, 200), content: html });
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