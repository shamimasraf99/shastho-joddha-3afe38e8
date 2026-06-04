import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Calculator, Scale, Heart, Activity, Baby, Droplet, Flame, Ruler, ArrowLeft, Utensils } from "lucide-react";

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
  const [active, setActive] = useState<string | null>(null);

  const tools = [
    { id: "bmi", title: "BMI ক্যালকুলেটর", desc: "শরীরের ওজন বিশ্লেষণ", Icon: Scale, color: "text-emerald-600" },
    { id: "bp", title: "ব্লাড প্রেসার", desc: "রক্তচাপ বিশ্লেষণ", Icon: Heart, color: "text-rose-600", soon: true },
    { id: "sugar", title: "ব্লাড সুগার", desc: "ডায়াবেটিস চেক", Icon: Droplet, color: "text-sky-600", soon: true },
    { id: "calorie", title: "ক্যালরি ক্যালকুলেটর", desc: "দৈনিক ক্যালরি প্রয়োজন", Icon: Flame, color: "text-orange-500" },
    { id: "diet", title: "ডায়েট প্ল্যানার", desc: "ক্যালরি ও দেশি মেনু", Icon: Utensils, color: "text-lime-600" },
    { id: "pregnancy", title: "ডেলিভারি ডেট ও চেকাপ", desc: "গর্ভকালীন ক্যালকুলেটর", Icon: Baby, color: "text-pink-600" },
    { id: "bsa", title: "BSA ক্যালকুলেটর", desc: "শরীরের পৃষ্ঠতল", Icon: Ruler, color: "text-violet-600", soon: true },
    { id: "heart", title: "হার্ট রেট জোন", desc: "ব্যায়ামের জন্য", Icon: Activity, color: "text-amber-600", soon: true },
  ];

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

        {!active ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {tools.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => !t.soon && setActive(t.id)}
                disabled={t.soon}
                className="group relative flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:shadow-sm"
              >
                <span className={`grid h-14 w-14 place-items-center rounded-full bg-secondary ${t.color} transition-transform group-hover:scale-110`}>
                  <t.Icon className="h-7 w-7" />
                </span>
                <span className="text-sm font-semibold text-foreground">{t.title}</span>
                <span className="text-xs text-muted-foreground">{t.desc}</span>
                {t.soon && (
                  <span className="absolute right-2 top-2 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    শীঘ্রই
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-xl">
            <button
              type="button"
              onClick={() => setActive(null)}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark"
            >
              <ArrowLeft className="h-4 w-4" /> সব ক্যালকুলেটর
            </button>
            {active === "bmi" && <BMICalculator />}
            {active === "calorie" && <CalorieCalculator />}
            {active === "diet" && <DietPlanner />}
            {active === "pregnancy" && <PregnancyCalculator />}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function CalorieCalculator() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("1.4");
  const [result, setResult] = useState<string | null>(null);

  const calc = () => {
    const w = parseFloat(weight);
    const a = parseFloat(age);
    const f = parseFloat(activity);
    if (!(w > 0 && a > 0)) {
      setResult("অনুগ্রহ করে বয়স এবং ওজনের সঠিক মান লিখুন।");
      return;
    }
    const bmr = w * 24;
    const total = Math.round(bmr * f);
    setResult(`আপনার দৈনিক প্রয়োজন: ${total} ক্যালরি`);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-center text-xl font-bold text-primary">দৈনিক ক্যালরি চাহিদা</h2>

      <label className="mb-1 block text-sm font-medium text-foreground">বয়স:</label>
      <input
        type="number"
        inputMode="numeric"
        placeholder="যেমন: ২৫"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />

      <label className="mb-1 mt-4 block text-sm font-medium text-foreground">ওজন (কেজি):</label>
      <input
        type="number"
        inputMode="decimal"
        placeholder="যেমন: ৬৫"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />

      <label className="mb-1 mt-4 block text-sm font-medium text-foreground">কাজের ধরন:</label>
      <select
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="1.2">কম পরিশ্রম (বসে কাজ)</option>
        <option value="1.4">হালকা পরিশ্রম</option>
        <option value="1.6">মাঝারি পরিশ্রম</option>
        <option value="1.8">কঠিন পরিশ্রম</option>
        <option value="2.0">খুব কঠিন পরিশ্রম</option>
      </select>

      <button
        type="button"
        onClick={calc}
        className="mt-5 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
      >
        হিসাব করুন
      </button>

      {result && (
        <div className="mt-5 rounded-md bg-secondary p-4 text-center text-sm font-semibold text-primary">
          {result}
        </div>
      )}
    </div>
  );
}

function DietPlanner() {
  const [ft, setFt] = useState("");
  const [inch, setInch] = useState("");
  const [wt, setWt] = useState("");
  const [goal, setGoal] = useState<"lose" | "gain">("lose");
  const [plan, setPlan] = useState<null | {
    target: number;
    protein: number;
    fat: number;
    carbs: number;
    meals: { time: string; food: string }[];
    error?: string;
  }>(null);

  const generate = () => {
    const w = parseFloat(wt);
    if (!(w > 0)) {
      setPlan({ target: 0, protein: 0, fat: 0, carbs: 0, meals: [], error: "অনুগ্রহ করে বর্তমান ওজন লিখুন।" });
      return;
    }
    const bmr = 10 * w + 6.25 * 165 - 150;
    const target = Math.round(goal === "lose" ? bmr - 500 : bmr + 500);
    const protein = Math.round((target * 0.25) / 4);
    const fat = Math.round((target * 0.25) / 9);
    const carbs = Math.round((target * 0.5) / 4);
    const meals = goal === "lose"
      ? [
          { time: "সকাল", food: "লাল আটার রুটি ২টা + সবজি ১ বাটি + ডিম ১টা" },
          { time: "দুপুর", food: "ভাত ১ কাপ + মাছ/মুরগি ১ টুকরা + শাক ১ বাটি" },
          { time: "বিকেল", food: "টক দই বা শসা" },
          { time: "রাত", food: "স্যুপ বা গ্রিলড চিকেন" },
        ]
      : [
          { time: "সকাল", food: "ওটস/চিঁড়া দই-কলা + বাদাম" },
          { time: "দুপুর", food: "ভাত ১.৫ কাপ + মাছ/মাংস ১ টুকরা + ডাল ১ বাটি" },
          { time: "বিকেল", food: "মুড়ি-ছোলা ও কলা" },
          { time: "রাত", food: "ভাত ১ কাপ + সবজি ও মাছ" },
        ];
    setPlan({ target, protein, fat, carbs, meals });
  };

  const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-center text-xl font-bold text-primary">ক্যালরি ও ডায়েট প্ল্যানার</h2>

      <label className="mb-1 block text-sm font-medium text-foreground">উচ্চতা:</label>
      <div className="flex gap-3">
        <input type="number" placeholder="ফুট" value={ft} onChange={(e) => setFt(e.target.value)} className={inputCls} />
        <input type="number" placeholder="ইঞ্চি" value={inch} onChange={(e) => setInch(e.target.value)} className={inputCls} />
      </div>

      <label className="mb-1 mt-4 block text-sm font-medium text-foreground">বর্তমান ওজন (কেজি):</label>
      <input type="number" placeholder="যেমন: ৬৫" value={wt} onChange={(e) => setWt(e.target.value)} className={inputCls} />

      <label className="mb-1 mt-4 block text-sm font-medium text-foreground">লক্ষ্য:</label>
      <select value={goal} onChange={(e) => setGoal(e.target.value as "lose" | "gain")} className={inputCls}>
        <option value="lose">ওজন কমানো (−৫০০ kcal)</option>
        <option value="gain">ওজন বাড়ানো (+৫০০ kcal)</option>
      </select>

      <button
        type="button"
        onClick={generate}
        className="mt-5 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
      >
        ডায়েট প্ল্যান তৈরি করুন
      </button>

      {plan && (
        <div className="mt-5 rounded-md border border-primary/30 bg-secondary/60 p-4">
          {plan.error ? (
            <div className="text-center text-sm font-semibold text-destructive">{plan.error}</div>
          ) : (
            <>
              <h3 className="text-center text-base font-bold text-primary">
                আপনার টার্গেট: {plan.target} kcal
              </h3>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-primary">
                <div className="rounded bg-card p-2">প্রোটিন<br /><span className="text-base">{plan.protein}g</span></div>
                <div className="rounded bg-card p-2">ফ্যাট<br /><span className="text-base">{plan.fat}g</span></div>
                <div className="rounded bg-card p-2">কার্ব<br /><span className="text-base">{plan.carbs}g</span></div>
              </div>
              <p className="mt-4 text-sm font-bold text-foreground">দেশি ডায়েট মেনু:</p>
              <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                {plan.meals.map((m) => (
                  <li key={m.time}>
                    <span className="font-semibold text-primary">{m.time}:</span> {m.food}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
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