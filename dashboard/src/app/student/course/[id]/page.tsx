"use client";

import { useState, useEffect, ReactNode, useMemo } from "react";
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
  Mail,
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { useSavedItems } from "@/hooks/useSavedItems";

// Image Carousel Component
function ImageCarousel({ images, universityName }: { images: string[]; universityName: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Reset to first image when images array changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [images.length]); // Only depend on length, not the array itself

  // Auto-swipe every 3 seconds
  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [images.length, isPaused]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsPaused(true); // Pause auto-swipe when user manually navigates
    // Resume after 5 seconds
    setTimeout(() => setIsPaused(false), 5000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsPaused(true); // Pause auto-swipe when user manually navigates
    // Resume after 5 seconds
    setTimeout(() => setIsPaused(false), 5000);
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
      setIsPaused(true); // Pause auto-swipe when user manually navigates
      // Resume after 5 seconds
      setTimeout(() => setIsPaused(false), 5000);
    }
  };

  // Safety check
  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex] || images[0];

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)} // Pause on hover
      onMouseLeave={() => setIsPaused(false)} // Resume when mouse leaves
    >
      {/* Main Image Display */}
      <div className="relative backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm overflow-hidden">
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden flex items-center justify-center relative">
          <img
            key={currentIndex}
            src={currentImage}
            alt={`${universityName} Photo ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-500"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error('Failed to load image:', currentImage);
              // Show placeholder instead of hiding
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect width="800" height="450" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="18"%3EImage not available%3C/text%3E%3C/svg%3E';
              target.onerror = null; // Prevent infinite loop
            }}
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-2 justify-center overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-blue-600 ring-2 ring-blue-300'
                  : 'border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Gallery Content Component
function GalleryContent({ program }: { program: Program | null }) {
  // Parse image_urls - could be string (JSON) or array
  const imageUrls = useMemo(() => {
    let urls: string[] = [];
    if (program?.university?.image_urls) {
      if (typeof program.university.image_urls === 'string') {
        try {
          const parsed = JSON.parse(program.university.image_urls);
          urls = Array.isArray(parsed) ? parsed.filter((url: any) => url && typeof url === 'string' && url.trim() !== '') : [];
        } catch (e) {
          console.error('Error parsing image_urls JSON:', e);
          urls = [];
        }
      } else if (Array.isArray(program.university.image_urls)) {
        urls = program.university.image_urls.filter((url: any) => url && typeof url === 'string' && url.trim() !== '');
      }
    }
    return urls;
  }, [program?.university?.image_urls]);

  const logoUrl = program?.university?.logo_url;
  const hasLogo = logoUrl && typeof logoUrl === 'string' && logoUrl.trim() !== '';
  const hasImages = imageUrls.length > 0;

  if (!hasLogo && !hasImages) {
    return (
      <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            University Gallery
          </h3>
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-muted-foreground">No images available for this university.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          University Gallery
        </h3>
        
        <div className="space-y-8">
          {/* University Logo */}
          {hasLogo && (
            <div>
              <h4 className="text-base font-semibold text-foreground mb-4">University Logo</h4>
              <div className="flex justify-center">
                <div className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                  <img
                    src={logoUrl}
                    alt={`${program?.university?.name || 'University'} Logo`}
                    className="max-h-32 max-w-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error('Failed to load logo:', logoUrl);
                      // Show placeholder instead of hiding
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="14"%3ELogo%3C/text%3E%3C/svg%3E';
                      target.onerror = null; // Prevent infinite loop
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* University Images Carousel */}
          {hasImages && (
            <div>
              <h4 className="text-base font-semibold text-foreground mb-4">
                University Photos {imageUrls.length > 1 && `(${imageUrls.length} photos)`}
              </h4>
              {imageUrls.length === 1 ? (
                // Single image - no carousel needed
                <div className="flex justify-center">
                  <div className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm max-w-4xl w-full">
                                <img
                                  src={imageUrls[0]}
                                  alt={`${program?.university?.name || 'University'} Photo 1`}
                                  className="w-full h-auto rounded-md object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    console.error('Failed to load image:', imageUrls[0]);
                                    // Show placeholder instead of hiding
                                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect width="800" height="450" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="18"%3EImage not available%3C/text%3E%3C/svg%3E';
                                    target.onerror = null; // Prevent infinite loop
                                  }}
                                />
                  </div>
                </div>
              ) : (
                // Multiple images - carousel
                <ImageCarousel images={imageUrls} universityName={program?.university?.name || 'University'} />
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

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
    logo_url: string | null;
    image_urls: string[] | null;
  } | null;
}

export default function ProgramDetail() {
  const params = useParams<{ id: string }>();
  const programId = params?.id ?? "1";
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referrer, setReferrer] = useState<string | null>(null);
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
          console.log('🔍 University data:', result.data.university);
          console.log('🔍 Logo URL:', result.data.university?.logo_url);
          console.log('🔍 Image URLs:', result.data.university?.image_urls);
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

  // Get referrer from sessionStorage to determine back button destination
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedReferrer = sessionStorage.getItem("program_detail_referrer");
      setReferrer(storedReferrer);
    }
  }, []);

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

  const getEntryRequirements = (): Record<string, any> => {
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
      // Handle nested objects
      return (
        <ul className="list-disc list-inside ml-4 space-y-1">
          {Object.entries(value).map(([key, val]) => (
            <li key={key} className="text-sm">
              <span className="font-medium">{key}:</span> {renderRequirementValue(val)}
            </li>
          ))}
        </ul>
      );
    }
    return String(value);
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
    if (!program?.facilities) {
      console.log('🔍 getFacilities: No facilities data');
      return [];
    }
    
    console.log('🔍 getFacilities: Raw input type:', typeof program.facilities);
    console.log('🔍 getFacilities: Raw input:', program.facilities);
    
    let parsedData: any = program.facilities;
    
    // Handle string (JSON)
    if (typeof program.facilities === 'string') {
      try {
        parsedData = JSON.parse(program.facilities);
        console.log('🔍 getFacilities: Parsed from string:', parsedData);
      } catch {
        // If JSON parsing fails, treat as comma-separated string
        console.log('🔍 getFacilities: JSON parse failed, splitting by comma');
        const split = program.facilities.split(',').map(f => f.trim()).filter(Boolean);
        console.log('🔍 getFacilities: Split result:', split);
        return split;
      }
    }
    
    // Handle array directly
    if (Array.isArray(parsedData)) {
      console.log('🔍 getFacilities: Input is array, length:', parsedData.length);
      return parsedData.map(f => String(f));
    }
    
    // Handle object format: {libraries: [...], laboratories: [...], ...}
    if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
      console.log('🔍 getFacilities: Input is object, extracting all facilities');
      const allFacilities: string[] = [];
      
      // Iterate through all categories
      Object.keys(parsedData).forEach((category) => {
        const categoryFacilities = parsedData[category];
        if (Array.isArray(categoryFacilities)) {
          // Add all facilities from this category
          categoryFacilities.forEach((facility: any) => {
            if (facility && String(facility).trim()) {
              allFacilities.push(String(facility).trim());
            }
          });
        }
      });
      
      console.log('🔍 getFacilities: Extracted facilities:', allFacilities);
      return allFacilities;
    }
    
    console.log('🔍 getFacilities: Unknown format, returning empty array');
    return [];
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

  const handleShare = async () => {
    if (!navigator.share) {
      // Fallback: copy to clipboard if Web Share API is not available
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast here if you have a toast system
        console.log('Link copied to clipboard');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
      return;
    }

    try {
      await navigator.share({
        title: programData.title,
        text: `Check out this ${programData.type} program at ${programData.university}`,
        url: window.location.href
      });
    } catch (err: any) {
      // User canceled the share dialog - this is normal, not an error
      if (err.name === 'AbortError' || err.message === 'Share canceled') {
        // Silently handle cancel - this is expected behavior
        return;
      }
      // Log other errors but don't show to user
      console.error('Error sharing:', err);
    }
  };

  const getBackButtonLink = () => {
    if (referrer === "/student/recommendations") {
      return "/student/recommendations";
    }
    if (referrer === "/student/compare") {
      return "/student/compare";
    }
    // Default to search
    return "/student/search";
  };

  const getBackButtonText = () => {
    if (referrer === "/student/recommendations") {
      return "Back to Recommendations";
    }
    if (referrer === "/student/compare") {
      return "Back to Compare";
    }
    return "Back to Search Programs";
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center">
          <Button
            asChild
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
          >
            <Link href={getBackButtonLink()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {getBackButtonText()}
            </Link>
          </Button>
        </div>

        {/* Program Header */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-foreground">{programData.title}</h1>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-700 border-green-200/30">
                      {programData.matchPercentage}% Match
                    </Badge>
                    <Badge variant="outline">{programData.type}</Badge>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-muted-foreground mb-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <GraduationCap className="w-5 h-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium truncate">{programData.university}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-5 h-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                    <span className="truncate">{programData.location}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-5 h-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
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
              <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-2 border-gray-300 dark:border-white/20 rounded-lg p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-foreground">
                  {program.tuition_fee_amount 
                    ? `${program.currency === 'MYR' ? 'RM' : program.currency} ${program.tuition_fee_amount.toLocaleString()}`
                    : 'Not Available'}
                </p>
                <p className="text-sm text-muted-foreground">per {program.tuition_fee_period || 'semester'}</p>
              </div>
              <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-2 border-gray-300 dark:border-white/20 rounded-lg p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-foreground">{programData.duration}</p>
                <p className="text-sm text-muted-foreground">duration</p>
              </div>
              <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-2 border-gray-300 dark:border-white/20 rounded-lg p-4 text-center shadow-sm">
                <div className="min-h-[3rem] flex items-center justify-center">
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
                    <p className="text-2xl font-bold text-foreground">N/A</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">start date</p>
              </div>
              <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border-2 border-gray-300 dark:border-white/20 rounded-lg p-4 text-center shadow-sm">
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
          <TabsList className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/20">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="curriculum"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              Curriculum
            </TabsTrigger>
            <TabsTrigger 
              value="requirements"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              Requirements
            </TabsTrigger>
            <TabsTrigger 
              value="careers"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              Career Outcomes
            </TabsTrigger>
            <TabsTrigger 
              value="facilities"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              Facilities
            </TabsTrigger>
            <TabsTrigger 
              value="gallery"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              Gallery
            </TabsTrigger>
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
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground mb-1 capitalize">
                            {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <div className="text-muted-foreground">
                            {renderRequirementValue(value)}
                          </div>
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
                {(() => {
                  // Debug logging
                  console.log('🔍 [Facilities Tab] Rendering facilities');
                  console.log('  programData.facilities:', programData.facilities);
                  console.log('  programData.facilities.length:', programData.facilities.length);
                  console.log('  Raw program.facilities:', program?.facilities);
                  
                  if (programData.facilities.length > 0) {
                    return (
                      <div className="grid md:grid-cols-2 gap-3">
                        {programData.facilities.map((facility, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-muted-foreground">{facility}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <p className="text-muted-foreground">No facilities information available.</p>
                  );
                })()}
              </div>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <GalleryContent program={program} />
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
                <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Website</p>
                  {programData.contact.website !== 'Not Available' ? (
                    <a 
                      href={programData.contact.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-medium text-blue-600 hover:underline break-all word-break break-words"
                    >
                      {programData.contact.website}
                    </a>
                  ) : (
                    <p className="font-medium text-foreground">Not Available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
