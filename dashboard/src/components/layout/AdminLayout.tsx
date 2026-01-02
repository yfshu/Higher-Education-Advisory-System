"use client";

import React, { useEffect, useState } from "react";
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
  Menu,
  X,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { getUserRole } from "@/lib/auth/role";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navigationItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/universities", icon: Building2, label: "University Management" },
  { href: "/admin/programs", icon: BookOpen, label: "Program Management" },
  { href: "/admin/scholarships", icon: Award, label: "Scholarship Management" },
  { href: "/admin/content", icon: FileText, label: "Content Management" },
  { href: "/admin/users", icon: Users, label: "User Management" },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("Administrator");

  useEffect(() => {
    const ensureAdmin = async () => {
      console.log("🔍 [AdminLayout Client] Checking admin access...");
      
      // Wait a bit to ensure server-side check has completed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("❌ [AdminLayout Client] Error getting user:", error);
        router.replace("/auth/login");
        return;
      }

      if (!user) {
        console.log("❌ [AdminLayout Client] No user found, redirecting to login");
        router.replace("/auth/login");
        return;
      }

      console.log("🔍 [AdminLayout Client] User found:", {
        userId: user.id,
        email: user.email,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
      });

      // Set admin name from email
      if (user.email) {
        setAdminName(user.email.split('@')[0] || "Administrator");
      }

      // Use role helper to get role from app_metadata
      const role = getUserRole(user);
      console.log("🔍 [AdminLayout Client] Detected role:", role);

      if (role !== "admin") {
        console.log(
          "❌ [AdminLayout Client] Non-admin user detected, redirecting to /student"
        );
        // Non-admin users should not access admin pages - redirect to student
        router.replace("/student");
      } else {
        console.log("✅ [AdminLayout Client] Admin access granted");
      }
    };
    void ensureAdmin();
  }, [router]);

  const renderNavItem = (href: string, Icon: LucideIcon, label: string) => {
    const isActive = pathname === href || (href !== "/admin" && pathname?.startsWith(href));

    return (
      <Link
        key={href}
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
          isActive
            ? "bg-blue-500/20 text-blue-700 dark:text-blue-400 backdrop-blur-sm border border-blue-200/40 dark:border-blue-500/40 shadow-lg"
            : "text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen text-foreground bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-black overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 h-screen flex flex-col border-r border-white/10 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-2xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header - Fixed */}
        <div className="p-6 border-b border-white/10 dark:border-slate-800/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-foreground">
                BackToSchool Admin
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Section - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {navigationItems.map(({ href, icon, label }) =>
            renderNavItem(href, icon, label)
          )}
        </nav>

        {/* Sidebar Footer - Fixed at Bottom */}
        <div className="border-t border-white/10 dark:border-slate-800/50 bg-white/5 dark:bg-slate-900/40 p-6 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white shadow-lg flex-shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">{adminName}</div>
              <div className="text-sm text-muted-foreground">Administrator</div>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={async () => {
              try {
                // Clear Supabase session
                await supabase.auth.signOut();
                
                // Clear user context
                await logout();
                
                // Show success message
                toast.success("Logged out successfully!");
                
                // Small delay to show toast before redirect
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Redirect to homepage
                router.push("/");
              } catch (err) {
                console.error("Logout error", err);
                toast.error("Error during logout. Please try again.");
              }
            }}
            className="w-full justify-start text-muted-foreground hover:bg-white/20 dark:hover:bg-slate-800/50 hover:text-foreground hover:backdrop-blur-sm hover:shadow-md"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden w-full lg:w-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/10 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 px-4 sm:px-6 lg:px-8 py-4 shadow-lg backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{title || "Admin Dashboard"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
