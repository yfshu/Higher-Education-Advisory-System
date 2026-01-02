"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import StudentLayout from "@/components/layout/StudentLayout";
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
  Heart,
  Share2,
  CheckCircle,
  AlertCircle,
  Users,
  Book,
  Award,
  Globe,
  Phone,
  Mail
} from "lucide-react";
import { useSavedItems } from "@/hooks/useSavedItems";

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

export default function ProgramDetail() {
  const params = useParams<{ id: string }>();
  const programId = params?.id ?? "1";
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isItemSaved, toggleSave } = useSavedItems();
  
  const saved = program ? isItemSaved('program', program.id) : false;

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

  // Helper functions
  const getLevelDisplay = (level: string | null): string => {
    if (!level) return 'N/A';
    // Handle both database values ('Foundation', 'Diploma', 'Bachelor') and lowercase
    const levelMap: Record<string, string> = {
      'foundation': 'Foundation',
      'Foundation': 'Foundation',
      'diploma': 'Diploma',
      'Diploma': 'Diploma',
      'degree': 'Bachelor',
      'Bachelor': 'Bachelor'
    };
    return levelMap[level] || level.charAt(0).toUpperCase() + level.slice(1);
  };

  const formatDuration = (): string => {
    if (!program) return 'Not Available';
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

  const getLocation = (): string => {
    if (!program?.university) return 'Not Available';
    const parts = [program.university.city, program.university.state].filter(Boolean);
    return parts.length > 0 ? `${parts.join(', ')}, Malaysia` : 'Malaysia';
  };

  const getTags = (): string[] => {
    if (!program?.tags) return [];
    try {
      if (Array.isArray(program.tags)) return program.tags;
      if (typeof program.tags === 'string') return JSON.parse(program.tags);
      return [];
    } catch {
      return [];
    }
  };

  const getEntryRequirements = (): Record<string, string> => {
    if (!program?.entry_requirements) return {};
    try {
      if (typeof program.entry_requirements === 'string') {
        return JSON.parse(program.entry_requirements);
      }
      if (typeof program.entry_requirements === 'object') {
        return program.entry_requirements;
      }
      return {};
    } catch {
      return {};
    }
  };

  const getCurriculum = (): Array<{ year: number; subjects: string[] }> => {
    if (!program?.curriculum) {
      console.log('🔍 getCurriculum: No curriculum data');
      return [];
    }
    
    console.log('🔍 getCurriculum: Raw input type:', typeof program.curriculum);
    console.log('🔍 getCurriculum: Raw input:', program.curriculum);
    
    let parsedData: any = program.curriculum;
    
    // Handle string (JSON)
    if (typeof program.curriculum === 'string') {
      try {
        parsedData = JSON.parse(program.curriculum);
        console.log('🔍 getCurriculum: Parsed from string:', parsedData);
      } catch (error) {
        console.error('🔍 getCurriculum: JSON parse error:', error);
        return [];
      }
    }
    
    // Handle array format: [{year: 1, subjects: [...]}, ...]
    if (Array.isArray(parsedData)) {
      console.log('🔍 getCurriculum: Input is array, length:', parsedData.length);
      return parsedData;
    }
    
    // Handle object format: {year_1: [...], year_2: [...], ...}
    if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
      console.log('🔍 getCurriculum: Input is object, converting to array format');
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
      
      console.log('🔍 getCurriculum: Converted result:', converted);
      return converted;
    }
    
    console.log('🔍 getCurriculum: Unknown format, returning empty array');
    return [];
  };

  const getCareerOutcomes = (): Array<{ role: string; percentage: number }> => {
    if (!program?.career_outcomes) {
      console.log('🔍 getCareerOutcomes: No outcomes data');
      return [];
    }
    
    console.log('🔍 getCareerOutcomes: Raw input type:', typeof program.career_outcomes);
    console.log('🔍 getCareerOutcomes: Raw input:', program.career_outcomes);
    
    let extractedArray: any[] = [];
    
    // Handle array directly (most common case)
    if (Array.isArray(program.career_outcomes)) {
      console.log('🔍 getCareerOutcomes: Input is array, length:', program.career_outcomes.length);
      extractedArray = program.career_outcomes;
    }
    // Handle string (JSON)
    else if (typeof program.career_outcomes === 'string') {
      try {
        const parsed = JSON.parse(program.career_outcomes);
        console.log('🔍 getCareerOutcomes: Parsed from string:', parsed);
        
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
        console.error('🔍 getCareerOutcomes: JSON parse error:', error);
        return [];
      }
    }
    // Handle object (might be wrapped in {outcomes: [...]})
    else if (typeof program.career_outcomes === 'object' && program.career_outcomes !== null) {
      console.log('🔍 getCareerOutcomes: Processing object');
      const careerObj = program.career_outcomes as Record<string, any>;
      
      if ('outcomes' in careerObj && Array.isArray(careerObj.outcomes)) {
        extractedArray = careerObj.outcomes;
      } else {
        // Check if object values are arrays
        const keys = Object.keys(careerObj);
        for (const key of keys) {
          if (Array.isArray(careerObj[key])) {
            extractedArray = careerObj[key];
            break;
          }
        }
      }
    }
    
    // Now convert the extracted array to the expected format
    if (extractedArray.length === 0) {
      console.log('🔍 getCareerOutcomes: No array extracted');
      return [];
    }
    
    console.log('🔍 getCareerOutcomes: Extracted array:', extractedArray);
    console.log('🔍 getCareerOutcomes: First item type:', typeof extractedArray[0]);
    
    // Check if array items are strings (like ["Chartered Accountant", ...])
    if (typeof extractedArray[0] === 'string') {
      console.log('🔍 getCareerOutcomes: Converting string array to role objects');
      // Convert string array to objects with role and default percentage
      const converted = extractedArray.map((role, index) => ({
        role: role,
        percentage: 100 / extractedArray.length, // Distribute evenly
      }));
      console.log('🔍 getCareerOutcomes: Converted result:', converted);
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
      console.log('🔍 getCareerOutcomes: Converted object array:', converted);
      return converted;
    }
    
    console.log('🔍 getCareerOutcomes: Unknown array item format');
    return [];
  };

  const getFacilities = (): string[] => {
    if (!program?.facilities) return [];
    try {
      if (Array.isArray(program.facilities)) return program.facilities;
      if (typeof program.facilities === 'string') {
        return JSON.parse(program.facilities);
      }
      return [];
    } catch {
      return [];
    }
  };

  const calculateMatchPercentage = (): number => {
    // Mock calculation - in real app, this would use ML model
    return 85 + Math.floor(Math.random() * 15);
  };

  if (loading) {
    return (
      <StudentLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading program details...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !program) {
    return (
      <StudentLayout title="Error">
        <Card className="backdrop-blur-xl bg-red-50/40 border-red-200/20 shadow-lg p-6">
          <p className="text-red-700 mb-4">Error: {error || 'Program not found'}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </Card>
      </StudentLayout>
    );
  }

  const programData = {
    id: program.id,
    title: program.name,
    university: program.university?.name || 'Not Available',
    location: getLocation(),
    type: getLevelDisplay(program.level),
    duration: formatDuration(),
    tuitionFee: program.tuition_fee_amount || 0,
    startDate: program.start_month || 'Not Available',
    deadline: program.deadline || '',
    rating: program.rating || 0,
    reviews: program.review_count || 0,
    matchPercentage: calculateMatchPercentage(),
    description: program.description || 'No description available.',
    tags: getTags(),
    requirements: getEntryRequirements(),
    curriculum: getCurriculum(),
    facilities: getFacilities(),
    careerOutcomes: getCareerOutcomes(),
    employmentStats: {
      employmentRate: program.employment_rate || 0,
      averageSalary: program.average_salary || 0,
      graduateSatisfaction: program.satisfaction_rate || 0
    },
    contact: {
      admissions: program.university?.phone_number || 'Not Available',
      email: program.university?.email || 'Not Available',
      website: program.university?.website_url || 'Not Available'
    }
  };

  const handleSave = async () => {
    if (program) {
      await toggleSave('program', program.id);
    }
  };

  const handleShare = () => {
    navigator.share?.({
      title: programData.title,
      text: `Check out this ${programData.type} program at ${programData.university}`,
      url: window.location.href
    });
  };

  return (
    <StudentLayout title={programData.title}>
      <div className="space-y-6">
        {/* Program Header */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-foreground">{programData.title}</h1>
                  <Badge className="bg-green-500/20 text-green-700 border-green-200/30">
                    {programData.matchPercentage}% Match
                  </Badge>
                  <Badge variant="outline">{programData.type}</Badge>
                </div>
                
                <div className="flex items-center gap-6 text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-medium">{programData.university}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{programData.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{programData.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-medium text-foreground">{programData.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({programData.reviews} reviews)</span>
                  </div>
                </div>

                {programData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {programData.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleShare} className="backdrop-blur-sm bg-white/50">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSave}
                  className={`backdrop-blur-sm ${saved ? 'bg-red-50/50 border-red-200/30 text-red-600' : 'bg-white/50'}`}
                >
                  <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {program.tuition_fee_amount 
                    ? `${program.currency === 'MYR' ? 'RM' : program.currency} ${program.tuition_fee_amount.toLocaleString()}`
                    : 'Not Available'}
                </p>
                <p className="text-sm text-muted-foreground">per {program.tuition_fee_period || 'semester'}</p>
              </div>
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{programData.duration}</p>
                <p className="text-sm text-muted-foreground">duration</p>
              </div>
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{program.start_month || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">start date</p>
              </div>
              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <p className="text-sm font-medium text-foreground">
                    {program.deadline ? new Date(program.deadline).toLocaleDateString() : 'Not Available'}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">deadline</p>
              </div>
            </div>


          </div>
        </Card>

        {/* Program Details Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="backdrop-blur-sm bg-white/50 border border-white/20">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="careers">Career Outcomes</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Program Description</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{programData.description}</p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">Employment Rate</h4>
                    <p className="text-2xl font-bold text-blue-600">{programData.employmentStats.employmentRate}%</p>
                    <p className="text-sm text-muted-foreground">within 6 months of graduation</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">Average Salary</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {programData.employmentStats.averageSalary > 0 
                        ? `RM ${programData.employmentStats.averageSalary.toLocaleString()}`
                        : 'Not Available'}
                    </p>
                    <p className="text-sm text-muted-foreground">starting salary/month</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-foreground mb-1">Satisfaction</h4>
                    <p className="text-2xl font-bold text-purple-600">{programData.employmentStats.graduateSatisfaction}%</p>
                    <p className="text-sm text-muted-foreground">graduate satisfaction</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Course Structure</h3>
                {programData.curriculum.length > 0 ? (
                <div className="space-y-6">
                    {programData.curriculum.map((year, idx) => (
                      <div key={idx} className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <Book className="w-5 h-5 text-blue-600" />
                        Year {year.year}
                      </h4>
                        {year.subjects && year.subjects.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-2">
                            {year.subjects.map((subject: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{subject}</span>
                          </div>
                        ))}
                      </div>
                        ) : (
                          <p className="text-muted-foreground">No curriculum information available.</p>
                        )}
                    </div>
                  ))}
                </div>
                ) : (
                  <p className="text-muted-foreground">No curriculum information available.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Entry Requirements</h3>
                {Object.keys(programData.requirements).length > 0 ? (
                <div className="space-y-4">
                    {Object.entries(programData.requirements).map(([key, value]) => (
                    <div key={key} className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-foreground mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </h4>
                            <p className="text-muted-foreground">{value as string}</p>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <p className="text-muted-foreground">No entry requirements information available.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="careers" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Career Paths</h3>
                {programData.careerOutcomes.length > 0 ? (
                <div className="space-y-2">
                    {programData.careerOutcomes.map((career, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-foreground">{career.role}</span>
                    </div>
                  ))}
                </div>
                ) : (
                  <p className="text-muted-foreground">No career outcomes information available.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="facilities" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Facilities & Resources</h3>
                {programData.facilities.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3">
                    {programData.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-muted-foreground">{facility}</span>
                    </div>
                  ))}
                </div>
                ) : (
                  <p className="text-muted-foreground">No facilities information available.</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Information */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Get More Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{programData.contact.admissions}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{programData.contact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a href={programData.contact.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                    {programData.contact.website}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
