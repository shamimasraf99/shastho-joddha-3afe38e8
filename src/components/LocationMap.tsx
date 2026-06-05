import { useState, useCallback } from "react";
import { MapPin, Search } from "lucide-react";

export function LocationMap() {
  const [query, setQuery] = useState("");

  const handleSearch = useCallback(() => {
    const q = query.trim();
    const url = q
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
      : `https://www.google.com/maps/search/?api=1&query=Dhaka,Bangladesh`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
            <MapPin className="h-4 w-4" /> লোকেশন ম্যাপ
          </div>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            হাসপাতাল বা যেকোনো স্থান খুঁজুন
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            সার্চ করে বাংলাদেশের যেকোনো হাসপাতাল, ক্লিনিক বা ঠিকানা দেখুন।
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="যেমন: সিএমএইচ ঢাকা, বারডেম হাসপাতাল..."
            className="flex-1 rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            <Search className="h-4 w-4" />
            ম্যাপ দেখুন
          </button>
        </div>
      </div>
    </section>
  );
}
