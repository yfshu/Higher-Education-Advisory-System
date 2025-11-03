"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Users,
  FileText,
  LogOut,
  GraduationCap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navigationItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/programs", icon: BookOpen, label: "Program Management" },
  { href: "/admin/scholarships", icon: Award, label: "Scholarship Management" },
  { href: "/admin/users", icon: Users, label: "User Management" },
  { href: "/admin/content", icon: FileText, label: "Content Management" },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const adminName = "Administrator";

  useEffect(() => {
    const ensureAdmin = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        router.push("/auth/login");
        return;
      }
      const { data: details } = await supabase
        .from("users_details")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      const role = details?.role ?? "student";
      if (role !== "admin") {
        router.push("/student");
      }
    };
    void ensureAdmin();
  }, [router]);

  const renderNavItem = (href: string, Icon: LucideIcon, label: string) => {
    const isActive = pathname === href;

    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
          isActive
            ? "bg-blue-500/20 text-blue-700 backdrop-blur-sm border border-blue-200/40 shadow-lg"
            : "text-gray-700 hover:bg-white/20 hover:text-blue-600 hover:shadow-md"
        }`}
      >
        <Icon className="h-5 w-5" />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen text-foreground bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <aside className="relative w-64 border-r border-white/10 dark:border-slate-800/50 bg-white/10 dark:bg-slate-900/30 shadow-2xl backdrop-blur-2xl">
        <div className="p-6">
          <div className="mb-8 flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="font-semibold text-foreground">BackToSchool Admin</span>
          </div>

          <nav className="space-y-2">
            {navigationItems.map(({ href, icon, label }) =>
              renderNavItem(href, icon, label)
            )}
          </nav>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 dark:border-slate-800/50 bg-white/5 dark:bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white shadow-lg">
              {adminName.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-foreground">{adminName}</div>
              <div className="text-sm text-muted-foreground">Administrator</div>
            </div>
          </div>
          <div className="mb-3">
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="w-full justify-start text-muted-foreground hover:bg-white/20 hover:text-foreground hover:backdrop-blur-sm hover:shadow-md"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-white/10 dark:border-slate-800/50 bg-white/5 dark:bg-slate-900/30 px-8 py-6 shadow-lg backdrop-blur-2xl">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        </header>

        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
