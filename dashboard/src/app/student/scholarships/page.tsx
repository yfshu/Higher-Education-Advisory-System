"use client";

import { useState, useEffect } from "react";
import { useMemo } from "react";
import Link from "next/link";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Star,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  GraduationCap,
  Building2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Award,
  BookMarked,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useSavedItems } from "@/hooks/useSavedItems";

interface Scholarship {
  id: number;
  name: string;
  organization_name: string | null;
  type: string | null;
  level: string | null;
  amount: number | null;
  location: string | null;
  deadline: string | null;
  description: string | null;
  study_levels: string[] | null;
  application_url: string | null;
  processing_time_weeks: number | null;
  applicant_count: number | null;
  rating: number | null;
  review_count: number | null;
  eligibility_requirements: string[] | null;
  benefits_json: string[] | null;
  selection_process: Array<{
    step: number;
    title: string;
    description: string;
    duration: string;
  }> | null;
  partner_universities: Array<{
    name: string;
    country: string;
  }> | null;
}

export default function ScholarshipSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    level: 'all',
    amount: 'all'
  });
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const scholarshipsPerPage = 5;
  const { isItemSaved, toggleSave, savedItems, isLoading: savedItemsLoading, refreshSavedItems } = useSavedItems();
  
  // Count saved scholarships - only count when mounted and items are loaded
  const savedScholarshipsCount = useMemo(() => {
    // Always return 0 if not mounted or still loading
    if (!mounted || savedItemsLoading) {
      return 0;
    }
    // Return 0 if savedItems is empty, undefined, or null
    if (!savedItems || savedItems.size === 0 || !(savedItems instanceof Map)) {
      return 0;
    }
    // Filter for scholarship keys only and count them
    try {
      const allKeys = Array.from(savedItems.keys());
      const scholarshipKeys = allKeys.filter(key => {
        if (!key || typeof key !== 'string') return false;
        return key.startsWith('scholarship:');
      });
      const count = scholarshipKeys.length;
      // Always log for debugging
      console.log('🔍 ScholarshipSearch: Saved items count calculation:', {
        mounted,
        savedItemsLoading,
        savedItemsSize: savedItems.size,
        allKeys,
        scholarshipKeys,
        count
      });
      return count;
    } catch (error) {
      console.error('Error counting saved scholarships:', error);
      return 0;
    }
  }, [savedItems, mounted, savedItemsLoading]);
  
  // Fix hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);

  // Refresh saved items when component mounts to get latest data from database
  useEffect(() => {
    if (mounted && !savedItemsLoading) {
      console.log('🔄 Refreshing saved items to get latest data...');
      refreshSavedItems();
    }
  }, [mounted]); // Only run when mounted changes, not on every savedItemsLoading change

  const scholarshipTypes = [
    'Merit-based',
    'Need-based',
    'Academic'
  ];

  const educationLevels = [
    'Foundation',
    'Diploma', 
    'Bachelor\'s Degree'
  ];

  // Fetch scholarships from backend
  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
        
        // Build query parameters
        const params = new URLSearchParams();
        if (filters.type !== 'all') {
          params.append('type', filters.type);
        }
        if (filters.level !== 'all') {
          // Map frontend level to backend study level
          const levelMap: Record<string, string> = {
            'Foundation': 'foundation',
            'Diploma': 'diploma',
            'Bachelor\'s Degree': 'degree'
          };
          if (levelMap[filters.level]) {
            params.append('studyLevel', levelMap[filters.level]);
          }
        }
        const queryString = params.toString();
        const url = `${backendUrl}/api/scholarships${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch scholarships: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log(`✅ Fetched ${result.data.length} scholarships from backend`);
          setScholarships(result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('❌ Error fetching scholarships:', err);
        setError(err instanceof Error ? err.message : 'Failed to load scholarships');
        setScholarships([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters.type, filters.level, filters.amount]);

  // Helper functions
  const formatAmount = (amount: number | null): string => {
    if (!amount) return 'Not specified';
    if (amount >= 100000) {
      return `Up to RM ${(amount / 1000).toFixed(0)}k`;
    }
    return `RM ${amount.toLocaleString()}`;
  };

  const formatApplicants = (count: number | null): string => {
    if (!count) return 'N/A';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`;
    }
    return `${count}+`;
  };

  const getLevelDisplay = (level: string | null | undefined): string => {
    if (!level) return 'Not specified';
    const levelMap: Record<string, string> = {
      'foundation': 'Foundation',
      'diploma': 'Diploma',
      'degree': 'Bachelor\'s Degree'
    };
    const levelLower = level.toLowerCase();
    return levelMap[levelLower] || level.charAt(0).toUpperCase() + level.slice(1);
  };

  // toggleSave is now provided by useSavedItems hook

  const filteredScholarships = scholarships.filter(scholarship => {
    // Enhanced search: search in name, organization, and description
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !searchLower || (() => {
      const nameMatch = scholarship.name.toLowerCase().includes(searchLower);
      const orgMatch = scholarship.organization_name?.toLowerCase().includes(searchLower) ?? false;
      const descMatch = scholarship.description?.toLowerCase().includes(searchLower) ?? false;
      return nameMatch || orgMatch || descMatch;
    })();
    
    // Type filter (already handled by backend API)
    const matchesType = filters.type === 'all' || scholarship.type === filters.type;
    
    // Level filter - backend handles this, client-side filter should pass through
    // Backend already filtered by level, so we just need to verify (for debugging)
    const matchesLevel = filters.level === 'all' || (() => {
      if (!scholarship.level) {
        console.warn(`⚠️ Scholarship ${scholarship.id} has no level but passed backend filter`);
        return false;
      }
      const levelMap: Record<string, string> = {
        'Foundation': 'foundation',
        'Diploma': 'diploma',
        'Bachelor\'s Degree': 'degree'
      };
      const backendLevel = levelMap[filters.level];
      if (!backendLevel) {
        console.warn(`⚠️ Unknown level filter: ${filters.level}`);
        return true; // If level not in map, show it
      }
      const matches = scholarship.level.toLowerCase() === backendLevel.toLowerCase();
      if (!matches) {
        console.warn(`⚠️ Level mismatch for scholarship ${scholarship.id}: "${scholarship.level}" !== "${backendLevel}"`);
      }
      return matches;
    })();
    
    // Amount filter - simplified
    const matchesAmount = filters.amount === 'all' || (() => {
      if (!scholarship.amount) return filters.amount === 'any'; // Show scholarships without amount if "Any" is selected
      if (filters.amount === 'partial') return scholarship.amount < 100000;
      if (filters.amount === 'full') return scholarship.amount >= 100000;
      if (filters.amount === 'any') return true; // Show all including those without amount
      return true;
    })();
    
    return matchesSearch && matchesType && matchesLevel && matchesAmount;
  });

  // Pagination
  const totalPages = Math.ceil(filteredScholarships.length / scholarshipsPerPage);
  const paginatedScholarships = filteredScholarships.slice(
    (currentPage - 1) * scholarshipsPerPage,
    currentPage * scholarshipsPerPage
  );

  const resetFilters = () => {
    setFilters({
      type: 'all',
      level: 'all',
      amount: 'all'
    });
  };

  return (
    <StudentLayout title="Scholarship Search">
      <div className="space-y-6">
        {/* Search Header */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Find Your Perfect Scholarship Opportunity
          </h2>
          <div className="relative">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search scholarships, organizations, or fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
            />
          </div>
        </div>

        {/* Main Content: Sidebar + Results */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <Card className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/30 dark:border-slate-700/30 shadow-xl sticky top-6">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Filters
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters} 
                    className="text-xs h-7 px-2 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear All
                  </Button>
                </div>

                {mounted && (
                  <div className="space-y-5">
                    {/* Scholarship Type Filter */}
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Scholarship Type
                      </Label>
                      <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                        <SelectTrigger className="h-10 backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {scholarshipTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Education Level Filter */}
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Education Level
                      </Label>
                      <Select value={filters.level} onValueChange={(value) => setFilters({...filters, level: value})}>
                        <SelectTrigger className="h-10 backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          {educationLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amount Filter */}
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Scholarship Amount
                      </Label>
                      <Select value={filters.amount} onValueChange={(value) => setFilters({...filters, amount: value})}>
                        <SelectTrigger className="h-10 backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                          <SelectValue placeholder="Any Amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Amount</SelectItem>
                          <SelectItem value="partial">Partial Coverage</SelectItem>
                          <SelectItem value="full">Full Coverage</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>
                )}
              </div>
            </Card>
          </aside>

          {/* Right Side - Results */}
          <div className="flex-1 space-y-6">
            {/* Results Summary */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2">
                <p className="text-sm sm:text-base text-muted-foreground">
                  Total <span className="font-bold text-foreground text-lg">{filteredScholarships.length}</span> scholarship{filteredScholarships.length !== 1 ? 's' : ''}
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              </div>
              {mounted && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      console.log('🔄 Manually refreshing saved items...');
                      refreshSavedItems();
                    }}
                    className="h-8 px-2 text-xs"
                    title="Refresh saved items"
                  >
                    ↻
                  </Button>
                  <Button asChild variant="outline" className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800">
                    <Link href="/student/saved">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Saved ({savedScholarshipsCount})
                    </Link>
                  </Button>
                </div>
              )}
            </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading scholarships...</p>
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

        {/* Scholarship Cards */}
        {!loading && !error && (
          <div className="grid gap-6">
            {paginatedScholarships.map((scholarship) => (
              <Card key={scholarship.id} className="backdrop-blur-xl bg-white/40 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">{scholarship.name}</h3>
                        {scholarship.type && (
                          <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300">
                            {scholarship.type}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Building2 className="w-4 h-4" />
                        <span>{scholarship.organization_name || 'Not specified'}</span>
                      </div>
                      <p className="text-muted-foreground mb-4">{scholarship.description || 'No description available.'}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await toggleSave('scholarship', scholarship.id);
                      }}
                      className={`${isItemSaved('scholarship', scholarship.id) ? 'text-yellow-600' : 'text-muted-foreground'} hover:text-yellow-600`}
                    >
                      {isItemSaved('scholarship', scholarship.id) ? (
                        <BookmarkCheck className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium text-foreground">{formatAmount(scholarship.amount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Level</p>
                        <p className="font-medium text-foreground">{getLevelDisplay(scholarship.level)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium text-foreground">{scholarship.location || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Deadline</p>
                        <p className="font-medium text-foreground">
                          {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {scholarship.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-foreground">{scholarship.rating.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">({scholarship.review_count || 0} reviews)</span>
                        </div>
                      )}
                      {scholarship.applicant_count !== null && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{formatApplicants(scholarship.applicant_count)} applicants</span>
                        </div>
                      )}
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Link href={`/student/scholarship/${scholarship.id}`}>
                        View Details
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredScholarships.length > 0 && totalPages > 1 && (
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
        {!loading && !error && filteredScholarships.length > 0 && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            Showing {(currentPage - 1) * scholarshipsPerPage + 1} -{" "}
            {Math.min(currentPage * scholarshipsPerPage, filteredScholarships.length)}{" "}
            of {filteredScholarships.length} scholarship{filteredScholarships.length !== 1 ? 's' : ''}
          </div>
        )}

        {!loading && !error && filteredScholarships.length === 0 && (
          <Card className="backdrop-blur-xl bg-white/40 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50 shadow-lg">
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No scholarships found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find more opportunities.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  resetFilters();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Clear All Filters
              </Button>
            </div>
          </Card>
        )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
