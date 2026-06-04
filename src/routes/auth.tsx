import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { hasAnyAdmin, setupFirstAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/admin",
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const setupFn = useServerFn(setupFirstAdmin);
  const hasAdminFn = useServerFn(hasAnyAdmin);

  const { data: adminStatus, refetch } = useQuery({
    queryKey: ["has-any-admin"],
    queryFn: () => hasAdminFn(),
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: search.redirect, replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: search.redirect, replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, search.redirect]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const isSetup = adminStatus && !adminStatus.exists;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSetup) {
        await setupFn({ data: { email, password, fullName } });
        toast.success("Admin তৈরি হয়েছে! এখন লগইন করুন।");
        await refetch();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("লগইন সফল");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-sm p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">{isSetup ? "প্রথম Admin তৈরি করুন" : "Admin লগইন"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSetup ? "এই স্টেপটি একবারই দেখাবে।" : "স্বাস্থ্যপিডিয়া অ্যাডমিন প্যানেল"}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSetup && (
            <div>
              <Label htmlFor="name">পূর্ণ নাম</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={1} maxLength={120} />
            </div>
          )}
          <div>
            <Label htmlFor="email">ইমেইল</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">পাসওয়ার্ড</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "অপেক্ষা করুন..." : isSetup ? "Admin তৈরি করুন" : "লগইন"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <Link to="/" className="text-muted-foreground hover:underline">← হোমে ফিরুন</Link>
        </div>
      </div>
    </div>
  );
}