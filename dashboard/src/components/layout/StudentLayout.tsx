"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Search,
  BookOpen,
  Bookmark,
  HelpCircle,
  LogOut,
  GraduationCap,
  User,
  Award,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabaseClient";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useUser } from "@/contexts/UserContext";
import { getUserRole } from "@/lib/auth/role";
import { toast } from "sonner";
import Particles from "@/components/Particles";

interface StudentLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navigationItems = [
  { href: "/student", icon: Home, label: "Dashboard" },
  { href: "/student/recommendations", icon: BookOpen, label: "Recommendations" },
  { href: "/student/search", icon: Search, label: "Search Programs" },
  { href: "/student/scholarships", icon: Award, label: "Scholarships" },
  { href: "/student/saved", icon: Bookmark, label: "Saved Items" },
  { href: "/student/help", icon: HelpCircle, label: "Help" },
];

export default function StudentLayout({ children, title }: StudentLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userData, logout } = useUser();
  const [mounted, setMounted] = useState(false);

  // Fix hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const ensureStudent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      // Use role helper to get role from app_metadata
      const role = getUserRole(user);
      
      // Allow admin users to view program detail pages
      const isProgramDetailPage = pathname?.startsWith('/student/program/') || 
                                  pathname?.startsWith('/student/course/');
      
      if (role === "admin" && !isProgramDetailPage) {
        // Admin users should not access student pages (except program details) - redirect to admin
        router.replace("/admin");
      }
    };
    void ensureStudent();
  }, [router, pathname]);

  const userName = userData?.user?.fullName || "Student";
  const userEmail = userData?.user?.email || "";
  const avatarUrl = userData?.profile?.avatarUrl;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  // Debug: Log avatar URL in navbar
  useEffect(() => {
    if (avatarUrl) {
      console.log("🖼️ Navbar avatar URL:", avatarUrl);
    } else {
      console.log("⚠️ No avatar URL in navbar");
    }
  }, [avatarUrl]);

  const handleLogout = async () => {
    try {
      // Clear Supabase session
      await supabase.auth.signOut();
      
      // Clear user context and localStorage
      logout();
      
      // Preserve "Remember Me" email before clearing
      const rememberEmail = localStorage.getItem("hea.remember.email");
      
      // Clear all cached data
      localStorage.clear();
      
      // Restore "Remember Me" email if it existed
      if (rememberEmail) {
        localStorage.setItem("hea.remember.email", rememberEmail);
      }
      
      sessionStorage.clear();
      
      // Clear cache storage if available
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Show success message
      toast.success("Logged out successfully!");
      
      // Small delay to show toast before redirect
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.warn("Logout error", err);
      toast.error("Error during logout. Please try again.");
    } finally {
      // Force redirect to homepage
      window.location.href = "/";
    }
  };

  const renderNavLink = (
    href: string,
    Icon: LucideIcon,
    label: string,
    size: "desktop" | "mobile"
  ) => {
    const isActive =
      pathname === href || (href !== "/student" && pathname?.startsWith(href));

    const baseClasses =
      "flex items-center gap-2 rounded-full transition-all duration-200";
    const sharedHover =
      "text-gray-700 hover:bg-white/30 hover:text-blue-600 hover:backdrop-blur-sm hover:shadow-md";

    const sizing =
      size === "desktop" ? "px-4 py-2" : "px-3 py-2 whitespace-nowrap";

    return (
      <Link
        key={href}
        href={href}
        className={`${baseClasses} ${sizing} ${
          isActive
            ? "bg-blue-600/90 text-white shadow-lg backdrop-blur-sm"
            : `bg-white/20 ${sharedHover}`
        }`}
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen text-foreground bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <nav className="backdrop-blur-2xl bg-white/10 border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-semibold text-foreground">Back To School</span>
            </div>

            <div className="hidden md:flex items-center gap-1 bg-white/20 backdrop-blur-lg rounded-full px-2 py-1 border border-white/10 shadow-xl">
              {navigationItems.map((item) =>
                renderNavLink(item.href, item.icon, item.label, "desktop")
              )}
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              {mounted && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar 
                        className="h-10 w-10 border-2 border-blue-200"
                        key={avatarUrl || "no-avatar"}
                      >
                        <AvatarImage 
                          src={avatarUrl || undefined} 
                          alt={userName}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 backdrop-blur-2xl bg-white/15 border-white/10 shadow-2xl"
                    align="end"
                  >
                    <div className="flex items-center gap-2 p-2">
                      <Avatar 
                        className="h-8 w-8"
                        key={avatarUrl || "no-avatar"}
                      >
                        <AvatarImage 
                          src={avatarUrl || undefined} 
                          alt={userName}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-xs text-muted-foreground">{userEmail}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/student/profile" className="flex items-center gap-2 w-full">
                        <User className="w-4 h-4" />
                        Profile &amp; Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        handleLogout();
                      }}
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="md:hidden mt-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {navigationItems.map((item) =>
                renderNavLink(item.href, item.icon, item.label, "mobile")
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 relative">
        {/* Particles Background Effect - Only in main content area */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Particles
            particleCount={300}
            particleSpread={15}
            speed={0.15}
            particleColors={["#d35cff","#1100ff","#ffffff","#fbff14"]}
            moveParticlesOnHover={false}
            particleHoverFactor={1}
            alphaParticles
            particleBaseSize={100}
            sizeRandomness={1}
            cameraDistance={17}
            disableRotation={false}
            className=""
          />
        </div>
        <div className="relative z-10">
          {title && (
            <div className="max-w-7xl mx-auto px-6 pt-6 pb-2 backdrop-blur-xl bg-white/5 dark:bg-slate-900/30">
              <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
            </div>
          )}
          <div className="max-w-7xl mx-auto px-6 pt-2 pb-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
