import { useEffect } from "react";

/**
 * Discourages copying, right-click, text selection, and basic screenshot shortcuts.
 * Note: Client-side protection can be bypassed by a determined user; this is a deterrent.
 */
export function ContentProtection() {
  useEffect(() => {
    const prevent = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      // PrintScreen
      if (e.key === "PrintScreen") {
        try {
          navigator.clipboard?.writeText("");
        } catch {}
        e.preventDefault();
        return;
      }
      // Block common shortcuts: copy/cut/save/print/view-source/devtools/select-all
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "x", "s", "p", "u", "a"].includes(k)
      ) {
        e.preventDefault();
        return;
      }
      // DevTools
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(k))
      ) {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener("contextmenu", prevent);
    document.addEventListener("copy", prevent);
    document.addEventListener("cut", prevent);
    document.addEventListener("dragstart", prevent);
    document.addEventListener("selectstart", prevent);
    document.addEventListener("keydown", onKeyDown);

    // Inline style to disable selection + screenshot-friendly blurring on blur
    const style = document.createElement("style");
    style.setAttribute("data-content-protection", "true");
    style.innerHTML = `
      html, body {
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
        pointer-events: auto;
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
    `;
    document.head.appendChild(style);

    // Blur screen when window loses focus (helps against some screenshot tools)
    const onBlur = () => {
      document.body.style.filter = "blur(8px)";
    };
    const onFocus = () => {
      document.body.style.filter = "";
    };
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("copy", prevent);
      document.removeEventListener("cut", prevent);
      document.removeEventListener("dragstart", prevent);
      document.removeEventListener("selectstart", prevent);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      style.remove();
      document.body.style.filter = "";
    };
  }, []);

  return null;
}