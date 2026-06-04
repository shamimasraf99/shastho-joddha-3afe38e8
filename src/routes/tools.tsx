import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Calculator } from "lucide-react";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "স্বাস্থ্য ক্যালকুলেটর — স্বাস্থ্যপিডিয়া" },
      { name: "description", content: "BMI সহ বিভিন্ন স্বাস্থ্য ক্যালকুলেটর — এশীয় গাইডলাইন অনুযায়ী।" },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
            <Calculator className="h-4 w-4" /> স্বাস্থ্য টুলস
          </div>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">ক্যালকুলেটর</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            আপনার স্বাস্থ্য বিশ্লেষণে সহায়ক বিভিন্ন ক্যালকুলেটর।
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <BMICalculator />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function BMICalculator() {
  const [feet, setFeet] = useState("");
  const [inch, setInch] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<null | {
    bmi: string;
    category: string;
    min: string;
    max: string;
    error?: string;
  }>(null);

  const calculate = () => {
    const f = parseInt(feet) || 0;
    const i = parseInt(inch) || 0;
    const w = parseFloat(weight);
    const totalCm = f * 30.48 + i * 2.54;
    const heightM = totalCm / 100;

    if (!(totalCm > 0 && w > 0)) {
      setResult({ bmi: "", category: "", min: "", max: "", error: "অনুগ্রহ করে উচ্চতা এবং ওজনের সঠিক মান লিখুন।" });
      return;
    }

    const bmi = w / (heightM * heightM);
    const min = (18.5 * heightM * heightM).toFixed(1);
    const max = (22.9 * heightM * heightM).toFixed(1);

    let category = "";
    if (bmi < 18.5) category = "ওজন কম (Underweight)";
    else if (bmi <= 22.9) category = "স্বাভাবিক ওজন (Healthy weight)";
    else if (bmi <= 27.4) category = "অতিরিক্ত ওজন (Overweight/At risk)";
    else category = "স্থূলতা (Obesity)";

    setResult({ bmi: bmi.toFixed(1), category, min, max });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-center text-xl font-bold text-primary">BMI ক্যালকুলেটর</h2>

      <label className="mb-1 block text-sm font-medium text-foreground">আপনার উচ্চতা:</label>
      <div className="flex gap-3">
        <input
          type="number"
          inputMode="numeric"
          placeholder="ফুট"
          value={feet}
          onChange={(e) => setFeet(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="ইঞ্চি"
          value={inch}
          onChange={(e) => setInch(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <label className="mb-1 mt-4 block text-sm font-medium text-foreground">আপনার ওজন (কেজি):</label>
      <input
        type="number"
        inputMode="decimal"
        placeholder="যেমন: ৬৫"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />

      <button
        type="button"
        onClick={calculate}
        className="mt-5 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
      >
        ফলাফল দেখুন
      </button>

      {result && (
        <div className="mt-5 rounded-md bg-secondary p-4 text-center text-sm font-semibold text-primary">
          {result.error ? (
            <span className="text-destructive">{result.error}</span>
          ) : (
            <>
              <div>আপনার BMI: {result.bmi}</div>
              <div>অবস্থা: {result.category}</div>
              <div className="mt-3 border-t border-border pt-3 text-xs font-normal text-muted-foreground">
                আপনার উচ্চতা অনুযায়ী আদর্শ ওজনের সীমা:
                <br />
                <b className="text-foreground">{result.min} - {result.max} কেজি</b>
                <br />* এশীয় মানদণ্ড অনুযায়ী BMI ≥ ২৩ স্বাস্থ্যঝুঁকির ইঙ্গিত দেয়।
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}