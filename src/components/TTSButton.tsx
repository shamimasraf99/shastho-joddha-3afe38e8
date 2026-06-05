import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";

type Props = {
  getText: () => string;
  lang?: string;
  label?: string;
  className?: string;
};

export function TTSButton({ getText, lang = "bn-BD", label = "শুনুন", className }: Props) {
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  if (!supported) return null;

  const start = () => {
    const text = (getText() || "").trim();
    if (!text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 1;
    u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const bn = voices.find((v) => v.lang?.toLowerCase().startsWith("bn"));
    if (bn) u.voice = bn;
    u.onend = () => setStatus("idle");
    u.onerror = () => setStatus("idle");
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setStatus("playing");
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setStatus("paused");
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setStatus("playing");
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setStatus("idle");
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      {status === "idle" && (
        <button
          type="button"
          onClick={start}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          aria-label="টেক্সট পড়ে শোনাও"
        >
          <Volume2 className="h-3.5 w-3.5" /> {label}
        </button>
      )}
      {status === "playing" && (
        <>
          <button
            type="button"
            onClick={pause}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <Pause className="h-3.5 w-3.5" /> পজ
          </button>
          <button
            type="button"
            onClick={stop}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-secondary"
            aria-label="বন্ধ"
          >
            <Square className="h-3 w-3" />
          </button>
        </>
      )}
      {status === "paused" && (
        <>
          <button
            type="button"
            onClick={resume}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <Play className="h-3.5 w-3.5" /> চালু
          </button>
          <button
            type="button"
            onClick={stop}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-secondary"
            aria-label="বন্ধ"
          >
            <Square className="h-3 w-3" />
          </button>
        </>
      )}
    </div>
  );
}