import { createFileRoute, Outlet, Link, useRouter, useRouterState, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Stethoscope,
  Building2,
  FlaskConical,
  Video,
  Mic,
  ShieldAlert,
  HelpCircle,
  Droplet,
  Megaphone,
  Search,
  Settings as SettingsIcon,
  Users,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ location }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth", search: { redirect: location.href } });
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw redirect({ to: "/", search: { redirect: location.href } });
  },
  component: AdminLayout,
});

const items: { url: string; title: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { url: "/admin", title: "ড্যাশবোর্ড", icon: LayoutDashboard, exact: true },
  { url: "/admin/news", title: "স্বাস্থ্য সংবাদ", icon: FileText },
  { url: "/admin/encyclopedia", title: "স্বাস্থ্যকোষ (Encyclopedia)", icon: FileText },
  { url: "/admin/categories", title: "ক্যাটাগরি", icon: FolderTree },
  { url: "/admin/doctors", title: "ডাক্তার", icon: Stethoscope },
  { url: "/admin/hospitals", title: "হাসপাতাল", icon: Building2 },
  { url: "/admin/labs", title: "ল্যাব", icon: FlaskConical },
  { url: "/admin/videos", title: "ভিডিও", icon: Video },
  { url: "/admin/podcasts", title: "পডকাস্ট", icon: Mic },
  { url: "/admin/mythbusters", title: "মিথবাস্টার", icon: ShieldAlert },
  { url: "/admin/questions", title: "Q&A", icon: HelpCircle },
  { url: "/admin/blood-donors", title: "রক্তদান (Roktodan)", icon: Droplet },
  { url: "/admin/advertisements", title: "বিজ্ঞাপন", icon: Megaphone },
  { url: "/admin/seo", title: "SEO", icon: Search },
  { url: "/admin/settings", title: "সাইট সেটিংস", icon: SettingsIcon },
  { url: "/admin/pages", title: "পেজ (About/Privacy/Terms)", icon: FileText },
  { url: "/admin/admins", title: "অ্যাডমিন ম্যানেজ", icon: Users },
];

function AdminLayout() {
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.navigate({ to: "/auth", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  const isActive = (url: string, exact?: boolean) =>
    exact ? path === url : path === url || path.startsWith(url + "/");

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("সাইন আউট হয়েছে");
    router.navigate({ to: "/auth", replace: true });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/20">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>অ্যাডমিন প্যানেল</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((it) => (
                    <SidebarMenuItem key={it.url}>
                      <SidebarMenuButton asChild isActive={isActive(it.url, it.exact)}>
                        <Link to={it.url}>
                          <it.icon className="h-4 w-4" />
                          <span>{it.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="ghost" size="sm" onClick={signOut} className="justify-start">
              <LogOut className="h-4 w-4 mr-2" /> সাইন আউট
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b bg-background flex items-center px-4 gap-3 sticky top-0 z-10">
            <SidebarTrigger />
            <h1 className="font-semibold">স্বাস্থ্যপিডিয়া Admin</h1>
            <div className="ml-auto">
              <Link to="/" className="text-sm text-muted-foreground hover:underline">সাইট দেখুন →</Link>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}