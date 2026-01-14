"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  Sparkles,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useSavedItems } from "@/hooks/useSavedItems";
import { useCompare } from "@/contexts/CompareContext";
import { Scale } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getFieldRecommendations, getProgramsByField, type FieldRecommendation } from "@/lib/api/recommendations";

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

interface AIRecommendation {
  program_id: number;
  rank: number;
  explanation: string;
  match_score?: number;
  reasons?: string[];
}

interface AIRecommendationResponse {
  recommendations: AIRecommendation[];
  powered_by: string[];
}

type RecommendationStep = 'initial' | 'fields' | 'programs';

export default function ProgramRecommendations() {
  // State management - Two-step flow
  const [step, setStep] = useState<RecommendationStep>('initial');
  const [loading, setLoading] = useState(false);
  const [fieldRecommendations, setFieldRecommendations] = useState<FieldRecommendation[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [poweredBy, setPoweredBy] = useState<string[]>([]);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { isItemSaved, toggleSave } = useSavedItems();
  const { addProgram, isSelected, canCompare, selectedPrograms, clearCompare } = useCompare();
  const pathname = usePathname();

  // Cache key for sessionStorage
  const CACHE_KEY = "ai_recommendations_cache";
  const CACHE_TIMESTAMP_KEY = "ai_recommendations_timestamp";
  const CACHE_PROFILE_HASH_KEY = "ai_recommendations_profile_hash";
  const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour
  const COMPARE_NAVIGATION_FLAG = "navigated_to_compare";

  // Generate a hash of the current profile for cache invalidation
  const generateProfileHash = async (): Promise<string> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session?.session?.access_token;
      
      if (!accessToken) return "";

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/profile/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) return "";

      const result = await response.json();
      if (result.profile || result.preferences) {
        // Create a hash from profile data that affects recommendations
        // Include key fields: study level, grades (for CGPA calculation), budget, location
        const profileData = JSON.stringify({
          studyLevel: result.profile?.studyLevel || "",
          // Include multiple grades for better hash accuracy
          mathematics: result.profile?.mathematics || "",
          physics: result.profile?.physics || "",
          chemistry: result.profile?.chemistry || "",
          biology: result.profile?.biology || "",
          budget: result.preferences?.budgetRange || "",
          location: result.preferences?.preferredLocation || "",
        });
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < profileData.length; i++) {
          const char = profileData.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
      }
      return "";
    } catch (err) {
      console.error("Error generating profile hash:", err);
      return "";
    }
  };

  // Clear compare selection when returning from compare page
  useEffect(() => {
    if (typeof window !== "undefined" && pathname === "/student/recommendations") {
      const navigatedToCompare = sessionStorage.getItem(COMPARE_NAVIGATION_FLAG);
      if (navigatedToCompare === "true") {
        clearCompare();
        sessionStorage.removeItem(COMPARE_NAVIGATION_FLAG);
      }
    }
  }, [pathname, clearCompare]);

  // Listen for profile update events to clear cache
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log("Profile updated, clearing recommendations cache");
      sessionStorage.removeItem(CACHE_KEY);
      sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
      sessionStorage.removeItem(CACHE_PROFILE_HASH_KEY);
      // Reset state to initial
      setStep('initial');
      setFieldRecommendations([]);
      setSelectedField(null);
      setRecommendations([]);
      setPrograms([]);
      setError(null);
    };

    // Listen for custom event when profile is updated
    window.addEventListener("profileUpdated", handleProfileUpdate);
    
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  // Fetch full program data for recommended program IDs
  const fetchProgramDetails = async (programIds: number[]): Promise<Program[]> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
    
    try {
      console.log("🔍 Fetching program details for IDs:", programIds);
      
      // Fetch all programs (including inactive) to ensure we find recommended programs
      // The AI might recommend programs that are temporarily inactive
      const response = await fetch(`${backendUrl}/api/programs?all=true`);
      if (!response.ok) {
        throw new Error("Failed to fetch program details");
      }
      
      const result = await response.json();
      console.log("📦 Programs API response:", {
        success: result.success,
        dataCount: result.data?.length || 0,
      });
      
      if (result.success && result.data) {
        // Filter to only include recommended programs, maintaining order
        // Convert IDs to numbers for comparison (in case of string/number mismatch)
        const programMap = new Map(
          result.data.map((p: Program) => [Number(p.id), p])
        );
        console.log("🗺️ Program map created with", programMap.size, "programs");
        console.log("🔎 Available program IDs (first 10):", Array.from(programMap.keys()).slice(0, 10));
        
        const foundPrograms = programIds
          .map((id) => {
            const numId = Number(id);
            const program = programMap.get(numId);
            if (!program) {
              console.warn(`⚠️ Program ID ${id} (as number: ${numId}) not found in database`);
              console.warn(`   Looking for: ${id}, Available IDs include: ${Array.from(programMap.keys()).slice(0, 5).join(', ')}...`);
            }
            return program;
          })
          .filter((p): p is Program => p !== undefined);
        
        console.log(`✅ Found ${foundPrograms.length} out of ${programIds.length} recommended programs`);
        if (foundPrograms.length < programIds.length) {
          const missingIds = programIds.filter(id => !programMap.has(Number(id)));
          console.warn(`⚠️ Missing program IDs: ${missingIds.join(', ')}`);
          console.warn(`   This might indicate cached data with invalid IDs. Consider clearing cache.`);
        }
        return foundPrograms;
      }
      console.warn("⚠️ Programs API response missing data");
      return [];
    } catch (err) {
      console.error("❌ Error fetching program details:", err);
      return [];
    }
  };

  // Load cached recommendations on mount (with profile validation)
  // Also restore state when returning from program detail page
  useEffect(() => {
    const loadCachedRecommendations = async () => {
      try {
        const cachedField = sessionStorage.getItem("recommendations_selected_field");
        const cachedFieldRecommendations = sessionStorage.getItem("recommendations_field_list");
        const cachedPrograms = sessionStorage.getItem("recommendations_programs_list");
        const cachedRecommendations = sessionStorage.getItem("recommendations_list");
        const cachedPoweredBy = sessionStorage.getItem("recommendations_powered_by");
        const cachedTimestamp = sessionStorage.getItem("recommendations_cache_timestamp");
        
        // Check if we have cached programs (most important for restoring state)
        if (cachedField && cachedPrograms && cachedRecommendations) {
          // Check if cache is still valid (within 1 hour)
          const now = Date.now();
          const timestamp = cachedTimestamp ? parseInt(cachedTimestamp, 10) : 0;
          
          if (now - timestamp < CACHE_EXPIRY) {
            try {
              const programs = JSON.parse(cachedPrograms);
              const recommendations = JSON.parse(cachedRecommendations);
              
              if (programs && programs.length > 0 && recommendations && recommendations.length > 0) {
                console.log("✅ Restoring cached recommendations state");
                setSelectedField(cachedField);
                setPrograms(programs);
                setRecommendations(recommendations);
                
                if (cachedPoweredBy) {
                  try {
                    setPoweredBy(JSON.parse(cachedPoweredBy));
                  } catch (e) {
                    // Ignore powered by parse error
                  }
                }
                
                // Also restore field recommendations if available
                if (cachedFieldRecommendations) {
                  try {
                    const fields = JSON.parse(cachedFieldRecommendations);
                    if (fields && fields.length > 0) {
                      setFieldRecommendations(fields);
                    }
                  } catch (e) {
                    console.error("Error parsing cached field recommendations:", e);
                  }
                }
                
                // Set step to programs to show the list
                setStep('programs');
                return; // Successfully restored, exit early
              }
            } catch (e) {
              console.error("Error parsing cached programs:", e);
            }
          } else {
            console.log("⚠️ Cache expired, clearing");
            // Cache expired, clear it
            sessionStorage.removeItem("recommendations_selected_field");
            sessionStorage.removeItem("recommendations_field_list");
            sessionStorage.removeItem("recommendations_programs_list");
            sessionStorage.removeItem("recommendations_list");
            sessionStorage.removeItem("recommendations_powered_by");
            sessionStorage.removeItem("recommendations_cache_timestamp");
          }
        }
        
        // Also check for old cache format (for backward compatibility)
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        const oldCachedTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
        const cachedProfileHash = sessionStorage.getItem(CACHE_PROFILE_HASH_KEY);
        
        if (cachedData && oldCachedTimestamp) {
          const timestamp = parseInt(oldCachedTimestamp, 10);
          const now = Date.now();
          
          if (now - timestamp < CACHE_EXPIRY) {
            const currentProfileHash = await generateProfileHash();
            
            if (currentProfileHash && cachedProfileHash && currentProfileHash === cachedProfileHash) {
              // Restore field recommendations if available
              if (cachedFieldRecommendations) {
                try {
                  const fields = JSON.parse(cachedFieldRecommendations);
                  if (fields && fields.length > 0) {
                    setFieldRecommendations(fields);
                    setStep('fields');
                  }
                } catch (e) {
                  console.error("Error parsing cached field recommendations:", e);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading cached recommendations:", err);
      }
    };

    loadCachedRecommendations();
  }, []); // Only run on mount

  // STEP 1: Handle starting AI recommendation - Get field recommendations only
  const handleStartRecommendation = async () => {
    setStep('fields');
    setLoading(true);
    setError(null);
    setRecommendations([]);
    setPrograms([]);
    
    // Clear existing cache when starting new recommendation
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
    sessionStorage.removeItem(CACHE_PROFILE_HASH_KEY);

    try {
      // STEP 1: Get field recommendations only (NO PROGRAMS YET)
      const { data, error: fieldError } = await getFieldRecommendations();

      if (fieldError || !data) {
        throw new Error(fieldError || "Failed to get field recommendations");
      }

      console.log("═══════════════════════════════════════════════════════════");
      console.log("[FRONTEND] Field recommendations received from backend");
      console.log("═══════════════════════════════════════════════════════════");
      console.log("📥 Full response:", JSON.stringify(data, null, 2));
      console.log("📊 Fields count:", data.fields?.length || 0);
      if (data.fields && data.fields.length > 0) {
        data.fields.forEach((f, idx) => {
          console.log(`  ${idx + 1}. ${f.field_name}: ${f.probability} (${(f.probability * 100).toFixed(2)}%)`);
        });
      }
      console.log("Powered by:", data.powered_by);
      console.log("═══════════════════════════════════════════════════════════");

      if (data.fields && data.fields.length > 0) {
        setFieldRecommendations(data.fields);
        setPoweredBy(data.powered_by || []);
        setStep('fields'); // Show field selection UI
        
        // Cache field recommendations for state restoration
        if (typeof window !== "undefined") {
          sessionStorage.setItem("recommendations_field_list", JSON.stringify(data.fields));
          if (data.powered_by) {
            sessionStorage.setItem("recommendations_powered_by", JSON.stringify(data.powered_by));
          }
        }
      } else {
        throw new Error("No field recommendations received");
      }
    } catch (err: any) {
      console.error("❌ Error getting field recommendations:", err);
      setError(err.message || "Failed to get field recommendations. Please try again.");
      setStep('initial'); // Reset to initial state on error
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Handle field selection - Get top 5 programs for selected field
  const handleFieldSelection = async (fieldName: string) => {
    setSelectedField(fieldName);
    setStep('programs');
    setLoading(true);
    setError(null);
    setRecommendations([]);
    setPrograms([]);

    try {
      // Get top 5 programs for selected field using OpenAI
      const { data, error: programError } = await getProgramsByField(fieldName);

      if (programError || !data) {
        throw new Error(programError || "Failed to get program recommendations");
      }

      console.log("📥 Received program recommendations for field:", fieldName);
      console.log("📊 Programs count:", data.recommendations?.length || 0);

      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
        setPoweredBy(data.powered_by || []);

        // Fetch full program details
        const programIds = data.recommendations.map((rec) => rec.program_id);
        console.log("🔍 Fetching program details for IDs:", programIds);
        const programDetails = await fetchProgramDetails(programIds);

        if (programDetails.length === 0) {
          console.error("❌ No programs found in database for IDs:", programIds);
          setError(`No programs found for the recommended IDs. This might be a data mismatch. Please try selecting a different field.`);
        } else {
          setPrograms(programDetails);
          console.log("✅ Successfully set programs:", programDetails.length);
          setStep('programs'); // Move to programs view only after successful fetch
          
          // Cache programs and recommendations for state restoration
          if (typeof window !== "undefined") {
            sessionStorage.setItem("recommendations_selected_field", fieldName);
            sessionStorage.setItem("recommendations_programs_list", JSON.stringify(programDetails));
            sessionStorage.setItem("recommendations_list", JSON.stringify(data.recommendations));
            sessionStorage.setItem("recommendations_cache_timestamp", Date.now().toString());
            if (data.powered_by) {
              sessionStorage.setItem("recommendations_powered_by", JSON.stringify(data.powered_by));
            }
          }
        }
      } else {
        console.warn("⚠️ Backend returned empty recommendations array");
        setError(`No suitable programs found for "${fieldName}". This might be because:
- No programs match your budget or location preferences
- No programs are available in this field
- The ML model found no suitable matches

Please try selecting a different field.`);
        setStep('fields'); // Stay on fields view
      }
    } catch (err: any) {
      console.error("❌ Error getting program recommendations:", err);
      setError(err.message || "Failed to get program recommendations. Please try again.");
      setStep('fields'); // Go back to field selection on error
    } finally {
      setLoading(false);
    }
  };

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
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(program.entry_requirements);
          if (typeof parsed === "object" && parsed !== null) {
            const req = parsed;
            const parts = [];
            if (req.academic) parts.push(req.academic);
            if (req.english) parts.push(req.english);
            if (req.other) parts.push(req.other);
            return parts.join(" • ") || "Not Available";
          }
        } catch {
          // If parsing fails, return the string as-is
          return program.entry_requirements;
        }
        return program.entry_requirements;
      }
      if (typeof program.entry_requirements === "object") {
        const req = program.entry_requirements;
        const parts = [];
        if (req.academic) parts.push(req.academic);
        if (req.english) parts.push(req.english);
        if (req.other) parts.push(req.other);
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

  // Get explanation for a program
  const getExplanation = (programId: number): string => {
    const recommendation = recommendations.find((r) => r.program_id === programId);
    return recommendation?.explanation || "Recommended based on your profile.";
  };

  // Helper to normalize level for filtering
  const normalizeLevel = (level: string | null): string => {
    if (!level) return "";
    const lower = level.toLowerCase();
    if (lower === "foundation" || lower === "Foundation") return "foundation";
    if (lower === "diploma" || lower === "Diploma") return "diploma";
    if (lower === "degree" || lower === "bachelor" || lower === "Bachelor")
      return "degree";
    return lower;
  };

  // Filter programs based on search and filter
  const filteredPrograms = programs.filter((program) => {
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

  // Pagination
  const programsPerPage = 6;
  const totalPages = Math.ceil(filteredPrograms.length / programsPerPage);
  const paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * programsPerPage,
    currentPage * programsPerPage
  );

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
                AI-Powered Program Recommendations
              </h2>
              <p className="text-muted-foreground">
                Get personalized recommendations based on your profile
              </p>
            </div>
          </div>
        </div>

        {/* Initial State - Before Start */}
        {step === 'initial' && (
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-8 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  Ready to Discover Your Perfect Program?
                </h3>
                <p className="text-muted-foreground text-lg mb-2">
                  Click below to generate personalized recommendations based on your
                  academic profile and preferences.
                </p>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes your SPM/STPM results, interests, and career goals
                  to find the best matching programs from Malaysian universities.
                </p>
              </div>
              <Button
                onClick={handleStartRecommendation}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start AI Recommendation
              </Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-8">
            <div className="text-center space-y-4">
              <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-lg font-medium text-foreground mb-2">
                  {step === 'fields' 
                    ? 'Analyzing your profile and identifying suitable fields...'
                    : 'Analyzing programs for your selected field...'}
                </p>
                <p className="text-sm text-muted-foreground">
                  This may take a few moments
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 1: Field Recommendations View */}
        {step === 'fields' && !loading && !error && fieldRecommendations.length > 0 && (
          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Recommended Fields Based on Your Profile
                </h2>
                <p className="text-muted-foreground">
                  Based on your academic results, interests, and skills, here are the top 5 fields that match your profile best.
                  Click on a field to see the top 5 recommended programs.
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Percentages show the distribution of match strength across the top 5 fields (totals 100%).
                </p>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-7xl mx-auto">
                {(() => {
                  // Get top 5 fields (backend already normalizes to sum to 100%)
                  const top5Fields = fieldRecommendations.slice(0, 5);
                  
                  // Backend already provides normalized probabilities that sum to 100%
                  // Just convert to percentage for display
                  const fieldsWithPercentage = top5Fields.map(field => ({
                    ...field,
                    percentage: Math.round(field.probability * 100), // Backend probability is already normalized
                  }));

                  return fieldsWithPercentage.map((field, idx) => (
                    <Card
                      key={field.field_name}
                      className="backdrop-blur-xl bg-white/40 border-white/20 shadow-md hover:shadow-lg transition-all cursor-pointer hover:border-purple-300"
                      onClick={() => handleFieldSelection(field.field_name)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className="bg-purple-500/20 text-purple-700 border-purple-200/30">
                            #{idx + 1}
                          </Badge>
                          <Badge className="bg-green-500/20 text-green-700 border-green-200/30">
                            {field.percentage}% Match
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {field.field_name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                          <span>Click to see top 5 programs</span>
                        </div>
                      </div>
                    </Card>
                  ));
                })()}
              </div>

              {poweredBy.length > 0 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Powered by: {poweredBy.join(', ')}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="backdrop-blur-xl bg-red-50/40 border-red-200/20 shadow-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Error Generating Recommendations
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleStartRecommendation}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Recommendation
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Empty Result State - Programs */}
        {step === 'programs' &&
          !loading &&
          !error &&
          recommendations.length === 0 && (
            <>
              {/* Back Button */}
              <div className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep('fields')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Field Selection
                </Button>
              </div>
              <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-8 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No Suitable Programs Found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      We couldn't find programs that match your current profile and
                      preferences. Try updating your preferences or profile information.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => setStep('fields')}
                      variant="outline"
                      className="backdrop-blur-sm"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Fields
                    </Button>
                    <Button asChild variant="outline" className="backdrop-blur-sm">
                      <Link href="/student/profile">
                        Edit Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}

        {/* Results Section - Only show if we have results */}
        {step === 'programs' &&
          !loading &&
          !error &&
          recommendations.length > 0 && (
            <>
              {/* Back Button */}
              <div className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep('fields')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Field Selection
                </Button>
              </div>

              {/* Powered By Badge and Debug Toggle */}
              <div className="flex items-center justify-between mb-4">
                {poweredBy.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Powered by:</span>
                    {poweredBy.map((source, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs backdrop-blur-sm"
                      >
                        {source}
                      </Badge>
                    ))}
                  </div>
                )}
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
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 backdrop-blur-sm bg-white/50 border-white/30"
                    />
                  </div>
                </div>
                {canCompare && (
                  <Link 
                    href={`/student/compare?ids=${selectedPrograms.join(',')}`}
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem(COMPARE_NAVIGATION_FLAG, "true");
                      }
                    }}
                  >
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all">
                      <Scale className="w-4 h-4 mr-2" />
                      Compare Now ({selectedPrograms.length})
                    </Button>
                  </Link>
                )}
                <div className="flex gap-2">
                  <Button
                    variant={selectedFilter === "all" ? "default" : "outline"}
                    onClick={() => {
                      setSelectedFilter("all");
                      setCurrentPage(1);
                    }}
                    size="sm"
                  >
                    All Programs
                  </Button>
                  <Button
                    variant={selectedFilter === "degree" ? "default" : "outline"}
                    onClick={() => {
                      setSelectedFilter("degree");
                      setCurrentPage(1);
                    }}
                    size="sm"
                  >
                    Bachelors
                  </Button>
                  <Button
                    variant={selectedFilter === "diploma" ? "default" : "outline"}
                    onClick={() => {
                      setSelectedFilter("diploma");
                      setCurrentPage(1);
                    }}
                    size="sm"
                  >
                    Diploma
                  </Button>
                  <Button
                    variant={selectedFilter === "foundation" ? "default" : "outline"}
                    onClick={() => {
                      setSelectedFilter("foundation");
                      setCurrentPage(1);
                    }}
                    size="sm"
                  >
                    Foundation
                  </Button>
                </div>
              </div>

              {/* Recommendations List */}
              <div className="space-y-6">
                {filteredPrograms.length === 0 ? (
                  <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg p-6 text-center">
                    <p className="text-muted-foreground">
                      No programs match your search or filters. Try adjusting your
                      criteria.
                    </p>
                  </Card>
                ) : (
                  paginatedPrograms.map((program) => {
                    const recommendation = recommendations.find(
                      (r) => r.program_id === program.id
                    );
                    const rank = recommendation?.rank || 999;
                    const explanation = recommendation?.explanation || "";
                    const tags = getTags(program);
                    
                    return (
                      <Card
                        key={program.id}
                        className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg overflow-hidden"
                      >
                        <div className="p-6">
                          {/* Header with Rank and Match Score */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <Badge className="bg-purple-500/20 text-purple-700 border-purple-200/30">
                                  #{rank}
                                </Badge>
                                <h3 className="text-xl font-semibold text-foreground">
                                  {program.name}
                                </h3>
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

                          {/* AI Explanation and Reasons */}
                          {(explanation || recommendation?.reasons) && (
                            <div className="mb-4 p-3 bg-purple-50/50 border border-purple-200/30 rounded-lg">
                              {explanation && (
                                <p className="text-sm text-purple-900 mb-2">
                                  <strong>Why this program:</strong> {explanation}
                                </p>
                              )}
                              {recommendation?.reasons && recommendation.reasons.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-semibold text-purple-800 mb-1">
                                    Key Match Factors:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {recommendation.reasons
                                      .filter((reason) => !reason.includes("ML model confidence"))
                                      .map((reason, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-xs bg-purple-100/50 text-purple-800 border-purple-200/30"
                                        >
                                          {reason}
                                        </Badge>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

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
                          <div className="grid md:grid-cols-4 gap-4 mb-6">
                            <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-2 border-gray-300 dark:border-white/20 rounded-lg p-4 text-center shadow-sm">
                              <p className="text-lg font-bold text-foreground">
                                {program.tuition_fee_amount 
                                  ? `${program.currency === 'MYR' ? 'RM' : program.currency} ${program.tuition_fee_amount.toLocaleString()}`
                                  : 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">per {program.tuition_fee_period || 'semester'}</p>
                            </div>
                            <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-2 border-gray-300 dark:border-white/20 rounded-lg p-4 text-center shadow-sm">
                              <p className="text-lg font-bold text-foreground">{formatDuration(program)}</p>
                              <p className="text-xs text-muted-foreground mt-1">duration</p>
                            </div>
                            <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-2 border-gray-300 dark:border-white/20 rounded-lg p-4 text-center shadow-sm">
                              <div className="min-h-[2rem] flex items-center justify-center mb-1">
                                {program.start_month ? (
                                  <div className="flex flex-wrap gap-1 justify-center items-center">
                                    {program.start_month.split(',').map((month, idx) => (
                                      <Badge 
                                        key={idx} 
                                        variant="secondary" 
                                        className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                                      >
                                        {month.trim()}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-lg font-bold text-foreground">N/A</p>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">start date</p>
                            </div>
                            <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-2 border-gray-300 dark:border-white/20 rounded-lg p-4 text-center shadow-sm">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                <Calendar className="w-4 h-4 text-orange-600" />
                                <p className="text-sm font-bold text-foreground">
                                  {program.deadline
                                    ? new Date(program.deadline).toLocaleDateString()
                                    : "N/A"}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">deadline</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button
                              asChild
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Link 
                                href={`/student/program/${program.id}`}
                                onClick={() => {
                                  // Store referrer so back button knows where to go
                                  if (typeof window !== "undefined") {
                                    sessionStorage.setItem("program_detail_referrer", "/student/recommendations");
                                  }
                                }}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              className={`backdrop-blur-sm ${
                                isItemSaved("program", program.id)
                                  ? "bg-red-100 border-red-500 text-red-700"
                                  : "bg-white/50"
                              }`}
                              onClick={async () => {
                                await toggleSave("program", program.id);
                              }}
                            >
                              <Heart
                                className={`w-4 h-4 mr-2 ${
                                  isItemSaved("program", program.id)
                                    ? "fill-current"
                                    : ""
                                }`}
                              />
                              {isItemSaved("program", program.id) ? "Saved" : "Save"}
                            </Button>
                            <Button
                              variant="outline"
                              className={`backdrop-blur-sm ${
                                isSelected(program.id)
                                  ? "bg-blue-100 border-blue-500 text-blue-700"
                                  : "bg-white/50"
                              }`}
                              onClick={() => addProgram(program.id)}
                            >
                              <Scale className="w-4 h-4 mr-2" />
                              {isSelected(program.id) ? "Selected" : "Compare"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {filteredPrograms.length > 0 && totalPages > 1 && (
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
              {filteredPrograms.length > 0 && (
                <div className="text-center text-sm text-muted-foreground mt-4">
                  Showing {(currentPage - 1) * programsPerPage + 1} -{" "}
                  {Math.min(
                    currentPage * programsPerPage,
                    filteredPrograms.length
                  )}{" "}
                  of {filteredPrograms.length} programs
                </div>
              )}

              {/* Re-run Button */}
              <div className="text-center pt-4">
                <Button
                  onClick={handleStartRecommendation}
                  variant="outline"
                  className="backdrop-blur-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-run Recommendation
                </Button>
              </div>
            </>
          )}
      </div>
    </StudentLayout>
  );
}
