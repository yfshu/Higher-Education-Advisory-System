"use client";
import React from "react";
import { Button } from "../ui/button";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Users,
  FileText,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";
import Link from 'next/link';


interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const navigationItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/programs", icon: BookOpen, label: "Program Management" },
    {
      href: "/admin/scholarships",
      icon: Award,
      label: "Scholarship Management",
    },
    { href: "/admin/users", icon: Users, label: "User Management" },
    { href: "/admin/content", icon: FileText, label: "Content Management" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Sidebar */}
      <div className="w-64 backdrop-blur-2xl bg-white/10 border-r border-white/10 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <span className="font-semibold text-gray-800">
              BackToSchool Admin
            </span>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${"bg-blue-500/15 text-blue-700 backdrop-blur-sm border border-blue-200/20 shadow-lg"}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
              {/* {user?.name?.charAt(0) || 'A'} */}
            </div>
            <div>
              <div className="font-medium text-gray-800">Usernme</div>
              <div className="text-sm text-gray-600">Administrator</div>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
            }}
            className="w-full justify-start text-gray-700 hover:text-gray-800 hover:bg-white/20 hover:backdrop-blur-sm hover:shadow-md"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="backdrop-blur-2xl bg-white/5 border-b border-white/10 shadow-lg">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </div>
    </div>
  );
}
