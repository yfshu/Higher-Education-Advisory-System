"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Star,
  MapPin,
  Calendar,
  GraduationCap,
  Clock,
  Search,
  Bookmark,
  ExternalLink,
  Heart,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSavedItems } from "@/hooks/useSavedItems";

interface Program {
  id: number;
  name: string;
  level: "foundation" | "diploma" | "degree" | null;
  duration: string | null;
  duration_months: number | null;
  tuition_fee_amount: number | null;
  tuition_fee_period: string | null;
  currency: string | null;
  deadline: string | null;
  rating: number | null;
  review_count: number | null;
  tags: string[] | null;
  entry_requirements: Record<string, string> | string | null;
  description: string | null;
  university: {
    id: number;
    name: string;
    city: string | null;
    state: string | null;
  } | null;
}

export default function ProgramRecommendations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isItemSaved, toggleSave } = useSavedItems();

  // Fetch programs from backend
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError(null);

        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
        const response = await fetch(`${backendUrl}/api/programs`);

        if (!response.ok) {
          throw new Error(`Failed to fetch programs: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          console.log(`✅ Fetched ${result.data.length} programs from backend`);
          setPrograms(result.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("❌ Error fetching programs:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load programs"
        );
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Helper function to format tuition fee
  const formatTuitionFee = (program: Program): string => {
    if (!program.tuition_fee_amount) return "Not Available";
    const currency = program.currency || "MYR";
    const period = program.tuition_fee_period || "semester";
    return `${
      currency === "MYR" ? "RM" : currency
    } ${program.tuition_fee_amount.toLocaleString()}/${period}`;
  };

  // Helper function to format duration
  const formatDuration = (program: Program): string => {
    if (program.duration) return program.duration;
    if (program.duration_months) {
      const years = Math.floor(program.duration_months / 12);
      const months = program.duration_months % 12;
      if (years > 0 && months > 0) {
        return `${years} year${years > 1 ? "s" : ""} ${months} month${
          months > 1 ? "s" : ""
        }`;
      } else if (years > 0) {
        return `${years} year${years > 1 ? "s" : ""}`;
      } else {
        return `${months} month${months > 1 ? "s" : ""}`;
      }
    }
    return "Not Available";
  };

  // Helper function to get location string
  const getLocation = (program: Program): string => {
    if (!program.university) return "Not Available";
    const parts = [program.university.city, program.university.state].filter(
      Boolean
    );
    return parts.length > 0 ? `${parts.join(", ")}, Malaysia` : "Malaysia";
  };

  // Helper function to get entry requirements text
  const getEntryRequirements = (program: Program): string => {
    if (!program.entry_requirements) return "Not Available";
    try {
      if (typeof program.entry_requirements === "string") {
        return program.entry_requirements;
      }
      if (typeof program.entry_requirements === "object") {
        const req = program.entry_requirements;
        const parts = [];
        if (req.academic) parts.push(req.academic);
        if (req.english) parts.push(req.english);
        return parts.join(" • ") || "Not Available";
      }
      return "Not Available";
    } catch {
      return "Not Available";
    }
  };

  // Helper function to get tags array
  const getTags = (program: Program): string[] => {
    if (!program.tags) return [];
    try {
      if (Array.isArray(program.tags)) {
        return program.tags;
      }
      if (typeof program.tags === "string") {
        return JSON.parse(program.tags);
      }
      return [];
    } catch {
      return [];
    }
  };

  // Helper function to get level display name
  const getLevelDisplay = (level: string | null): string => {
    if (!level) return "N/A";
    const levelMap: Record<string, string> = {
      foundation: "Foundation",
      diploma: "Diploma",
      degree: "Bachelor",
    };
    return levelMap[level] || level.charAt(0).toUpperCase() + level.slice(1);
  };

  // Calculate match percentage (mock for now, can be replaced with real ML algorithm)
  const calculateMatchPercentage = (): number => {
    // Mock calculation - in real app, this would use ML model
    const base = 85;
    const random = Math.floor(Math.random() * 15);
    return base + random;
  };

  // Helper to normalize level for filtering (database uses 'Foundation', 'Diploma', 'Bachelor')
  const normalizeLevel = (level: string | null): string => {
    if (!level) return "";
    const lower = level.toLowerCase();
    if (lower === "foundation" || lower === "Foundation") return "foundation";
    if (lower === "diploma" || lower === "Diploma") return "diploma";
    if (lower === "degree" || lower === "bachelor" || lower === "Bachelor")
      return "degree";
    return lower;
  };

  const filteredRecommendations = programs.filter((program) => {
    // Enhanced search: search in name, university, description, and tags
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      (() => {
        const nameMatch = program.name.toLowerCase().includes(searchLower);
        const universityMatch =
          program.university?.name.toLowerCase().includes(searchLower) ?? false;
        const descriptionMatch =
          program.description?.toLowerCase().includes(searchLower) ?? false;
        const tags = getTags(program);
        const tagsMatch = tags.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );
        return nameMatch || universityMatch || descriptionMatch || tagsMatch;
      })();

    const programLevel = normalizeLevel(program.level);
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "degree" && programLevel === "degree") ||
      (selectedFilter === "diploma" && programLevel === "diploma") ||
      (selectedFilter === "foundation" && programLevel === "foundation");
    return matchesSearch && matchesFilter;
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const programsPerPage = 6;
  const totalPages = Math.ceil(
    filteredRecommendations.length / programsPerPage
  );

  // Get programs for current page
  const paginatedPrograms = filteredRecommendations.slice(
    (currentPage - 1) * programsPerPage,
    currentPage * programsPerPage
  );

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchTerm]);

  return (
    <StudentLayout title="AI Recommendations">
      <div className="space-y-6">
        {/* Header */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Personalized Recommendations
              </h2>
              <p className="text-muted-foreground">
                Based on your profile and preferences
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Our AI has analyzed your SPM/STPM results, interests, and career
            goals to find the best matching programs from Malaysian
            universities. Results are ranked by compatibility score and aligned
            with local industry demands.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search recommendations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              onClick={() => setSelectedFilter("all")}
              size="sm"
            >
              All Programs
            </Button>
            <Button
              variant={selectedFilter === "bachelor" ? "default" : "outline"}
              onClick={() => setSelectedFilter("bachelor")}
              size="sm"
            >
              Bachelors
            </Button>
            <Button
              variant={selectedFilter === "diploma" ? "default" : "outline"}
              onClick={() => setSelectedFilter("diploma")}
              size="sm"
            >
              Diploma
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="backdrop-blur-xl bg-red-50/40 border-red-200/20 shadow-lg p-6">
            <p className="text-red-700">Error: {error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading programs...</p>
          </div>
        )}

        {/* Recommendations List */}
        {!loading && !error && (
          <div className="space-y-6">
            {filteredRecommendations.length === 0 ? (
              <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-6 text-center">
                <p className="text-muted-foreground">
                  No programs found. Try adjusting your search or filters.
                </p>
              </Card>
            ) : (
              paginatedPrograms.map((program) => {
                const matchPercentage = calculateMatchPercentage();
                const tags = getTags(program);
                return (
                  <Card
                    key={program.id}
                    className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Header with Match Score */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-foreground">
                              {program.name}
                            </h3>
                            <Badge className="bg-green-500/20 text-green-700 border-green-200/30">
                              {matchPercentage}% Match
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getLevelDisplay(program.level)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <GraduationCap className="w-4 h-4" />
                              {program.university?.name || "Not Available"}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {getLocation(program)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(program)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            {program.rating?.toFixed(1) || "N/A"} •{" "}
                            {program.review_count || 0} reviews
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await toggleSave("program", program.id);
                          }}
                          className={`${
                            isItemSaved("program", program.id)
                              ? "text-red-600"
                              : "text-muted-foreground"
                          } hover:text-red-600`}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              isItemSaved("program", program.id)
                                ? "fill-current"
                                : ""
                            }`}
                          />
                        </Button>
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground mb-4">
                        {program.description || "No description available."}
                      </p>

                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Details Grid */}
                      <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Tuition Fee
                          </p>
                          <p className="font-medium text-foreground">
                            {formatTuitionFee(program)}
                          </p>
                        </div>
                        <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Application Deadline
                          </p>
                          <p className="font-medium text-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {program.deadline
                              ? new Date(program.deadline).toLocaleDateString()
                              : "Not Available"}
                          </p>
                        </div>
                        <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Entry Requirements
                          </p>
                          <p className="font-medium text-foreground text-sm">
                            {getEntryRequirements(program)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button
                          asChild
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Link href={`/student/program/${program.id}`}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="backdrop-blur-sm bg-white/50"
                        >
                          <Bookmark className="w-4 h-4 mr-2" />
                          Save Program
                        </Button>
                        <Button
                          variant="outline"
                          className="backdrop-blur-sm bg-white/50"
                        >
                          Compare
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading &&
          !error &&
          filteredRecommendations.length > 0 &&
          totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="backdrop-blur-sm bg-white/50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`backdrop-blur-sm ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "bg-white/50"
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="backdrop-blur-sm bg-white/50"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

        {/* Results count */}
        {!loading && !error && filteredRecommendations.length > 0 && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            Showing {(currentPage - 1) * programsPerPage + 1} -{" "}
            {Math.min(
              currentPage * programsPerPage,
              filteredRecommendations.length
            )}{" "}
            of {filteredRecommendations.length} programs
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
