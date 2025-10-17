"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

  const userName = "Ahmad";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="backdrop-blur-2xl bg-white/10 border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-800">
                BackToSchool
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1 bg-white/20 backdrop-blur-lg rounded-full px-2 py-1 border border-white/10 shadow-xl">
              {navigationItems.map((item) =>
                renderNavLink(item.href, item.icon, item.label, "desktop")
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-blue-200">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={userName} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 backdrop-blur-2xl bg-white/15 border-white/10 shadow-2xl"
                align="end"
              >
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder-avatar.jpg"
                      alt={userName}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                      {userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-gray-500">Student</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/student/profile"
                    className="flex items-center gap-2 w-full"
                  >
                    <User className="w-4 h-4" />
                    Profile &amp; Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                  }}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      <div className="flex-1">
        {title && (
          <div className="max-w-7xl mx-auto px-6 py-6 backdrop-blur-xl bg-white/5">
            <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-6 pb-8">{children}</div>
      </div>
    </div>
  );
}
