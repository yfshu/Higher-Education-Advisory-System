"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  MapPin,
  Calendar,
  GraduationCap,
  Clock,
  ArrowLeft,
  Edit,
  CheckCircle,
  AlertCircle,
  Users,
  Book,
  Award,
  Globe,
  Phone,
  Mail,
  DollarSign,
} from "lucide-react";

interface Program {
  id: number;
  name: string;
  level: 'foundation' | 'diploma' | 'degree' | null;
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
  entry_requirements: Record<string, string> | string | null;
  curriculum: Array<{ year: number; subjects: string[] }> | Record<string, unknown> | string | null;
  career_outcomes: Array<{ role: string; percentage: number }> | string | null;
  facilities: string[] | string | null;
  employment_rate: number | null;
  average_salary: number | null;
  satisfaction_rate: number | null;
  university: {
    id: number;
    name: string;
    city: string | null;
    state: string | null;
    email: string | null;
    phone_number: string | null;
    website_url: string | null;
  } | null;
}

export default function AdminProgramDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const programId = params?.id ?? "1";
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch program data from backend
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
        const response = await fetch(`${backendUrl}/api/programs/${programId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Program not found');
          }
          throw new Error(`Failed to fetch program: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log('✅ Program data fetched:', result.data);
          setProgram(result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('❌ Error fetching program:', err);
        setError(err instanceof Error ? err.message : 'Failed to load program');
      } finally {
        setLoading(false);
      }
    };

    if (programId) {
      fetchProgram();
    }
  }, [programId]);

  // Helper functions - must be defined before use
  const getLevelDisplay = (level: string | null): string => {
    if (!level) return "N/A";
    const levelMap: Record<string, string> = {
      foundation: "Foundation",
      diploma: "Diploma",
      degree: "Degree",
    };
    return levelMap[level.toLowerCase()] || level;
  };

  const formatCurrency = (amount: number | null, currency: string | null): string => {
    if (!amount) return "N/A";
    const currencySymbol = currency === "MYR" ? "RM" : currency || "RM";
    return `${currencySymbol} ${amount.toLocaleString()}`;
  };

  const parseEntryRequirements = (requirements: Record<string, any> | string | null): Record<string, any> => {
    if (!requirements) return {};
    if (typeof requirements === 'string') {
      try {
        return JSON.parse(requirements);
      } catch {
        return {};
      }
    }
    return requirements;
  };

  const renderRequirementValue = (value: any): ReactNode => {
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return (
          <ul className="list-disc list-inside ml-4 space-y-1">
            {value.map((item, idx) => (
              <li key={idx} className="text-sm">
                {typeof item === 'object' ? JSON.stringify(item) : String(item)}
              </li>
            ))}
          </ul>
        );
      }
      // Handle nested objects like {cgpa, subjects}
      return (
        <div className="space-y-2 ml-4">
          {Object.entries(value).map(([nestedKey, nestedValue]) => (
            <div key={nestedKey} className="text-sm">
              <span className="font-medium capitalize">{nestedKey}:</span>{' '}
              {typeof nestedValue === 'object' && nestedValue !== null
                ? JSON.stringify(nestedValue)
                : String(nestedValue)}
            </div>
          ))}
        </div>
      );
    }
    return String(value);
  };

  const parseCurriculum = (curriculum: Array<{ year: number; subjects: string[] }> | Record<string, unknown> | string | null): Array<{ year: number; subjects: string[] }> => {
    if (!curriculum) {
      console.log('🔍 parseCurriculum: No curriculum data');
      return [];
    }
    
    console.log('🔍 parseCurriculum: Raw input type:', typeof curriculum);
    console.log('🔍 parseCurriculum: Raw input:', curriculum);
    
    let parsedData: any = curriculum;
    
    // Handle string (JSON)
    if (typeof curriculum === 'string') {
      try {
        parsedData = JSON.parse(curriculum);
        console.log('🔍 parseCurriculum: Parsed from string:', parsedData);
      } catch (error) {
        console.error('🔍 parseCurriculum: JSON parse error:', error);
        return [];
      }
    }
    
    // Handle array format: [{year: 1, subjects: [...]}, ...]
    if (Array.isArray(parsedData)) {
      console.log('🔍 parseCurriculum: Input is array, length:', parsedData.length);
      return parsedData;
    }
    
    // Handle object format: {year_1: [...], year_2: [...], ...}
    if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
      console.log('🔍 parseCurriculum: Input is object, converting to array format');
      const converted: Array<{ year: number; subjects: string[] }> = [];
      
      // Get all keys and sort them
      const keys = Object.keys(parsedData).sort();
      
      for (const key of keys) {
        const value = parsedData[key];
        
        // Extract year number from key (year_1 -> 1, year_2 -> 2, etc.)
        const yearMatch = key.match(/year[_\s]*(\d+)/i);
        const year = yearMatch ? parseInt(yearMatch[1], 10) : parseInt(key.replace(/\D/g, '')) || converted.length + 1;
        
        // Handle subjects array
        if (Array.isArray(value)) {
          converted.push({
            year,
            subjects: value.map(s => String(s)),
          });
        } else if (typeof value === 'string') {
          // If it's a string, try to parse it or split by comma
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              converted.push({
                year,
                subjects: parsed.map(s => String(s)),
              });
            }
          } catch {
            // If parsing fails, treat as comma-separated string
            converted.push({
              year,
              subjects: value.split(',').map(s => s.trim()).filter(Boolean),
            });
          }
        }
      }
      
      console.log('🔍 parseCurriculum: Converted result:', converted);
      return converted;
    }
    
    console.log('🔍 parseCurriculum: Unknown format, returning empty array');
    return [];
  };

  const parseCareerOutcomes = (outcomes: Array<{ role: string; percentage: number }> | Record<string, any> | string | null): Array<{ role: string; percentage: number }> => {
    if (!outcomes) {
      console.log('🔍 parseCareerOutcomes: No outcomes data');
      return [];
    }
    
    console.log('🔍 parseCareerOutcomes: Raw input type:', typeof outcomes);
    console.log('🔍 parseCareerOutcomes: Raw input:', outcomes);
    
    let extractedArray: any[] = [];
    
    // Handle array directly (most common case)
    if (Array.isArray(outcomes)) {
      console.log('🔍 parseCareerOutcomes: Input is array, length:', outcomes.length);
      extractedArray = outcomes;
    }
    // Handle string (JSON)
    else if (typeof outcomes === 'string') {
      try {
        const parsed = JSON.parse(outcomes);
        console.log('🔍 parseCareerOutcomes: Parsed from string:', parsed);
        
        if (Array.isArray(parsed)) {
          extractedArray = parsed;
        } else if (parsed && typeof parsed === 'object' && 'outcomes' in parsed && Array.isArray(parsed.outcomes)) {
          extractedArray = parsed.outcomes;
        } else if (parsed && typeof parsed === 'object') {
          // Try to find any array in the object
          const keys = Object.keys(parsed);
          for (const key of keys) {
            if (Array.isArray(parsed[key])) {
              extractedArray = parsed[key];
              break;
            }
          }
        }
      } catch (error) {
        console.error('🔍 parseCareerOutcomes: JSON parse error:', error);
        return [];
      }
    }
    // Handle object (might be wrapped in {outcomes: [...]})
    else if (typeof outcomes === 'object' && outcomes !== null) {
      console.log('🔍 parseCareerOutcomes: Processing object');
      
      if ('outcomes' in outcomes && Array.isArray(outcomes.outcomes)) {
        extractedArray = outcomes.outcomes;
      } else {
        // Check if object values are arrays
        const keys = Object.keys(outcomes);
        for (const key of keys) {
          if (Array.isArray(outcomes[key])) {
            extractedArray = outcomes[key];
            break;
          }
        }
      }
    }
    
    // Now convert the extracted array to the expected format
    if (extractedArray.length === 0) {
      console.log('🔍 parseCareerOutcomes: No array extracted');
      return [];
    }
    
    console.log('🔍 parseCareerOutcomes: Extracted array:', extractedArray);
    console.log('🔍 parseCareerOutcomes: First item type:', typeof extractedArray[0]);
    
    // Check if array items are strings (like ["Chartered Accountant", ...])
    if (typeof extractedArray[0] === 'string') {
      console.log('🔍 parseCareerOutcomes: Converting string array to role objects');
      // Convert string array to objects with role and default percentage
      const converted = extractedArray.map((role, index) => ({
        role: role,
        percentage: 100 / extractedArray.length, // Distribute evenly
      }));
      console.log('🔍 parseCareerOutcomes: Converted result:', converted);
      return converted;
    }
    
    // Check if array items are objects with role/percentage
    if (typeof extractedArray[0] === 'object' && extractedArray[0] !== null) {
      // Validate and convert to expected format
      const converted = extractedArray.map((item, index) => {
        if (item && typeof item === 'object') {
          return {
            role: item.role || item.name || `Career ${index + 1}`,
            percentage: typeof item.percentage === 'number' ? item.percentage : 0,
          };
        }
        return {
          role: `Career ${index + 1}`,
          percentage: 0,
        };
      });
      console.log('🔍 parseCareerOutcomes: Converted object array:', converted);
      return converted;
    }
    
    console.log('🔍 parseCareerOutcomes: Unknown array item format');
    return [];
  };

  const parseFacilities = (facilities: string[] | string | null): string[] => {
    if (!facilities) return [];
    if (typeof facilities === 'string') {
      try {
        const parsed = JSON.parse(facilities);
        if (Array.isArray(parsed)) return parsed;
        return [];
      } catch {
        return facilities.split(',').map(f => f.trim());
      }
    }
    return facilities;
  };

  // Parse data (only if program exists) - must be before early returns for hooks order
  const entryRequirements = program ? parseEntryRequirements(program.entry_requirements) : {};
  const curriculum = program ? parseCurriculum(program.curriculum) : [];
  const careerOutcomes = program ? parseCareerOutcomes(program.career_outcomes) : [];
  const facilities = program ? parseFacilities(program.facilities) : [];
  const tags = program?.tags || [];

  // Debug: Log career outcomes - must be before early returns for hooks order
  useEffect(() => {
    if (program?.career_outcomes !== undefined) {
      console.log('🔍 [Career Outcomes Debug]');
      console.log('  Raw type:', typeof program.career_outcomes);
      console.log('  Raw value:', program.career_outcomes);
      console.log('  Parsed length:', careerOutcomes.length);
      console.log('  Parsed value:', careerOutcomes);
    }
  }, [program?.career_outcomes, careerOutcomes]);

  if (loading) {
    return (
      <AdminLayout title="Program Details">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading program details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !program) {
    return (
      <AdminLayout title="Program Details">
        <Card className="p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Program</h3>
            <p className="text-muted-foreground mb-4">{error || "Program not found"}</p>
            <Button onClick={() => router.push('/admin/programs')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Button>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Program Details">
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/programs')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Programs
          </Button>
          <Button
            onClick={() => router.push(`/admin/programs?edit=${program.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Program
          </Button>
        </div>

        {/* Program Header */}
        <Card className="p-6 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {program.name}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-sm">
                      {getLevelDisplay(program.level)}
                    </Badge>
                    {program.university && (
                      <Badge variant="outline" className="text-sm">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        {program.university.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {program.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {program.description}
                </p>
              )}

              {/* Key Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {program.duration_months && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{program.duration_months} months</span>
                  </div>
                )}
                {program.tuition_fee_amount && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-muted-foreground">Tuition:</span>
                    <span className="font-medium">
                      {formatCurrency(program.tuition_fee_amount, program.currency)}
                      {program.tuition_fee_period && ` / ${program.tuition_fee_period}`}
                    </span>
                  </div>
                )}
                {program.university && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">
                      {program.university.city || "N/A"}
                      {program.university.state && `, ${program.university.state}`}
                    </span>
                  </div>
                )}
                {program.deadline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="font-medium">
                      {new Date(program.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs for Detailed Information */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="careers">Career Outcomes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20">
              <h3 className="text-xl font-semibold mb-4">Program Overview</h3>
              {program.description ? (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {program.description}
                </p>
              ) : (
                <p className="text-muted-foreground">No description available.</p>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {program.employment_rate !== null && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Employment Rate</div>
                    <div className="text-2xl font-bold text-blue-600">{program.employment_rate}%</div>
                  </div>
                )}
                {program.average_salary !== null && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Average Salary</div>
                    <div className="text-2xl font-bold text-green-600">
                      RM {program.average_salary.toLocaleString()}
                    </div>
                  </div>
                )}
                {program.satisfaction_rate !== null && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Satisfaction Rate</div>
                    <div className="text-2xl font-bold text-purple-600">{program.satisfaction_rate}%</div>
                  </div>
                )}
              </div>

              {/* Facilities */}
              {facilities.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Facilities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {facilities.map((facility, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum" className="space-y-4">
            <Card className="p-6 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20">
              <h3 className="text-xl font-semibold mb-4">Curriculum</h3>
              {curriculum.length > 0 ? (
                <div className="space-y-4">
                  {curriculum.map((year, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-4">
                      <h4 className="font-semibold mb-2">Year {year.year}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {year.subjects.map((subject, subIndex) => (
                          <li key={subIndex} className="text-sm text-gray-700 dark:text-gray-300">
                            {subject}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No curriculum information available.</p>
              )}
            </Card>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-4">
            <Card className="p-6 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20">
              <h3 className="text-xl font-semibold mb-4">Entry Requirements</h3>
              {Object.keys(entryRequirements).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(entryRequirements).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                      <div className="font-semibold text-sm mb-1 capitalize">
                        {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {renderRequirementValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No entry requirements specified.</p>
              )}
            </Card>
          </TabsContent>

          {/* Career Outcomes Tab */}
          <TabsContent value="careers" className="space-y-4">
            <Card className="p-6 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20">
              <h3 className="text-xl font-semibold mb-4">Career Outcomes</h3>
              {careerOutcomes.length > 0 ? (
                <div className="space-y-2">
                  {careerOutcomes.map((outcome, index) => {
                    // Safely extract role
                    const role = outcome?.role || 'Unknown Role';
                    
                    // Only render if we have valid data
                    if (!role || role === 'Unknown Role') return null;
                    
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{role}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No career outcome data available.</p>
                  {program.career_outcomes && (
                    <details className="mt-4 text-left max-w-2xl mx-auto">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        🔍 Debug: Show Raw Data
                      </summary>
                      <div className="mt-2 space-y-2">
                        <div className="text-xs text-muted-foreground">
                          <strong>Type:</strong> {typeof program.career_outcomes}
                        </div>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-60">
                          {typeof program.career_outcomes === 'string' 
                            ? program.career_outcomes 
                            : JSON.stringify(program.career_outcomes, null, 2)}
                        </pre>
                        <div className="text-xs text-muted-foreground">
                          <strong>Parsed Length:</strong> {careerOutcomes.length}
                        </div>
                        {careerOutcomes.length > 0 && (
                          <pre className="text-xs bg-blue-50 dark:bg-blue-900/20 p-3 rounded overflow-auto max-h-60">
                            {JSON.stringify(careerOutcomes, null, 2)}
                          </pre>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* University Information */}
        {program.university && (
          <Card className="p-6 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20">
            <h3 className="text-xl font-semibold mb-4">University Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">{program.university.name}</h4>
                <div className="space-y-2 text-sm">
                  {program.university.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {program.university.city}
                        {program.university.state && `, ${program.university.state}`}
                      </span>
                    </div>
                  )}
                  {program.university.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`mailto:${program.university.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {program.university.email}
                      </a>
                    </div>
                  )}
                  {program.university.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`tel:${program.university.phone_number}`}
                        className="text-blue-600 hover:underline"
                      >
                        {program.university.phone_number}
                      </a>
                    </div>
                  )}
                  {program.university.website_url && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={program.university.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

