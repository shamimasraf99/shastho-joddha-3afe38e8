import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";

type Props = {
  getText: () => string;
  lang?: string;
  label?: string;
  className?: string;
};

// Split long Bangla text into <=180 char chunks at sentence/word boundaries.
function chunkText(text: string, max = 180): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= max) return [clean];
  const parts: string[] = [];
  // Split by Bangla full stop "।", ".", "!", "?", ",", or space
  const sentences = clean.split(/(?<=[।.!?])\s+/);
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).trim().length <= max) {
      buf = (buf ? buf + " " : "") + s;
    } else {
      if (buf) parts.push(buf);
      if (s.length <= max) {
        buf = s;
      } else {
        // Hard split very long sentence by words
        const words = s.split(" ");
        buf = "";
        for (const w of words) {
          if ((buf + " " + w).trim().length <= max) {
            buf = (buf ? buf + " " : "") + w;
          } else {
            if (buf) parts.push(buf);
            buf = w;
          }
        }
      }
    }
  }
  if (buf) parts.push(buf);
  return parts;
}

function ttsUrl(text: string, lang: string) {
  const tl = lang.toLowerCase().startsWith("bn") ? "bn" : lang.split("-")[0];
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    text
  )}&tl=${tl}&client=tw-ob`;
}

export function TTSButton({ getText, lang = "bn-BD", label = "শুনুন", className }: Props) {
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<string[]>([]);
  const idxRef = useRef(0);
  const stoppedRef = useRef(false);

  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      audioRef.current?.pause();
      audioRef.current = null;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakWithBrowser = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const voices = window.speechSynthesis.getVoices();
    const bn = voices.find((v) => v.lang?.toLowerCase().startsWith("bn"));
    if (bn) u.voice = bn;
    u.onend = () => setStatus("idle");
    u.onerror = () => setStatus("idle");
    window.speechSynthesis.speak(u);
    setStatus("playing");
  };

  const playChunk = (i: number) => {
    if (stoppedRef.current) return;
    const chunks = chunksRef.current;
    if (i >= chunks.length) {
      setStatus("idle");
      return;
    }
    idxRef.current = i;
    const audio = new Audio(ttsUrl(chunks[i], lang));
    audioRef.current = audio;
    audio.onended = () => playChunk(i + 1);
    audio.onerror = () => {
      // Fallback to browser SpeechSynthesis for full text
      if (i === 0) {
        speakWithBrowser(chunks.join(" "));
      } else {
        setStatus("idle");
      }
    };
    audio.play().catch(() => {
      if (i === 0) speakWithBrowser(chunks.join(" "));
    });
  };

  const start = () => {
    const text = (getText() || "").trim();
    if (!text) return;
    stoppedRef.current = false;
    chunksRef.current = chunkText(text);
    if (!chunksRef.current.length) return;
    setStatus("playing");
    playChunk(0);
  };

  const pause = () => {
    audioRef.current?.pause();
    setStatus("paused");
  };

  const resume = () => {
    audioRef.current?.play().catch(() => {});
    setStatus("playing");
  };

  const stop = () => {
    stoppedRef.current = true;
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
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