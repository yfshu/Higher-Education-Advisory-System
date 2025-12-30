"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  MapPin,
  GraduationCap,
  Clock,
  Star,
  Heart,
  Calendar,
  BookOpen,
  ExternalLink,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSavedItems } from "@/hooks/useSavedItems";

interface Program {
  id: number;
  name: string;
  level: string | null;
  duration: string | null;
  duration_months: number | null;
  tuition_fee_amount: number | null;
  tuition_fee_period: string | null;
  currency: string | null;
  start_month: string | null;
  deadline: string | null;
  rating: number | null;
  review_count: number | null;
  description: string | null;
  tags: string[] | null;
  university: {
    id: number;
    name: string;
    city: string | null;
    state: string | null;
  } | null;
}

export default function SearchPrograms() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: 'all',
    programType: 'all',
    field: 'all',
    duration: '',
    tuitionRange: [0, 5000],
    startDate: ''
  });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const programsPerPage = 6;
  const { isItemSaved, toggleSave } = useSavedItems();

  // Fetch programs from backend
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
        const response = await fetch(`${backendUrl}/api/programs`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch programs: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log(`✅ Fetched ${result.data.length} programs from backend`);
          setPrograms(result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('❌ Error fetching programs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load programs');
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Helper functions
  const getLevelDisplay = (level: string | null): string => {
    if (!level) return 'N/A';
    const levelMap: Record<string, string> = {
      'foundation': 'Foundation',
      'Foundation': 'Foundation',
      'diploma': 'Diploma',
      'Diploma': 'Diploma',
      'degree': 'Bachelor',
      'Bachelor': 'Bachelor',
      'Master': 'Master',
      'PhD': 'PhD'
    };
    return levelMap[level] || level;
  };

  const formatDuration = (program: Program): string => {
    if (program.duration) return program.duration;
    if (program.duration_months) {
      const years = Math.floor(program.duration_months / 12);
      const months = program.duration_months % 12;
      if (years > 0 && months > 0) {
        return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
      } else if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
      } else {
        return `${months} month${months > 1 ? 's' : ''}`;
      }
    }
    return 'Not Available';
  };

  const formatTuitionFee = (program: Program): string => {
    if (!program.tuition_fee_amount) return 'Not Available';
    const period = program.tuition_fee_period || 'semester';
    return `RM ${program.tuition_fee_amount.toLocaleString()}/${period}`;
  };

  const getLocation = (program: Program): string => {
    if (!program.university) return 'Not Available';
    const parts = [program.university.city, program.university.state].filter(Boolean);
    return parts.length > 0 ? `${parts.join(', ')}, Malaysia` : 'Malaysia';
  };

  const getTags = (program: Program): string[] => {
    if (!program.tags) return [];
    try {
      if (Array.isArray(program.tags)) return program.tags;
      if (typeof program.tags === 'string') {
        const parsed = JSON.parse(program.tags);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  };

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  const filteredPrograms = programs.filter(program => {
    // Enhanced search: search in name, university, description, and tags
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower || (() => {
      const nameMatch = program.name.toLowerCase().includes(searchLower);
      const universityMatch = program.university?.name.toLowerCase().includes(searchLower) ?? false;
      const descriptionMatch = program.description?.toLowerCase().includes(searchLower) ?? false;
      const tags = getTags(program);
      const tagsMatch = tags.some(tag => tag.toLowerCase().includes(searchLower));
      return nameMatch || universityMatch || descriptionMatch || tagsMatch;
    })();
    
    // Location filter: match city or state
    const matchesLocation = filters.location === 'all' || (() => {
      if (!program.university) return false;
      const locationLower = filters.location.toLowerCase();
      const cityMatch = program.university.city?.toLowerCase().includes(locationLower) ?? false;
      const stateMatch = program.university.state?.toLowerCase().includes(locationLower) ?? false;
      return cityMatch || stateMatch;
    })();
    
    // Program type filter
    const matchesType = filters.programType === 'all' || 
      getLevelDisplay(program.level) === filters.programType;
    
    // Field filtering based on tags
    const matchesField = filters.field === 'all' || (() => {
      const tags = getTags(program);
      return tags.some(tag => tag.toLowerCase().includes(filters.field.toLowerCase()));
    })();
    
    // Tuition fee range filter
    const matchesTuition = !program.tuition_fee_amount || 
      (program.tuition_fee_amount >= filters.tuitionRange[0] && 
       program.tuition_fee_amount <= filters.tuitionRange[1]);

    return matchesSearch && matchesLocation && matchesType && matchesField && matchesTuition;
  });

  // Sort programs
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'tuition-low':
        return (a.tuition_fee_amount || 0) - (b.tuition_fee_amount || 0);
      case 'tuition-high':
        return (b.tuition_fee_amount || 0) - (a.tuition_fee_amount || 0);
      case 'deadline':
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      default: // relevance
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedPrograms.length / programsPerPage);
  const paginatedPrograms = sortedPrograms.slice(
    (currentPage - 1) * programsPerPage,
    currentPage * programsPerPage
  );

  const resetFilters = () => {
    setFilters({
      location: 'all',
      programType: 'all',
      field: 'all',
      duration: '',
      tuitionRange: [0, 5000],
      startDate: ''
    });
  };

  return (
    <StudentLayout title="Search Programs">
      <div className="space-y-6">
        {/* Search Header */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Find Your Perfect Malaysian University Program
          </h2>
          <div className="relative">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search Malaysian programs, universities, or fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
            />
          </div>
        </div>

        {/* Main Content: Sidebar + Results */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg sticky top-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
                    Clear All
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Location Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Location</Label>
                    <Select value={filters.location || "all"} onValueChange={(value) => setFilters({...filters, location: value})}>
                      <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                        <SelectValue placeholder="Any location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Location</SelectItem>
                        <SelectItem value="kuala lumpur">Kuala Lumpur</SelectItem>
                        <SelectItem value="johor">Johor</SelectItem>
                        <SelectItem value="penang">Penang</SelectItem>
                        <SelectItem value="selangor">Selangor</SelectItem>
                        <SelectItem value="perak">Perak</SelectItem>
                        <SelectItem value="kedah">Kedah</SelectItem>
                        <SelectItem value="pahang">Pahang</SelectItem>
                        <SelectItem value="sabah">Sabah</SelectItem>
                        <SelectItem value="sarawak">Sarawak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Program Type Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Program Type</Label>
                    <Select value={filters.programType || "all"} onValueChange={(value) => setFilters({...filters, programType: value})}>
                      <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Type</SelectItem>
                        <SelectItem value="Foundation">Foundation</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Bachelor">Bachelor</SelectItem>
                        <SelectItem value="Master">Master</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Field of Study Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Field of Study</Label>
                    <Select value={filters.field || "all"} onValueChange={(value) => setFilters({...filters, field: value})}>
                      <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                        <SelectValue placeholder="Any field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Field</SelectItem>
                        <SelectItem value="Computer Science">Computer Science & IT</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Business">Business & Management</SelectItem>
                        <SelectItem value="Medicine">Medicine & Health Sciences</SelectItem>
                        <SelectItem value="Science">Pure Sciences</SelectItem>
                        <SelectItem value="Arts">Arts & Humanities</SelectItem>
                        <SelectItem value="Social">Social Sciences</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Law">Law</SelectItem>
                        <SelectItem value="Architecture">Architecture & Built Environment</SelectItem>
                        <SelectItem value="Accounting">Accounting & Finance</SelectItem>
                        <SelectItem value="Communication">Mass Communication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tuition Fee Range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tuition Fee Range</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.tuitionRange}
                        onValueChange={(value) => setFilters({...filters, tuitionRange: value})}
                        max={5000}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>RM {filters.tuitionRange[0].toLocaleString()}</span>
                        <span>RM {filters.tuitionRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          {/* Right Side - Results */}
          <div className="flex-1 space-y-6">
            {/* Results Summary and Sort */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-muted-foreground">
                Found <span className="font-semibold text-foreground">{sortedPrograms.length}</span> programs matching your criteria
              </p>
              <Select value={sortBy || "relevance"} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 backdrop-blur-sm bg-white/50 border-white/30">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="tuition-low">Lowest Tuition</SelectItem>
                  <SelectItem value="tuition-high">Highest Tuition</SelectItem>
                  <SelectItem value="deadline">Application Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">Loading programs...</p>
              </div>
            )}

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

            {/* Programs Grid */}
            {!loading && !error && (
          <div className="grid lg:grid-cols-2 gap-6">
            {paginatedPrograms.map((program) => {
              const tags = getTags(program);
              return (
                <Card key={program.id} className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{program.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {getLevelDisplay(program.level)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            {program.university?.name || 'Not Available'}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {getLocation(program)}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={async () => {
                          await toggleSave('program', program.id);
                        }}
                        className={`${isItemSaved('program', program.id) ? 'text-red-600' : 'text-muted-foreground'} hover:text-red-600`}
                      >
                        <Heart className={`w-5 h-5 ${isItemSaved('program', program.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>

                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium text-foreground">{program.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({program.review_count || 0} reviews)</span>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-4">{program.description || 'No description available.'}</p>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Program Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Duration</p>
                        <p className="font-medium text-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(program)}
                        </p>
                      </div>
                      <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Tuition Fee</p>
                        <p className="font-medium text-foreground">{formatTuitionFee(program)}</p>
                      </div>
                    </div>

                    {/* Start Date and Deadline */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>Starts: {program.start_month || 'Not Available'}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Apply by: {program.deadline ? new Date(program.deadline).toLocaleDateString() : 'Not Available'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/student/program/${program.id}`} className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Button variant="outline" className="backdrop-blur-sm bg-white/50">
                        Compare
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

            {/* Pagination */}
            {!loading && !error && sortedPrograms.length > 0 && totalPages > 1 && (
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
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
                            currentPage === page ? "bg-blue-600 text-white" : "bg-white/50"
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
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="backdrop-blur-sm bg-white/50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Results count */}
            {!loading && !error && sortedPrograms.length > 0 && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                Showing {(currentPage - 1) * programsPerPage + 1} -{" "}
                {Math.min(currentPage * programsPerPage, sortedPrograms.length)}{" "}
                of {sortedPrograms.length} programs
              </div>
            )}

            {/* No Results */}
            {!loading && !error && sortedPrograms.length === 0 && (
              <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg text-center p-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No programs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters to find more programs.
                </p>
                <Button onClick={resetFilters} variant="outline" className="backdrop-blur-sm bg-white/50">
                  Clear Filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
