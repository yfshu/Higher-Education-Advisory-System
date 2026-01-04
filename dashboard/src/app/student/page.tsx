"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatDistanceToNow } from "date-fns";

import StudentLayout from "@/components/layout/StudentLayout";
import DashboardWelcome from "@/components/student/DashboardWelcome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Search,
} from "lucide-react";
import { useSavedItems } from "@/hooks/useSavedItems";
import {
  getRecommendationHistory,
  type RecommendationHistoryItem,
} from "@/lib/api/recommendations";
import { apiCall } from "@/lib/auth/apiClient";

interface SavedProgram {
  id: number;
  name: string;
  university?: {
    name: string;
  } | null;
  saved_at: string;
}

interface SavedScholarship {
  id: number;
  name: string;
  organization_name: string | null;
  saved_at: string;
}

interface ProgramWithUniversity {
  id: number;
  name: string;
  level?: string | null;
  deadline?: string | null;
  university?: {
    id?: number;
    name?: string;
    city?: string | null;
    state?: string | null;
  } | null;
}

interface LatestRecommendation {
  program_id: number;
  program_name: string;
  university_name: string;
  location: string;
  matchPercentage: number;
  deadline: string | null;
  level: string | null;
}

const deadlineFormatter = new Intl.DateTimeFormat("en-MY", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function StudentDashboardPage() {
  const {
    savedItems,
    isLoading: savedItemsLoading,
    refreshSavedItems,
  } = useSavedItems();
  const [mounted, setMounted] = useState(false);
  const [savedPrograms, setSavedPrograms] = useState<SavedProgram[]>([]);
  const [savedScholarships, setSavedScholarships] = useState<
    SavedScholarship[]
  >([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [latestRecommendations, setLatestRecommendations] = useState<
    LatestRecommendation[]
  >([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch saved items
  useEffect(() => {
    const fetchSavedItems = async () => {
      try {
        setLoadingSaved(true);
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) {
          setLoadingSaved(false);
          return;
        }

        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
        const cacheBuster = `?t=${Date.now()}`;

        // Fetch saved programs with cache-busting
        const programsResponse = await fetch(
          `${backendUrl}/api/saved-items/programs${cacheBuster}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Cache-Control": "no-cache",
            },
            cache: "no-store",
          }
        );

        if (programsResponse.ok) {
          const programsResult = await programsResponse.json();
          if (programsResult.success && programsResult.data) {
            console.log(
              `✅ Fetched ${programsResult.data.length} saved programs from API`
            );
            // Get only the first 3 for dashboard
            setSavedPrograms(programsResult.data.slice(0, 3));
          } else {
            console.warn("⚠️ Programs response missing data:", programsResult);
            setSavedPrograms([]);
          }
        } else {
          console.error(
            "❌ Failed to fetch saved programs:",
            programsResponse.status
          );
          setSavedPrograms([]);
        }

        // Fetch saved scholarships with cache-busting
        const scholarshipsResponse = await fetch(
          `${backendUrl}/api/saved-items/scholarships${cacheBuster}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Cache-Control": "no-cache",
            },
            cache: "no-store",
          }
        );

        if (scholarshipsResponse.ok) {
          const scholarshipsResult = await scholarshipsResponse.json();
          if (scholarshipsResult.success && scholarshipsResult.data) {
            console.log(
              `✅ Fetched ${scholarshipsResult.data.length} saved scholarships from API`
            );
            // Get only the first 3 for dashboard
            setSavedScholarships(scholarshipsResult.data.slice(0, 3));
          } else {
            console.warn(
              "⚠️ Scholarships response missing data:",
              scholarshipsResult
            );
            setSavedScholarships([]);
          }
        } else {
          console.error(
            "❌ Failed to fetch saved scholarships:",
            scholarshipsResponse.status
          );
          setSavedScholarships([]);
        }
      } catch (error) {
        console.error("Error fetching saved items:", error);
        setSavedPrograms([]);
        setSavedScholarships([]);
      } finally {
        setLoadingSaved(false);
      }
    };

    if (mounted) {
      fetchSavedItems();
      // Also refresh the useSavedItems hook cache
      refreshSavedItems().catch((err) =>
        console.error("Error refreshing saved items:", err)
      );
    }
  }, [mounted, refreshSavedItems]);

  // Calculate saved items count
  const savedItemsCount = useMemo(() => {
    if (!mounted || savedItemsLoading || !savedItems || savedItems.size === 0) {
      return 0;
    }
    return savedItems.size;
  }, [mounted, savedItemsLoading, savedItems]);

  // Calculate statistics
  const programsCount = useMemo(() => {
    return savedItems
      ? Array.from(savedItems.keys()).filter((key) =>
          key.startsWith("program:")
        ).length
      : 0;
  }, [savedItems]);

  const scholarshipsCount = useMemo(() => {
    return savedItems
      ? Array.from(savedItems.keys()).filter((key) =>
          key.startsWith("scholarship:")
        ).length
      : 0;
  }, [savedItems]);

  // Calculate upcoming deadlines (within 30 days)
  const upcomingDeadlinesCount = useMemo(() => {
    if (!savedPrograms || !savedScholarships) return 0;
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const programDeadlines = savedPrograms.filter((p) => {
      if (!p.saved_at) return false;
      // We need to check program deadlines, but we don't have that in the saved items
      // For now, return 0 or we could fetch program details
      return false;
    });

    const scholarshipDeadlines = savedScholarships.filter((s) => {
      // Similar issue - we'd need deadline info
      return false;
    });

    return 0; // Placeholder until we have deadline data
  }, [savedPrograms, savedScholarships]);

  // Fetch latest program recommendations
  useEffect(() => {
    const fetchLatestRecommendations = async () => {
      try {
        setLoadingRecommendations(true);
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) {
          setLoadingRecommendations(false);
          return;
        }

        // Fetch latest 3 program recommendations
        const { data, error } = await getRecommendationHistory("program", 3);

        if (error || !data || !data.data) {
          setLatestRecommendations([]);
          setLoadingRecommendations(false);
          return;
        }

        const programRecs = data.data.filter(
          (r) => r.recommendation_type === "program" && r.program_id
        );

        if (programRecs.length === 0) {
          setLatestRecommendations([]);
          setLoadingRecommendations(false);
          return;
        }

        // Fetch full program details for each recommendation
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
        const programIds = programRecs
          .map((r) => r.program_id)
          .filter((id): id is number => id !== null);

        if (programIds.length === 0) {
          setLatestRecommendations([]);
          setLoadingRecommendations(false);
          return;
        }

        // Fetch all programs to get details
        const programsResponse = await fetch(
          `${backendUrl}/api/programs?all=true`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!programsResponse.ok) {
          setLatestRecommendations([]);
          setLoadingRecommendations(false);
          return;
        }

        const programsData = await programsResponse.json();
        const allPrograms: ProgramWithUniversity[] = programsData.data || [];
        const programMap = new Map<number, ProgramWithUniversity>(
          allPrograms.map((p) => [p.id, p])
        );

        // Map recommendations to program details
        const recommendations: LatestRecommendation[] = programRecs
          .map((rec) => {
            const program = programMap.get(rec.program_id!);
            if (!program) return null;

            const matchScore = rec.final_score || rec.ml_confidence_score || 0;
            const location =
              program.university?.state && program.university?.city
                ? `${program.university.city}, ${program.university.state}`
                : program.university?.state ||
                  program.university?.city ||
                  "Location not specified";

            return {
              program_id: rec.program_id!,
              program_name:
                rec.program_name ||
                program.name ||
                `Program #${rec.program_id}`,
              university_name:
                program.university?.name || "University not specified",
              location: location,
              matchPercentage: Math.round(matchScore * 100),
              deadline: program.deadline || null,
              level: program.level || null,
            };
          })
          .filter((r): r is LatestRecommendation => r !== null)
          .slice(0, 3); // Ensure only top 3

        setLatestRecommendations(recommendations);
      } catch (err: any) {
        console.error("Error fetching latest recommendations:", err);
        setLatestRecommendations([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    if (mounted) {
      fetchLatestRecommendations();
    }
  }, [mounted]);

  return (
    <StudentLayout title="Dashboard">
      <div className="space-y-6">
        <DashboardWelcome />

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20 dark:border-slate-700/20 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Saved
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {savedItemsCount}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">All items</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-200/30 dark:border-purple-700/30">
                <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20 dark:border-slate-700/20 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Programs Saved
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {programsCount}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Saved programs
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-200/30 dark:border-blue-700/30">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20 dark:border-slate-700/20 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Scholarships Saved
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {scholarshipsCount}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Saved scholarships
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-200/30 dark:border-yellow-700/30">
                <Award className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20 dark:border-slate-700/20 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Quick Access
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {savedPrograms.length + savedScholarships.length}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Recent items
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-200/30 dark:border-green-700/30">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20 dark:border-slate-700/20 shadow-lg hover:shadow-xl transition-shadow">
            <div className="border-b border-white/20 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  Latest Recommendations
                </h3>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Link href="/student/recommendations">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="p-6">
              {loadingRecommendations ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-muted-foreground">
                      Loading recommendations...
                    </p>
                  </div>
                </div>
              ) : latestRecommendations.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No recommendations yet
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/student/recommendations">
                      Get Recommendations
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {latestRecommendations.map((program) => (
                    <div
                      key={program.program_id}
                      className="flex items-start gap-4 rounded-lg border border-white/20 dark:border-slate-700/20 bg-white/40 dark:bg-slate-800/40 p-4 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="font-medium text-foreground">
                            {program.program_name}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {program.matchPercentage}% match
                          </Badge>
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">
                          {program.university_name}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {program.location}
                          </span>
                          {program.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Deadline:{" "}
                              {deadlineFormatter.format(
                                new Date(program.deadline)
                              )}
                            </span>
                          )}
                          {program.level && (
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {program.level}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      >
                        <Link href={`/student/program/${program.program_id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20 dark:border-slate-700/20 shadow-lg hover:shadow-xl transition-shadow">
            <div className="border-b border-white/20 dark:border-slate-700/20 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Saved Items</h3>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Link href="/student/saved">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="p-6">
              {loadingSaved ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-muted-foreground">
                      Loading saved items...
                    </p>
                  </div>
                </div>
              ) : savedPrograms.length === 0 &&
                savedScholarships.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No saved items yet
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/student/search">Start Exploring</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedPrograms.map((program) => (
                    <div
                      key={`program-${program.id}`}
                      className="flex items-center gap-4 rounded-lg border border-white/20 dark:border-slate-700/20 bg-white/40 dark:bg-slate-800/40 p-4 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {program.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {program.university?.name ||
                            "University not specified"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Saved{" "}
                          {program.saved_at
                            ? formatDistanceToNow(new Date(program.saved_at), {
                                addSuffix: true,
                              })
                            : "recently"}
                        </p>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Link href={`/student/course/${program.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                  {savedScholarships.map((scholarship) => (
                    <div
                      key={`scholarship-${scholarship.id}`}
                      className="flex items-center gap-4 rounded-lg border border-white/20 dark:border-slate-700/20 bg-white/40 dark:bg-slate-800/40 p-4 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {scholarship.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {scholarship.organization_name ||
                            "Organization not specified"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Saved{" "}
                          {scholarship.saved_at
                            ? formatDistanceToNow(
                                new Date(scholarship.saved_at),
                                { addSuffix: true }
                              )
                            : "recently"}
                        </p>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        <Link href={`/student/scholarship/${scholarship.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>
    </StudentLayout>
  );
}
