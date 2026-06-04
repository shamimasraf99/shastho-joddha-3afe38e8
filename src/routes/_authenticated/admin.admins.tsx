import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAdmins, addAdminUser, removeAdminUser } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
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
  const listFn = useServerFn(listAdmins);
  const addFn = useServerFn(addAdminUser);
  const removeFn = useServerFn(removeAdminUser);

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admins-list"],
    queryFn: () => listFn(),
  });

  const [open, setOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "admin" as "admin" | "editor" | "user" });

  const addMut = useMutation({
    mutationFn: () => addFn({ data: form }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admins-list"] });
      toast.success("ইউজার যোগ হয়েছে");
      setOpen(false);
      setForm({ fullName: "", email: "", password: "", role: "admin" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: (userId: string) => removeFn({ data: { userId } }),
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
                  <TableCell className="text-right">
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
    </div>
  );
}