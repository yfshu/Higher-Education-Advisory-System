"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Plus,
  Eye,
  Settings,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/layout/AdminLayout";
import { SystemAlerts } from "@/components/admin/SystemAlerts";
import {
  getDashboardMetrics,
  getRecentUsers,
  getRecentPrograms,
  type DashboardMetrics,
  type RecentUser,
  type RecentProgram,
} from "@/lib/api/admin";
import { useUser } from "@/contexts/UserContext";
import { formatDistanceToNow } from "date-fns";

// Safe date formatting helper to prevent hydration mismatches
function formatDateSafely(dateString: string | null | undefined): string {
  if (!dateString) return "Unknown";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown";
    // Only format on client-side to prevent hydration mismatch
    if (typeof window !== "undefined") {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return "Recently";
  } catch {
    return "Unknown";
  }
}

// Safe string access helper
function getInitialChar(str: string | null | undefined): string {
  if (!str || typeof str !== "string" || str.length === 0) return "?";
  return str.charAt(0).toUpperCase();
}

export default function AdminDashboard() {
  const { userData } = useUser();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentPrograms, setRecentPrograms] = useState<RecentProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Prevent hydration mismatch by only rendering date-dependent content after mount
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!userData?.accessToken) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [metricsData, usersData, programsData] = await Promise.all([
          getDashboardMetrics(userData.accessToken),
          getRecentUsers(userData.accessToken, 4),
          getRecentPrograms(userData.accessToken, 4),
        ]);

        setMetrics(metricsData ?? null);
        setRecentUsers(Array.isArray(usersData) ? usersData : []);
        setRecentPrograms(Array.isArray(programsData) ? programsData : []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userData?.accessToken]);

  if (loading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <p className="text-red-600 mb-2">Error loading dashboard</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Section */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-slate-500/20 to-blue-500/20 border border-white/20 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
            BackToSchool Admin Dashboard
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Monitor and manage the Malaysian Higher Education Advisory System.
            Track student registrations, university programs, and recommendation
            analytics across 150+ Malaysian institutions.
          </p>
          <div className="flex gap-2 sm:gap-4 flex-wrap">
            <Button
              asChild
              className="bg-slate-700 hover:bg-slate-800 text-white text-sm sm:text-base"
            >
              <Link href="/admin/programs">
                <Plus className="w-4 h-4 mr-2" />
                Add New Program
              </Link>
            </Button>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
            >
              <Link href="/admin/scholarships">
                <Award className="w-4 h-4 mr-2" />
                Add Scholarship
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="backdrop-blur-sm bg-white/50 text-sm sm:text-base"
            >
              <Link href="/admin/users">
                <Eye className="w-4 h-4 mr-2" />
                View Users
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Malaysian Students
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {(metrics?.students?.total ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-xs sm:text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />+
              {metrics?.students.recent || 0} this week
            </div>
          </Card>

          <Card className="p-4 sm:p-6 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Malaysian Programs
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {(metrics?.programs?.total ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-xs sm:text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Active
            </div>
          </Card>

          <Card className="p-4 sm:p-6 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Scholarship Programs
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {(metrics?.scholarships?.total ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-xs sm:text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Active
            </div>
          </Card>

          <Card className="p-4 sm:p-6 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Recommendations Made
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {(metrics?.recommendations?.total ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-xs sm:text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Total
            </div>
          </Card>

          <Card className="p-4 sm:p-6 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  System Alerts
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {metrics?.alerts.open || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 mt-2">
              {metrics?.alerts.open === 0
                ? "All clear"
                : `${metrics?.alerts.open} requires attention`}
            </p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Users */}
          <Card className="backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg">
            <div className="p-4 sm:p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  Recent User Registrations
                </h3>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <Link href="/admin/users">View All</Link>
                </Button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {!recentUsers || recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent users
                </p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm border border-white/20"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base flex-shrink-0">
                        {getInitialChar(user?.email)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                          {user?.email ?? "Unknown User"}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Joined{" "}
                          {hasMounted
                            ? formatDateSafely(user?.joined)
                            : "Recently"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          user?.status === "Active" ? "default" : "secondary"
                        }
                        className="text-xs flex-shrink-0"
                      >
                        {user?.status ?? "Unknown"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Recent Programs */}
          <Card className="backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg">
            <div className="p-4 sm:p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  Recently Added Programs
                </h3>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <Link href="/admin/programs">Manage Programs</Link>
                </Button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {!recentPrograms || recentPrograms.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent programs
                </p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {recentPrograms.map((program) => (
                    <div
                      key={program.id}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm border border-white/20"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm sm:text-base truncate">
                          {program?.title ?? "Unknown Program"}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {program?.university ?? "Unknown University"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added{" "}
                          {hasMounted
                            ? formatDateSafely(program?.added)
                            : "Recently"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-foreground text-sm sm:text-base">
                          {program?.applications ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          applications
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* System Alerts */}
        <SystemAlerts />

        {/* Quick Actions */}
        <Card className="backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-white/20 shadow-lg p-4 sm:p-6">
          <h3 className="font-semibold text-foreground mb-4 text-sm sm:text-base">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start backdrop-blur-sm bg-white/50 text-sm sm:text-base"
            >
              <Link href="/admin/programs">
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Programs
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start backdrop-blur-sm bg-white/50 text-sm sm:text-base"
            >
              <Link href="/admin/scholarships">
                <Award className="w-4 h-4 mr-2" />
                Manage Scholarships
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start backdrop-blur-sm bg-white/50 text-sm sm:text-base"
            >
              <Link href="/admin/users">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start backdrop-blur-sm bg-white/50 text-sm sm:text-base"
            >
              <Link href="/admin/content">
                <Settings className="w-4 h-4 mr-2" />
                Content Settings
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start backdrop-blur-sm bg-white/50 text-sm sm:text-base"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics Report
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
