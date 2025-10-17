"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const adminName = "Administrator";

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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <aside className="relative w-64 border-r border-white/10 bg-white/10 shadow-2xl backdrop-blur-2xl">
        <div className="p-6">
          <div className="mb-8 flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="font-semibold text-gray-800">BackToSchool Admin</span>
          </div>

          <nav className="space-y-2">
            {navigationItems.map(({ href, icon, label }) =>
              renderNavItem(href, icon, label)
            )}
          </nav>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white shadow-lg">
              {adminName.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-gray-800">{adminName}</div>
              <div className="text-sm text-gray-600">Administrator</div>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={(event) => {
              event.preventDefault();
            }}
            className="w-full justify-start text-gray-700 hover:bg-white/20 hover:text-gray-800 hover:backdrop-blur-sm hover:shadow-md"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-white/10 bg-white/5 px-8 py-6 shadow-lg backdrop-blur-2xl">
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        </header>

        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
