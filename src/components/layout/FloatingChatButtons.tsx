import { useSiteSettings } from "@/hooks/useSiteSettings";
import { MessageCircle, Send } from "lucide-react";

function normalizeTelegram(raw?: string): string | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!v) return null;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  const handle = v.replace(/^@/, "");
  if (!handle) return null;
  return `https://t.me/${handle}`;
}

function normalizeWhatsapp(raw?: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export function FloatingChatButtons() {
  const { data: settings } = useSiteSettings();
  const wa = normalizeWhatsapp(settings?.contact.whatsapp);
  const tg = normalizeTelegram(settings?.contact.telegram);

  if (!wa && !tg) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp এ চ্যাট করুন"
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/40 transition hover:scale-110 hover:shadow-xl"
        >
          <MessageCircle className="h-7 w-7" />
          <span className="sr-only">WhatsApp</span>
        </a>
      )}
      {tg && (
        <a
          href={tg}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram এ চ্যাট করুন"
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-lg ring-2 ring-white/40 transition hover:scale-110 hover:shadow-xl"
        >
          <Send className="h-6 w-6" />
          <span className="sr-only">Telegram</span>
        </a>
      )}
    </div>
  );
}