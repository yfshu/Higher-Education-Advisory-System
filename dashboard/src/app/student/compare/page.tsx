"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  GraduationCap,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Users,
  Award,
  Book,
  CheckCircle,
  Calendar,
  ExternalLink,
  Download,
  Loader2,
} from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";
import { toast } from "sonner";
import AIComparisonCard from "@/components/compare/AIComparisonCard";
import { exportComparisonToPdf } from "@/utils/exportToPdf";

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
  entry_requirements: Record<string, any> | string | null;
  curriculum: Array<{ year: number; subjects: string[] }> | Record<string, unknown> | string | null;
  career_outcomes: Array<{ role: string; percentage: number }> | string | null;
  facilities: string[] | Record<string, string[]> | string | null;
  employment_rate: number | null;
  average_salary: number | null;
  satisfaction_rate: number | null;
  university: {
    id: number;
    name: string;
    city: string | null;
    state: string | null;
  } | null;
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCompare, removeProgram } = useCompare();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiExplanation, setAIExplanation] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError(null);

        const idsParam = searchParams.get("ids");
        if (!idsParam) {
          setError("No programs selected for comparison");
          setLoading(false);
          return;
        }

        const ids = idsParam.split(",").map((id) => parseInt(id.trim())).filter(Boolean);
        
        if (ids.length !== 2) {
          setError("Please select exactly 2 programs to compare");
          setLoading(false);
          return;
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
        
        // Fetch both programs
        const [program1Response, program2Response] = await Promise.all([
          fetch(`${backendUrl}/api/programs/${ids[0]}`),
          fetch(`${backendUrl}/api/programs/${ids[1]}`),
        ]);

        if (!program1Response.ok || !program2Response.ok) {
          throw new Error("Failed to fetch one or more programs");
        }

        const [program1Result, program2Result] = await Promise.all([
          program1Response.json(),
          program2Response.json(),
        ]);

        if (!program1Result.success || !program2Result.success) {
          throw new Error("Invalid response format");
        }

        setPrograms([program1Result.data, program2Result.data]);
      } catch (err) {
        console.error("Error fetching programs:", err);
        setError(err instanceof Error ? err.message : "Failed to load programs");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [searchParams]);

  const getLevelDisplay = (level: string | null): string => {
    if (!level) return "N/A";
    const levelMap: Record<string, string> = {
      foundation: "Foundation",
      diploma: "Diploma",
      degree: "Degree",
      bachelor: "Bachelor",
    };
    return levelMap[level.toLowerCase()] || level;
  };

  const formatCurrency = (amount: number | null, currency: string | null, period: string | null): string => {
    if (!amount) return "—";
    const currencySymbol = currency === "MYR" ? "RM" : currency || "";
    const periodText = period ? ` per ${period}` : "";
    return `${currencySymbol} ${amount.toLocaleString()}${periodText}`;
  };

  const formatDuration = (program: Program): string => {
    if (program.duration) return program.duration;
    if (program.duration_months) {
      const years = Math.floor(program.duration_months / 12);
      const months = program.duration_months % 12;
      if (years > 0 && months > 0) {
        return `${years} year${years > 1 ? "s" : ""} ${months} month${months > 1 ? "s" : ""}`;
      } else if (years > 0) {
        return `${years} year${years > 1 ? "s" : ""}`;
      } else {
        return `${months} month${months > 1 ? "s" : ""}`;
      }
    }
    return "—";
  };

  const getLocation = (program: Program): string => {
    if (!program.university) return "—";
    const parts = [program.university.city, program.university.state].filter(Boolean);
    return parts.length > 0 ? `${parts.join(", ")}, Malaysia` : "Malaysia";
  };

  const parseEntryRequirements = (requirements: Record<string, any> | string | null): string => {
    if (!requirements) return "—";
    try {
      let parsed: any = requirements;
      if (typeof requirements === "string") {
        parsed = JSON.parse(requirements);
      }
      
      if (typeof parsed === "object" && parsed !== null) {
        const formatValue = (value: any, indent: number = 0): string => {
          if (value === null || value === undefined) return "";
          if (typeof value === "string") return value;
          if (typeof value === "number") return String(value);
          if (typeof value === "boolean") return String(value);
          if (Array.isArray(value)) {
            return value.map(v => formatValue(v, indent + 1)).filter(Boolean).join(", ");
          }
          if (typeof value === "object") {
            // Handle nested objects - format as key: value pairs
            const entries = Object.entries(value)
              .map(([k, v]) => {
                const formatted = formatValue(v, indent + 1);
                if (formatted) {
                  // Capitalize key and format value
                  const keyFormatted = k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                  return `${keyFormatted}: ${formatted}`;
                }
                return k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
              })
              .filter(Boolean);
            return entries.join("; ");
          }
          return "";
        };

        const formatted = Object.entries(parsed)
          .map(([key, value]) => {
            const keyFormatted = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
            const formattedValue = formatValue(value);
            if (formattedValue) {
              return `${keyFormatted}: ${formattedValue}`;
            }
            return keyFormatted;
          })
          .filter(Boolean)
          .join(" • ");
        
        return formatted || "—";
      }
      return String(parsed);
    } catch (e) {
      console.error("Error parsing entry requirements:", e);
      return "—";
    }
  };

  const parseCurriculum = (curriculum: Array<{ year: number; subjects: string[] }> | Record<string, unknown> | string | null): string[] => {
    if (!curriculum) return [];
    try {
      let parsed: any = curriculum;
      if (typeof curriculum === "string") {
        parsed = JSON.parse(curriculum);
      }
      if (Array.isArray(parsed)) {
        return parsed.flatMap((item) => {
          if (typeof item === "object" && item !== null && "subjects" in item) {
            return item.subjects || [];
          }
          return [];
        });
      }
      if (typeof parsed === "object" && !Array.isArray(parsed)) {
        return Object.values(parsed).flatMap((value) => {
          if (Array.isArray(value)) return value;
          return [];
        });
      }
      return [];
    } catch {
      return [];
    }
  };

  const parseCareerOutcomes = (outcomes: Array<{ role: string; percentage: number }> | string | null): string[] => {
    if (!outcomes) return [];
    try {
      let parsed: any = outcomes;
      if (typeof outcomes === "string") {
        parsed = JSON.parse(outcomes);
      }
      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "object" && item !== null) {
            return item.role || item.name || "Career Outcome";
          }
          return "Career Outcome";
        });
      }
      return [];
    } catch {
      return [];
    }
  };

  const parseFacilities = (facilities: string[] | Record<string, string[]> | string | null): string[] => {
    if (!facilities) return [];
    try {
      let parsed: any = facilities;
      if (typeof facilities === "string") {
        parsed = JSON.parse(facilities);
      }
      if (Array.isArray(parsed)) {
        return parsed.map((f) => String(f));
      }
      if (typeof parsed === "object" && !Array.isArray(parsed)) {
        return Object.values(parsed).flatMap((value) => {
          if (Array.isArray(value)) return value.map((v) => String(v));
          return [];
        });
      }
      return [];
    } catch {
      return [];
    }
  };

  const handleClearComparison = () => {
    clearCompare();
    // Navigation will happen via Link href
  };

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      await exportComparisonToPdf('comparison-content', {
        programA: programA,
        programB: programB,
        includeAIExplanation: !!aiExplanation,
        aiExplanation: aiExplanation,
      });
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleAIExplanationGenerated = (explanation: string) => {
    setAIExplanation(explanation);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading programs for comparison...</p>
        </div>
      </div>
    );
  }

  if (error || programs.length !== 2) {
    return (
      <Card className="backdrop-blur-xl bg-red-50/40 border-red-200/20 shadow-lg p-6">
        <p className="text-red-700 mb-4">
          {error || "Please select exactly 2 programs to compare"}
        </p>
        <div className="flex gap-3">
          <Button onClick={() => router.push("/student/search")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
          <Button onClick={handleClearComparison} variant="outline">
            Clear Selection
          </Button>
        </div>
      </Card>
    );
  }

  if (programs.length !== 2) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          {loading ? (
            <>
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading programs...</p>
            </>
          ) : error ? (
            <>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={() => router.push("/student/search")} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Search
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">Please select exactly 2 programs to compare</p>
          )}
        </div>
      </div>
    );
  }

  const [programA, programB] = programs;

  const comparisonSections = [
    {
      title: "Basic Info",
      fields: [
        {
          label: "Program Name",
          getValue: (p: Program) => p.name || "—",
        },
        {
          label: "University",
          getValue: (p: Program) => p.university?.name || "—",
        },
        {
          label: "Location",
          getValue: (p: Program) => getLocation(p),
        },
        {
          label: "Level",
          getValue: (p: Program) => getLevelDisplay(p.level),
        },
      ],
    },
    {
      title: "Academic Details",
      fields: [
        {
          label: "Duration",
          getValue: (p: Program) => formatDuration(p),
        },
        {
          label: "Start Month",
          getValue: (p: Program) => p.start_month || "—",
        },
        {
          label: "Entry Requirements",
          getValue: (p: Program) => parseEntryRequirements(p.entry_requirements),
        },
        {
          label: "Curriculum",
          getValue: (p: Program) => {
            const subjects = parseCurriculum(p.curriculum);
            return subjects.length > 0 ? subjects.join(", ") : "—";
          },
        },
        {
          label: "Facilities",
          getValue: (p: Program) => {
            const facilities = parseFacilities(p.facilities);
            return facilities.length > 0 ? facilities.join(", ") : "—";
          },
        },
      ],
    },
    {
      title: "Cost & Outcomes",
      fields: [
        {
          label: "Tuition Fee",
          getValue: (p: Program) => formatCurrency(p.tuition_fee_amount, p.currency, p.tuition_fee_period),
        },
        {
          label: "Employment Rate",
          getValue: (p: Program) => p.employment_rate ? `${p.employment_rate}%` : "—",
        },
        {
          label: "Average Salary",
          getValue: (p: Program) => p.average_salary ? `RM ${p.average_salary.toLocaleString()}/month` : "—",
        },
        {
          label: "Career Outcomes",
          getValue: (p: Program) => {
            const outcomes = parseCareerOutcomes(p.career_outcomes);
            return outcomes.length > 0 ? outcomes.join(", ") : "—";
          },
        },
      ],
    },
    {
      title: "Ratings",
      fields: [
        {
          label: "Rating",
          getValue: (p: Program) => p.rating ? p.rating.toFixed(1) : "—",
        },
        {
          label: "Review Count",
          getValue: (p: Program) => p.review_count?.toLocaleString() || "—",
        },
        {
          label: "Satisfaction Rate",
          getValue: (p: Program) => p.satisfaction_rate ? `${p.satisfaction_rate}%` : "—",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Compare Programs</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {exportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export to PDF
              </>
            )}
          </Button>
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              handleClearComparison();
              router.push("/student/search");
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>

      {/* AI Comparison Card */}
      <AIComparisonCard 
        programA={programA} 
        programB={programB}
        onExplanationGenerated={handleAIExplanationGenerated}
      />

      {/* Sticky Header with Program Names */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-b border-gray-200 dark:border-slate-700 shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6">
          <div className="font-semibold text-foreground text-sm md:text-base hidden md:block">Program</div>
          <div className="text-center md:text-center border-b md:border-b-0 pb-3 md:pb-0">
            <div className="font-semibold text-foreground text-sm md:text-base">{programA.name}</div>
          </div>
          <div className="text-center md:text-center">
            <div className="font-semibold text-foreground text-sm md:text-base">{programB.name}</div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div id="comparison-content" className="space-y-6">
        {comparisonSections.map((section, sectionIndex) => (
          <Card
            key={sectionIndex}
            className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20 dark:border-slate-700/20 shadow-lg overflow-hidden"
          >
            <div className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 pb-3 border-b border-gray-200 dark:border-slate-700">
                {section.title}
              </h2>
              <div className="space-y-3 md:space-y-4">
                {section.fields.map((field, fieldIndex) => {
                  const valueA = field.getValue(programA);
                  const valueB = field.getValue(programB);
                  const isDifferent = valueA !== valueB;
                  
                  return (
                    <div
                      key={fieldIndex}
                      className={`grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 p-3 md:p-4 rounded-lg transition-colors ${
                        isDifferent ? "bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30" : "bg-gray-50/30 dark:bg-slate-800/30 border border-transparent"
                      }`}
                    >
                      <div className="font-semibold text-foreground text-sm md:text-base flex items-start gap-2 pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700 md:pr-4">
                        {field.label}
                      </div>
                      <div className={`text-sm md:text-base ${isDifferent ? "text-blue-700 dark:text-blue-400 font-semibold" : "text-foreground"} break-words leading-relaxed pl-2 md:pl-0`}>
                        <div className="font-medium text-xs text-muted-foreground mb-1 md:hidden">{programA.name}</div>
                        {typeof valueA === 'string' ? valueA : String(valueA)}
                      </div>
                      <div className={`text-sm md:text-base ${isDifferent ? "text-blue-700 dark:text-blue-400 font-semibold" : "text-foreground"} break-words leading-relaxed pl-2 md:pl-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-700 md:pl-4`}>
                        <div className="font-medium text-xs text-muted-foreground mb-1 md:hidden">{programB.name}</div>
                        {typeof valueB === 'string' ? valueB : String(valueB)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-6">
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto">
          <Link href={`/student/course/${programA.id}`} className="flex items-center justify-center">
            <ExternalLink className="w-4 h-4 mr-2" />
            View {programA.name.length > 30 ? programA.name.substring(0, 30) + "..." : programA.name} Details
          </Link>
        </Button>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto">
          <Link href={`/student/course/${programB.id}`} className="flex items-center justify-center">
            <ExternalLink className="w-4 h-4 mr-2" />
            View {programB.name.length > 30 ? programB.name.substring(0, 30) + "..." : programB.name} Details
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function ComparePrograms() {
  return (
    <StudentLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }>
        <CompareContent />
      </Suspense>
    </StudentLayout>
  );
}
