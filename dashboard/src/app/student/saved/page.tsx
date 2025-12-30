"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  MapPin,
  Calendar,
  GraduationCap,
  ExternalLink,
  Trash2,
  Star,
  DollarSign,
  Building2,
  Users,
  Filter,
  SortAsc,
  AlertCircle,
  Search,
  Award,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useSavedItems } from "@/hooks/useSavedItems";

interface SavedProgram {
  id: number;
  name: string;
  level: string | null;
  duration: string | null;
  duration_months: number | null;
  tuition_fee_amount: number | null;
  tuition_fee_period: string | null;
  currency: string | null;
  deadline: string | null;
  rating: number | null;
  review_count: number | null;
  description: string | null;
  tags: string[] | null;
  saved_at: string;
  saved_item_id: number;
  university: {
    id: number;
    name: string;
    city: string | null;
    state: string | null;
  } | null;
}

interface SavedScholarship {
  id: number;
  name: string;
  organization_name: string | null;
  type: string | null;
  amount: number | null;
  location: string | null;
  deadline: string | null;
  description: string | null;
  study_levels: string[] | null;
  applicant_count: number | null;
  rating: number | null;
  review_count: number | null;
  saved_at: string;
  saved_item_id: number;
}

export default function SavedItems() {
  const [programSortBy, setProgramSortBy] = useState("deadline");
  const [scholarshipSortBy, setScholarshipSortBy] = useState("deadline");
  const [scholarshipFilterBy, setScholarshipFilterBy] = useState("all");
  const [selectedScholarships, setSelectedScholarships] = useState<string[]>(
    []
  );
  const [savedPrograms, setSavedPrograms] = useState<SavedProgram[]>([]);
  const [savedScholarships, setSavedScholarships] = useState<
    SavedScholarship[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toggleSave, refreshSavedItems } = useSavedItems();

  // Fetch saved items on mount
  useEffect(() => {
    const fetchSavedItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) {
          setLoading(false);
          return;
        }

        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";

        // Fetch saved programs
        const programsResponse = await fetch(
          `${backendUrl}/api/saved-items/programs`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (programsResponse.ok) {
          const programsResult = await programsResponse.json();
          console.log("Saved programs response:", programsResult);
          if (programsResult.success && programsResult.data) {
            console.log(
              `✅ Loaded ${programsResult.data.length} saved programs`
            );
            setSavedPrograms(programsResult.data);
          } else {
            console.warn("⚠️ Programs response missing data:", programsResult);
          }
        } else {
          const errorText = await programsResponse.text();
          console.error(
            "❌ Failed to fetch saved programs:",
            programsResponse.status,
            errorText
          );
        }

        // Fetch saved scholarships
        const scholarshipsResponse = await fetch(
          `${backendUrl}/api/saved-items/scholarships`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (scholarshipsResponse.ok) {
          const scholarshipsResult = await scholarshipsResponse.json();
          console.log("Saved scholarships response:", scholarshipsResult);
          if (scholarshipsResult.success && scholarshipsResult.data) {
            console.log(
              `✅ Loaded ${scholarshipsResult.data.length} saved scholarships`
            );
            setSavedScholarships(scholarshipsResult.data);
          } else {
            console.warn(
              "⚠️ Scholarships response missing data:",
              scholarshipsResult
            );
          }
        } else {
          const errorText = await scholarshipsResponse.text();
          console.error(
            "❌ Failed to fetch saved scholarships:",
            scholarshipsResponse.status,
            errorText
          );
        }
      } catch (err) {
        console.error("Error fetching saved items:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load saved items"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, []);

  const handleUnsaveProgram = async (programId: number) => {
    await toggleSave("program", programId);
    setSavedPrograms((prev) => prev.filter((p) => p.id !== programId));
    await refreshSavedItems();
  };

  const handleUnsaveScholarship = async (scholarshipId: number) => {
    await toggleSave("scholarship", scholarshipId);
    setSavedScholarships((prev) => prev.filter((s) => s.id !== scholarshipId));
    await refreshSavedItems();
  };

  const toggleScholarshipSelection = (scholarshipId: string) => {
    setSelectedScholarships((prev) =>
      prev.includes(scholarshipId)
        ? prev.filter((id) => id !== scholarshipId)
        : [...prev, scholarshipId]
    );
  };

  const removeScholarship = (scholarshipId: string) => {
    // Remove scholarship functionality would be implemented here
  };

  const removeSelectedScholarships = () => {
    selectedScholarships.forEach((id) => removeScholarship(id));
    setSelectedScholarships([]);
  };

  const getStatusBadge = (deadline: string | null) => {
    if (!deadline) {
      return (
        <Badge
          variant="secondary"
          className="bg-gray-100 text-muted-foreground"
        >
          No Deadline
        </Badge>
      );
    }
    const daysUntilDeadline = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysUntilDeadline < 0) {
      return (
        <Badge
          variant="secondary"
          className="bg-gray-100 text-muted-foreground"
        >
          Closed
        </Badge>
      );
    } else if (daysUntilDeadline <= 7) {
      return (
        <Badge variant="destructive">
          Urgent - {daysUntilDeadline} days left
        </Badge>
      );
    } else if (daysUntilDeadline <= 30) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-600">
          Due Soon
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-600">
          Open
        </Badge>
      );
    }
  };

  const sortedPrograms = [...savedPrograms].sort((a, b) => {
    switch (programSortBy) {
      case "deadline":
        const aDeadline = a.deadline ? new Date(a.deadline).getTime() : 0;
        const bDeadline = b.deadline ? new Date(b.deadline).getTime() : 0;
        return aDeadline - bDeadline;
      case "match":
        // Use rating as match score if available
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        return bRating - aRating;
      case "saved":
        const aSaved = a.saved_at ? new Date(a.saved_at).getTime() : 0;
        const bSaved = b.saved_at ? new Date(b.saved_at).getTime() : 0;
        return bSaved - aSaved;
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      default:
        return 0;
    }
  });

  const sortedScholarships = [...savedScholarships].sort((a, b) => {
    switch (scholarshipSortBy) {
      case "deadline":
        const aDeadline = a.deadline ? new Date(a.deadline).getTime() : 0;
        const bDeadline = b.deadline ? new Date(b.deadline).getTime() : 0;
        return aDeadline - bDeadline;
      case "match":
        // Use rating as match score if available
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        return bRating - aRating;
      case "amount":
        const aAmount = a.amount || 0;
        const bAmount = b.amount || 0;
        return bAmount - aAmount;
      case "saved":
        const aSaved = a.saved_at ? new Date(a.saved_at).getTime() : 0;
        const bSaved = b.saved_at ? new Date(b.saved_at).getTime() : 0;
        return bSaved - aSaved;
      default:
        return 0;
    }
  });

  const filteredScholarships = sortedScholarships.filter((scholarship) => {
    if (scholarshipFilterBy === "all") return true;
    if (!scholarship.deadline) return false; // Skip scholarships without deadlines

    const daysUntilDeadline = Math.ceil(
      (new Date(scholarship.deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (scholarshipFilterBy === "urgent") {
      return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
    }
    if (scholarshipFilterBy === "open") {
      return daysUntilDeadline > 0;
    }
    if (scholarshipFilterBy === "closed") {
      return daysUntilDeadline < 0;
    }
    return true;
  });

  return (
    <StudentLayout title="Saved Items">
      <div className="space-y-6">
        {/* Header */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    Saved Items
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your saved programs and scholarships
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="backdrop-blur-sm bg-white/50 border-white/30"
                >
                  <Link href="/student/search">
                    <Search className="w-4 h-4 mr-2" />
                    Find Programs
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link href="/student/scholarships">
                    <Award className="w-4 h-4 mr-2" />
                    Find Scholarships
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {savedPrograms.length}
                </p>
                <p className="text-sm text-muted-foreground">Saved Programs</p>
              </div>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {savedScholarships.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Saved Scholarships
                </p>
              </div>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {
                    [...savedPrograms, ...savedScholarships].filter((item) => {
                      if (!item.deadline) return false;
                      const days = Math.ceil(
                        (new Date(item.deadline).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return days <= 7 && days >= 0;
                    }).length
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  Urgent Deadlines
                </p>
              </div>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {(() => {
                    const allRatings = [
                      ...savedPrograms
                        .map((p) => p.rating)
                        .filter((r): r is number => r !== null),
                      ...savedScholarships
                        .map((s) => s.rating)
                        .filter((r): r is number => r !== null),
                    ];
                    if (allRatings.length === 0) return "N/A";
                    const avgRating =
                      allRatings.reduce((acc, r) => acc + r, 0) /
                      allRatings.length;
                    return avgRating.toFixed(1);
                  })()}
                </p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="programs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg p-1 h-12">
            <TabsTrigger
              value="programs"
              className="flex items-center gap-2 h-10 rounded-lg backdrop-blur-sm bg-white/20 border border-transparent hover:bg-white/40 hover:border-blue-200/50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-md transition-all duration-200 font-medium"
            >
              <GraduationCap className="w-4 h-4" />
              Programs ({savedPrograms.length})
            </TabsTrigger>
            <TabsTrigger
              value="scholarships"
              className="flex items-center gap-2 h-10 rounded-lg backdrop-blur-sm bg-white/20 border border-transparent hover:bg-white/40 hover:border-yellow-200/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:border-yellow-500 data-[state=active]:shadow-md transition-all duration-200 font-medium"
            >
              <Award className="w-4 h-4" />
              Scholarships ({savedScholarships.length})
            </TabsTrigger>
          </TabsList>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6 mt-6">
            {/* Program Controls */}
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <SortAsc className="w-4 h-4 text-muted-foreground" />
                      <Select
                        value={programSortBy}
                        onValueChange={setProgramSortBy}
                      >
                        <SelectTrigger className="w-48 backdrop-blur-sm bg-white/50 border-white/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deadline">
                            Sort by Deadline
                          </SelectItem>
                          <SelectItem value="match">
                            Sort by Match Score
                          </SelectItem>
                          <SelectItem value="name">Sort by Name</SelectItem>
                          <SelectItem value="saved">
                            Sort by Date Saved
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {savedPrograms.length} program
                    {savedPrograms.length !== 1 ? "s" : ""} saved
                  </p>
                </div>
              </div>
            </Card>

            {/* Programs List */}
            <div className="space-y-4">
              {sortedPrograms.length === 0 ? (
                <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No programs saved yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start exploring Malaysian university programs and save the
                      ones you are interested in.
                    </p>
                    <Button
                      asChild
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Link href="/student/search">
                        <Search className="w-4 h-4 mr-2" />
                        Browse Programs
                      </Link>
                    </Button>
                  </div>
                </Card>
              ) : (
                sortedPrograms.map((program) => {
                  const location = program.university
                    ? [program.university.city, program.university.state]
                        .filter(Boolean)
                        .join(", ") + ", Malaysia"
                    : "Not Available";
                  const getLevelDisplay = (level: string | null): string => {
                    if (!level) return "N/A";
                    const levelMap: Record<string, string> = {
                      foundation: "Foundation",
                      Foundation: "Foundation",
                      diploma: "Diploma",
                      Diploma: "Diploma",
                      degree: "Bachelor",
                      Bachelor: "Bachelor",
                    };
                    return (
                      levelMap[level] ||
                      level.charAt(0).toUpperCase() + level.slice(1)
                    );
                  };

                  return (
                    <Card
                      key={program.id}
                      className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">
                                {program.name}
                              </h3>
                              {program.rating !== null &&
                                program.rating !== undefined && (
                                  <Badge className="bg-green-500/20 text-green-700">
                                    {program.rating.toFixed(1)} ⭐
                                  </Badge>
                                )}
                              {program.level && (
                                <Badge variant="outline">
                                  {getLevelDisplay(program.level)}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <GraduationCap className="w-4 h-4" />
                                {program.university?.name || "Not Available"}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {location}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                Saved on{" "}
                                {program.saved_at
                                  ? new Date(
                                      program.saved_at
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                              {program.deadline && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Deadline:{" "}
                                  {new Date(
                                    program.deadline
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Link href={`/student/program/${program.id}`}>
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleUnsaveProgram(program.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6 mt-6">
            {/* Scholarship Controls */}
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <SortAsc className="w-4 h-4 text-gray-500" />
                      <Select
                        value={scholarshipSortBy}
                        onValueChange={setScholarshipSortBy}
                      >
                        <SelectTrigger className="w-48 backdrop-blur-sm bg-white/50 border-white/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deadline">
                            Sort by Deadline
                          </SelectItem>
                          <SelectItem value="match">
                            Sort by Match Score
                          </SelectItem>
                          <SelectItem value="amount">Sort by Amount</SelectItem>
                          <SelectItem value="saved">
                            Sort by Date Saved
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <Select
                        value={scholarshipFilterBy}
                        onValueChange={setScholarshipFilterBy}
                      >
                        <SelectTrigger className="w-48 backdrop-blur-sm bg-white/50 border-white/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Scholarships</SelectItem>
                          <SelectItem value="urgent">
                            Urgent Deadlines
                          </SelectItem>
                          <SelectItem value="open">
                            Open Applications
                          </SelectItem>
                          <SelectItem value="closed">
                            Closed Applications
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {selectedScholarships.length > 0 && (
                    <Button
                      variant="destructive"
                      onClick={removeSelectedScholarships}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Selected ({selectedScholarships.length})
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Scholarships List */}
            <div className="space-y-4">
              {filteredScholarships.length === 0 ? (
                <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No scholarships found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {scholarshipFilterBy === "all"
                        ? "You haven't saved any scholarships yet. Start exploring opportunities!"
                        : `No scholarships match the current filter: ${scholarshipFilterBy}`}
                    </p>
                    <Button
                      asChild
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Link href="/student/scholarships">
                        <Award className="w-4 h-4 mr-2" />
                        Browse Scholarships
                      </Link>
                    </Button>
                  </div>
                </Card>
              ) : (
                filteredScholarships.map((scholarship) => {
                  const formatAmount = (amount: number | null): string => {
                    if (!amount) return "Not specified";
                    return `RM ${amount.toLocaleString()}`;
                  };

                  return (
                    <Card
                      key={scholarship.id}
                      className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={selectedScholarships.includes(
                              String(scholarship.id)
                            )}
                            onChange={() =>
                              toggleScholarshipSelection(String(scholarship.id))
                            }
                            className="mt-2 rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <h3 className="text-xl font-semibold text-foreground">
                                  {scholarship.name}
                                </h3>
                                {getStatusBadge(scholarship.deadline)}
                                {scholarship.rating !== null &&
                                  scholarship.rating !== undefined && (
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-50 text-blue-700"
                                    >
                                      {scholarship.rating.toFixed(1)} ⭐
                                    </Badge>
                                  )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleUnsaveScholarship(scholarship.id)
                                }
                                className="text-muted-foreground hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground mb-3">
                              <Building2 className="w-4 h-4" />
                              <span>
                                {scholarship.organization_name ||
                                  "Not specified"}
                              </span>
                              {scholarship.type && (
                                <>
                                  <span className="text-muted-foreground">
                                    •
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {scholarship.type}
                                  </Badge>
                                </>
                              )}
                            </div>

                            {scholarship.description && (
                              <p className="text-muted-foreground mb-4">
                                {scholarship.description}
                              </p>
                            )}

                            <div className="grid md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Amount
                                  </p>
                                  <p className="font-medium text-foreground">
                                    {formatAmount(scholarship.amount)}
                                  </p>
                                </div>
                              </div>
                              {scholarship.deadline && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-red-600" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Deadline
                                    </p>
                                    <p className="font-medium text-foreground">
                                      {new Date(
                                        scholarship.deadline
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {scholarship.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-purple-600" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Location
                                    </p>
                                    <p className="font-medium text-foreground">
                                      {scholarship.location}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {scholarship.applicant_count !== null && (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-blue-600" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Applicants
                                    </p>
                                    <p className="font-medium text-foreground">
                                      {scholarship.applicant_count.toLocaleString()}
                                      +
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {scholarship.rating !== null &&
                                  scholarship.rating !== undefined && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                      <span className="text-sm font-medium text-foreground">
                                        {scholarship.rating.toFixed(1)}
                                      </span>
                                      {scholarship.review_count && (
                                        <span className="text-sm text-muted-foreground">
                                          ({scholarship.review_count} reviews)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                {scholarship.saved_at && (
                                  <span className="text-sm text-muted-foreground">
                                    Saved on{" "}
                                    {new Date(
                                      scholarship.saved_at
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <Button
                                asChild
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Link
                                  href={`/student/scholarship/${scholarship.id}`}
                                >
                                  View Details
                                  <ExternalLink className="w-4 h-4 ml-2" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Card */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keep Exploring
            </h3>
            <p className="text-muted-foreground mb-4">
              Continue discovering programs and scholarships that match your
              goals and interests.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                asChild
                variant="outline"
                className="backdrop-blur-sm bg-white/50 border-white/30"
              >
                <Link href="/student/search">
                  <Search className="w-4 h-4 mr-2" />
                  Find More Programs
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="backdrop-blur-sm bg-white/50 border-white/30"
              >
                <Link href="/student/scholarships">
                  <Award className="w-4 h-4 mr-2" />
                  Find More Scholarships
                </Link>
              </Button>
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href="/student/help">Get Help</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
