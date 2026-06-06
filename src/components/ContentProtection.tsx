import { useEffect, useState } from "react";

/**
 * Blocks copy/screenshot attempts: blurs the entire page and shows a centered
 * warning popup. Clicking the popup button restores visibility.
 */
export function ContentProtection() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const trigger = () => setBlocked(true);

    const prevent = (e: Event) => {
      e.preventDefault();
      trigger();
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.key === "PrintScreen") {
        try {
          navigator.clipboard?.writeText("");
        } catch {}
        e.preventDefault();
        trigger();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && ["c", "x", "s", "p", "u", "a"].includes(k)) {
        e.preventDefault();
        trigger();
        return;
      }
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(k))
      ) {
        e.preventDefault();
        trigger();
        return;
      }
    };

    document.addEventListener("contextmenu", prevent);
    document.addEventListener("copy", prevent);
    document.addEventListener("cut", prevent);
    document.addEventListener("dragstart", prevent);
    document.addEventListener("selectstart", prevent);
    document.addEventListener("keydown", onKeyDown);

    // Catch selection that slips past selectstart (e.g. inside tables / rich content)
    const onSelectionChange = () => {
      const sel = document.getSelection();
      if (!sel || sel.isCollapsed) return;
      const anchor = sel.anchorNode as Node | null;
      if (anchor) {
        const el =
          anchor.nodeType === 1
            ? (anchor as HTMLElement)
            : (anchor.parentElement as HTMLElement | null);
        // allow selection inside form inputs
        if (
          el &&
          el.closest(
            'input, textarea, [contenteditable="true"], #__protect_popup',
          )
        ) {
          return;
        }
      }
      sel.removeAllRanges();
      trigger();
    };
    document.addEventListener("selectionchange", onSelectionChange);

    const style = document.createElement("style");
    style.setAttribute("data-content-protection", "true");
    style.innerHTML = `
      html, body, html *:not(input):not(textarea):not([contenteditable="true"]) {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      img, video {
        -webkit-user-drag: none !important;
        user-drag: none !important;
      }
      @media print {
        body * { visibility: hidden !important; }
        body::after {
          content: "এই কনটেন্ট প্রিন্ট করার অনুমতি নেই।";
          visibility: visible;
          display: block;
          text-align: center;
          margin-top: 40vh;
          font-size: 20px;
        }
      }
      [data-protect-blur="true"] {
        filter: blur(14px) !important;
        transition: filter 0.2s ease;
        pointer-events: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("copy", prevent);
      document.removeEventListener("cut", prevent);
      document.removeEventListener("dragstart", prevent);
      document.removeEventListener("selectstart", prevent);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("selectionchange", onSelectionChange);
      style.remove();
    };
  }, []);

  // Apply blur to siblings of the popup (whole app) when blocked
  useEffect(() => {
    const root = document.getElementById("__protect_root_blur_target");
    // Blur everything in body except our popup overlay
    const nodes = Array.from(document.body.children) as HTMLElement[];
    nodes.forEach((el) => {
      if (el.id === "__protect_popup") return;
      if (blocked) el.setAttribute("data-protect-blur", "true");
      else el.removeAttribute("data-protect-blur");
    });
    return () => {
      nodes.forEach((el) => el.removeAttribute("data-protect-blur"));
    };
  }, [blocked]);

  if (!blocked) return null;

  return (
    <div
      id="__protect_popup"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="bg-card text-card-foreground border border-border shadow-2xl rounded-xl"
        style={{
          maxWidth: 360,
          width: "90%",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <h3 className="text-lg font-bold mb-2">⚠️ সতর্কতা!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          এই ওয়েবসাইটের কনটেন্ট কপি বা স্ক্রিনশট নেওয়া নিষিদ্ধ।
        </p>
        <button
          onClick={() => setBlocked(false)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          বুঝেছি
        </button>
      </div>
    </div>
  );
}