"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Zap, History, Settings, LogOut, Menu, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import CheckoutButton from "@/components/checkout-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setProfile(profileData);
      setCheckingAuth(false);
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navItems = [
    { href: "/grade", label: "Grade a Post", icon: Zap },
    { href: "/dashboard", label: "My Grades", icon: History },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-[240px] bg-[#111111] border-r border-[#2a2a2a] flex flex-col transition-transform",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6">
          <Link href="/" className="text-xl font-bold text-[#6366f1]">
            PostScore
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-[#6366f1]/10 text-[#6366f1]"
                  : "text-zinc-400 hover:text-white hover:bg-[#1a1a1a]"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2a2a2a]">
          {profile && (
            <div className="mb-4">
              {profile.subscription_status === "active" ? (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Pro Plan
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>Free Plan</span>
                    <span>
                      {profile.grades_used_this_month}/3 grades used
                    </span>
                  </div>
                  <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6366f1] rounded-full transition-all"
                      style={{
                        width: `${(profile.grades_used_this_month / 3) * 100}%`,
                      }}
                    />
                  </div>
                  <CheckoutButton className="text-sm text-[#6366f1] hover:underline text-left">
                    Upgrade to Pro →
                  </CheckoutButton>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 lg:p-8 mt-14 lg:mt-0">
        {children}
      </main>
    </div>
  );
}