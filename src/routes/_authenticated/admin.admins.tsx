import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  addAdminFromBackend,
  listAdminsFromBackend,
  removeAdminFromBackend,
  resetAdminPasswordFromBackend,
} from "@/lib/admin-edge-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/admins")({
  component: AdminsPage,
});

function AdminsPage() {
  const qc = useQueryClient();

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admins-list"],
    queryFn: listAdminsFromBackend,
  });

  const [open, setOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "admin" as "admin" | "editor" | "user" });

  // Change own password
  const [ownPw, setOwnPw] = useState({ next: "", confirm: "" });
  const [ownPwLoading, setOwnPwLoading] = useState(false);

  // Reset other user's password
  const [resetUser, setResetUser] = useState<{ id: string; email: string } | null>(null);
  const [resetPw, setResetPw] = useState("");

  const handleOwnPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ownPw.next !== ownPw.confirm) { toast.error("পাসওয়ার্ড মিলছে না"); return; }
    if (ownPw.next.length < 8) { toast.error("কমপক্ষে ৮ অক্ষর হতে হবে"); return; }
    setOwnPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: ownPw.next });
      if (error) throw error;
      toast.success("আপনার পাসওয়ার্ড পরিবর্তন হয়েছে");
      setOwnPw({ next: "", confirm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ত্রুটি ঘটেছে");
    } finally {
      setOwnPwLoading(false);
    }
  };

  const resetMut = useMutation({
    mutationFn: () => resetAdminPasswordFromBackend(resetUser!.id, resetPw),
    onSuccess: () => {
      toast.success("পাসওয়ার্ড রিসেট হয়েছে");
      setResetUser(null);
      setResetPw("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addMut = useMutation({
    mutationFn: () => addAdminFromBackend(form),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["admins-list"] });
      if (result.passwordWarning) {
        toast.warning(`ইউজার/ভূমিকা যোগ হয়েছে, কিন্তু পাসওয়ার্ড আপডেট হয়নি: ${result.passwordWarning}`);
      } else {
        toast.success("ইউজার যোগ হয়েছে");
      }
      setOpen(false);
      setForm({ fullName: "", email: "", password: "", role: "admin" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: removeAdminFromBackend,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admins-list"] });
      toast.success("সরানো হয়েছে");
      setRemovingId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">অ্যাডমিন ম্যানেজ</h2>
          <p className="text-sm text-muted-foreground">ইউজার এবং তাদের ভূমিকা পরিচালনা করুন</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> নতুন ইউজার</Button>
      </div>

      <div className="border rounded-xl bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">আমার পাসওয়ার্ড পরিবর্তন</h3>
        </div>
        <form onSubmit={handleOwnPasswordChange} className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>নতুন পাসওয়ার্ড</Label>
            <Input type="password" minLength={8} required value={ownPw.next} onChange={(e) => setOwnPw({ ...ownPw, next: e.target.value })} />
          </div>
          <div>
            <Label>পুনরায় টাইপ করুন</Label>
            <Input type="password" minLength={8} required value={ownPw.confirm} onChange={(e) => setOwnPw({ ...ownPw, confirm: e.target.value })} />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={ownPwLoading} className="w-full">
              {ownPwLoading ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন"}
            </Button>
          </div>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">কমপক্ষে ৮ অক্ষর। পরিবর্তনের পর পরবর্তী লগইনে নতুন পাসওয়ার্ড ব্যবহার করুন।</p>
      </div>

      <div className="border rounded-xl bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ইমেইল</TableHead>
              <TableHead>ভূমিকা</TableHead>
              <TableHead>যোগ হয়েছে</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow>
            ) : admins.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">কেউ নেই</TableCell></TableRow>
            ) : (
              admins.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.email || a.user_id}</TableCell>
                  <TableCell><span className="px-2 py-1 rounded bg-muted text-xs">{a.role}</span></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleDateString("bn-BD")}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" title="পাসওয়ার্ড রিসেট" onClick={() => { setResetUser({ id: a.user_id, email: a.email || a.user_id }); setResetPw(""); }}>
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setRemovingId(a.user_id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>নতুন ইউজার যোগ</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); addMut.mutate(); }} className="space-y-4">
            <div><Label>পূর্ণ নাম</Label><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><Label>ইমেইল</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)</Label><Input type="password" minLength={8} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div>
              <Label>ভূমিকা</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as typeof form.role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
              <Button type="submit" disabled={addMut.isPending}>{addMut.isPending ? "যোগ হচ্ছে..." : "যোগ করুন"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={removingId !== null} onOpenChange={(v) => !v && setRemovingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ইউজার মুছবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই ইউজার এবং তার সমস্ত ভূমিকা মুছে যাবে।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={() => removingId && removeMut.mutate(removingId)}>মুছুন</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={resetUser !== null} onOpenChange={(v) => !v && setResetUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>পাসওয়ার্ড রিসেট</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); resetMut.mutate(); }} className="space-y-4">
            <p className="text-sm text-muted-foreground">ইউজার: <span className="font-medium text-foreground">{resetUser?.email}</span></p>
            <div>
              <Label>নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)</Label>
              <Input type="password" minLength={8} required value={resetPw} onChange={(e) => setResetPw(e.target.value)} autoFocus />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetUser(null)}>বাতিল</Button>
              <Button type="submit" disabled={resetMut.isPending}>{resetMut.isPending ? "রিসেট হচ্ছে..." : "রিসেট করুন"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}