"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Edit,
  Trash2,
  BookOpen,
  GraduationCap,
  MapPin,
  Users,
  Eye,
  Loader2,
  Plus,
  Calendar,
  DollarSign,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { ProgramWizardModal } from "@/components/admin/ProgramWizardModal";
import { DeleteProgramDialog } from "@/components/admin/DeleteProgramDialog";
import { useUser } from "@/contexts/UserContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface Program {
  id: number;
  name: string;
  level: string | null;
  duration_months: number | null;
  tuition_fee_amount: number | null;
  university: {
    id: number;
    name: string;
    city: string | null;
    state: string | null;
  } | null;
  created_at: string | null;
}

type SortOption = "newest" | "tuition_asc" | "tuition_desc" | "duration_asc" | "duration_desc";

export default function ProgramManagement() {
  const { userData } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const handleRefresh = useCallback(async () => {
    if (!userData?.accessToken) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      // Add cache-busting timestamp and 'all' parameter to fetch all programs (including inactive)
      const response = await fetch(`${backendUrl}/api/programs?all=true&t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch programs: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        console.log(`✅ Fetched ${result.data.length} programs (count: ${result.count})`);
        setPrograms(result.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError(err instanceof Error ? err.message : "Failed to load programs");
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [userData?.accessToken]);

  useEffect(() => {
    if (userData?.accessToken) {
      handleRefresh();
    }
  }, [userData?.accessToken, handleRefresh]);

  const filteredAndSortedPrograms = programs
    .filter((program) => {
      const matchesSearch =
        program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.university?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterType === "all" ||
        (program.level && 
          (program.level.toLowerCase() === filterType.toLowerCase() ||
           // Handle legacy "bachelor" -> "degree" mapping
           (filterType === "degree" && (program.level.toLowerCase() === "bachelor" || program.level.toLowerCase() === "degree"))));
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        case "tuition_asc":
          return (a.tuition_fee_amount || 0) - (b.tuition_fee_amount || 0);
        case "tuition_desc":
          return (b.tuition_fee_amount || 0) - (a.tuition_fee_amount || 0);
        case "duration_asc":
          return (a.duration_months || 0) - (b.duration_months || 0);
        case "duration_desc":
          return (b.duration_months || 0) - (a.duration_months || 0);
        default:
          return 0;
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedPrograms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPrograms = filteredAndSortedPrograms.slice(startIndex, endIndex);

  // Reset to page 1 when search/filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, sortBy]);

  const getLevelBadge = (level: string | null) => {
    if (!level) return null;
    const levelLower = level.toLowerCase();
    if (levelLower === "foundation") {
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
          Foundation
        </Badge>
      );
    }
    if (levelLower === "diploma") {
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
          Diploma
        </Badge>
      );
    }
    if (levelLower === "bachelor" || levelLower === "degree") {
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
          Degree
        </Badge>
      );
    }
    return <Badge variant="outline">{level}</Badge>;
  };

  const getLocation = (program: Program): string => {
    if (!program.university) return "Unknown";
    const parts = [program.university.city, program.university.state].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Malaysia";
  };

  const handleEdit = (program: Program) => {
    setSelectedProgram(program);
    setFormModalOpen(true);
  };

  const handleDelete = (program: Program) => {
    setSelectedProgram(program);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProgram(null);
    setFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    setSelectedProgram(null);
    setFormModalOpen(false);
    // Small delay to ensure backend has processed the change
    setTimeout(() => {
      handleRefresh();
    }, 300);
  };

  const handleDeleteSuccess = () => {
    setSelectedProgram(null);
    setDeleteDialogOpen(false);
    // Small delay to ensure backend has processed the change
    setTimeout(() => {
      handleRefresh();
    }, 300);
  };

  // Loading Skeleton
  if (loading) {
    return (
      <AdminLayout title="Program Management">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <AdminLayout title="Program Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading programs</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={handleRefresh} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Program Management">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Program Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage {programs.length} university programs from Malaysian institutions
            </p>
          </div>
          <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add New Program
          </Button>
        </div>

        {/* Toolbar */}
        <Card className="p-4 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search programs or universities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
            </div>

            {/* Level Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                className="text-xs sm:text-sm"
              >
                All
              </Button>
              <Button
                variant={filterType === "foundation" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("foundation")}
                className="text-xs sm:text-sm"
              >
                Foundation
              </Button>
              <Button
                variant={filterType === "diploma" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("diploma")}
                className="text-xs sm:text-sm"
              >
                Diploma
              </Button>
              <Button
                variant={filterType === "degree" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("degree")}
                className="text-xs sm:text-sm"
              >
                Degree
              </Button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="tuition_asc">Tuition: Low to High</SelectItem>
                  <SelectItem value="tuition_desc">Tuition: High to Low</SelectItem>
                  <SelectItem value="duration_asc">Duration: Short to Long</SelectItem>
                  <SelectItem value="duration_desc">Duration: Long to Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-muted-foreground">
              Showing <strong>{filteredAndSortedPrograms.length}</strong> of{" "}
              <strong>{programs.length}</strong> programs
            </p>
          </div>
        </Card>

        {/* Programs Table - Desktop */}
        <Card className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20 shadow-lg overflow-hidden hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Tuition
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen className="w-12 h-12 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground font-medium">
                          {searchTerm || filterType !== "all"
                            ? "No programs found matching your criteria"
                            : "No programs available"}
                        </p>
                        {!searchTerm && filterType === "all" && (
                          <Button onClick={handleAddNew} variant="outline" className="mt-2">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Program
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPrograms.map((program) => (
                    <tr
                      key={program.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-base text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {program.name}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {getLocation(program)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                            {program.university?.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getLevelBadge(program.level)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {program.duration_months
                            ? `${program.duration_months} months`
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          {program.tuition_fee_amount
                            ? `RM ${program.tuition_fee_amount.toLocaleString()}`
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <TooltipProvider>
                          <div className="flex items-center justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="h-8 w-8 p-0"
                                >
                                  <Link href={`/student/program/${program.id}`}>
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Program</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(program)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Program</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(program)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Program</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Programs Cards - Mobile/Tablet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
          {paginatedPrograms.length === 0 ? (
            <Card className="p-8 text-center col-span-full">
              <BookOpen className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium mb-2">
                {searchTerm || filterType !== "all"
                  ? "No programs found"
                  : "No programs available"}
              </p>
              {!searchTerm && filterType === "all" && (
                <Button onClick={handleAddNew} variant="outline" className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Program
                </Button>
              )}
            </Card>
          ) : (
            paginatedPrograms.map((program) => (
              <Card
                key={program.id}
                className="p-5 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                      {program.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      <span className="truncate">{program.university?.name || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {getLocation(program)}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2">
                    {getLevelBadge(program.level)}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {program.duration_months ? `${program.duration_months}m` : "N/A"}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <DollarSign className="w-3 h-3" />
                      {program.tuition_fee_amount
                        ? `RM ${program.tuition_fee_amount.toLocaleString()}`
                        : "N/A"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/student/program/${program.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(program)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(program)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Results Info */}
        {filteredAndSortedPrograms.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {startIndex + 1} - {Math.min(endIndex, filteredAndSortedPrograms.length)} of {filteredAndSortedPrograms.length} programs
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card className="p-4 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {programs.length}
                </p>
                <p className="text-xs text-muted-foreground">Total Programs</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {programs.filter((p) =>
                    p.level && ["foundation", "diploma", "degree", "bachelor"].includes(p.level.toLowerCase())
                  ).length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {programs.filter((p) => 
                    p.level && p.level.toLowerCase() === "foundation"
                  ).length}
                </p>
                <p className="text-xs text-muted-foreground">Foundation</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {programs.filter((p) => 
                    p.level && p.level.toLowerCase() === "diploma"
                  ).length}
                </p>
                <p className="text-xs text-muted-foreground">Diploma</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {programs.filter((p) => 
                    p.level && (p.level.toLowerCase() === "degree" || p.level.toLowerCase() === "bachelor")
                  ).length}
                </p>
                <p className="text-xs text-muted-foreground">Degree</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Wizard Modal */}
      <ProgramWizardModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        program={selectedProgram}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Dialog */}
      <DeleteProgramDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        program={selectedProgram ? { id: selectedProgram.id, name: selectedProgram.name } : null}
        onConfirm={handleDeleteSuccess}
      />
    </AdminLayout>
  );
}
