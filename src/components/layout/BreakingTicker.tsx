import { Megaphone } from "lucide-react";

const items = [
  "ডেঙ্গু সতর্কতা: বৃষ্টির পর জমা পানিতে এডিস মশার বংশবিস্তার বেড়েছে।",
  "ঢাকার হাসপাতালগুলোতে বিনামূল্যে চক্ষু পরীক্ষা ক্যাম্প চলছে।",
  "শীতকালীন অ্যাজমা প্রতিরোধে বিশেষজ্ঞদের পরামর্শ প্রকাশিত।",
  "নতুন COVID ভ্যারিয়েন্ট নিয়ে WHO-এর সর্বশেষ আপডেট।",
];

export function BreakingTicker() {
  const loop = [...items, ...items];
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center gap-3 px-4 py-2">
        <span className="flex shrink-0 items-center gap-1.5 rounded-sm bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
          <Megaphone className="h-3.5 w-3.5" /> ব্রেকিং
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track flex whitespace-nowrap text-sm">
            {loop.map((t, i) => (
              <span key={i} className="px-8 text-foreground/90">• {t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}