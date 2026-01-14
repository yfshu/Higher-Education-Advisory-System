"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, ChevronRight, Check, Building2, BookOpen, Calendar, DollarSign, GraduationCap, TrendingUp, Eye, Plus, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface University {
  id: number;
  name: string;
}

interface FieldOfInterest {
  id: number;
  name: string;
}

interface ProgramWizardData {
  // Step 1: University
  university_id: number | null;
  createNewUniversity: boolean;
  
  // Step 2: Basic Info
  name: string;
  level: "Foundation" | "Diploma" | "Bachelor" | null;
  field_id: number | null;
  status: "active" | "draft" | "archived";
  tags: string[];
  description: string | null;
  
  // Step 3: Duration & Intake
  duration: string | null;
  duration_months: number | null;
  start_month: string | null;
  deadline: string | null;
  
  // Step 4: Fees
  tuition_fee_amount: number | null;
  tuition_fee_period: "semester" | "year" | "total" | null;
  currency: string | null;
  
  // Step 5: Academic Content
  entry_requirements: Record<string, unknown> | null;
  curriculum: Record<string, unknown> | null;
  career_outcomes: Record<string, unknown> | null;
  facilities: Record<string, unknown> | null;
  
  // Step 6: Performance & Metrics
  employment_rate: number | null;
  average_salary: number | null;
  satisfaction_rate: number | null;
  rating: number | null;
  review_count: number | null;
}

interface ProgramWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program?: any | null;
  onSuccess: () => void;
}

const TOTAL_STEPS = 7;

export function ProgramWizardModal({
  open,
  onOpenChange,
  program,
  onSuccess,
}: ProgramWizardModalProps) {
  const { userData } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [universities, setUniversities] = useState<University[]>([]);
  const [fields, setFields] = useState<FieldOfInterest[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [stepErrors, setStepErrors] = useState<{ [key: number]: boolean }>({});
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  
  // User-friendly JSON form states
  const [entryReqAcademic, setEntryReqAcademic] = useState("");
  const [entryReqEnglish, setEntryReqEnglish] = useState("");
  const [entryReqOther, setEntryReqOther] = useState("");
  const [careerOutcomes, setCareerOutcomes] = useState<Array<{role: string, percentage: string}>>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [curriculumYears, setCurriculumYears] = useState<Array<{year: string, subjects: string[]}>>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProgramWizardData>({
    defaultValues: {
      university_id: null,
      createNewUniversity: false,
      name: "",
      level: null,
      field_id: null,
      status: "active",
      tags: [],
      description: null,
      duration: null,
      duration_months: null,
      start_month: null,
      deadline: null,
      tuition_fee_amount: null,
      tuition_fee_period: null,
      currency: "MYR",
      entry_requirements: null,
      curriculum: null,
      career_outcomes: null,
      facilities: null,
      employment_rate: null,
      average_salary: null,
      satisfaction_rate: null,
      rating: null,
      review_count: null,
    },
  });

  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetchInitialData();
      // Reset user-friendly form states
      if (!program) {
        setEntryReqAcademic("");
        setEntryReqEnglish("");
        setEntryReqOther("");
        setCareerOutcomes([]);
        setFacilities([]);
      }
      if (program) {
        // Edit mode - populate form
        reset({
          university_id: program.university_id || null,
          createNewUniversity: false,
          name: program.name || "",
          level: (() => {
            const level = program.level;
            if (!level) return null;
            // Normalize level value to match Select options
            const levelStr = String(level);
            if (levelStr === "Foundation" || levelStr === "foundation") return "Foundation";
            if (levelStr === "Diploma" || levelStr === "diploma") return "Diploma";
            if (levelStr === "Bachelor" || levelStr === "bachelor" || levelStr === "Degree" || levelStr === "degree") return "Bachelor";
            // Return as-is if it matches one of our options
            if (["Foundation", "Diploma", "Bachelor"].includes(levelStr)) {
              return levelStr as "Foundation" | "Diploma" | "Bachelor";
            }
            return null;
          })(),
          field_id: program.field_id || null,
          status: program.status || "active",
          tags: Array.isArray(program.tags) ? program.tags : (typeof program.tags === 'string' ? JSON.parse(program.tags || '[]') : []),
          description: program.description || null,
          duration: program.duration || null,
          duration_months: program.duration_months || null,
          start_month: program.start_month || null,
          deadline: program.deadline || null,
          tuition_fee_amount: program.tuition_fee_amount || null,
          // Parse start_month into selectedMonths array
          ...(() => {
            if (program.start_month) {
              const months = program.start_month.split(',').map(m => m.trim()).filter(m => m);
              setSelectedMonths(months);
            } else {
              setSelectedMonths([]);
            }
            return {};
          })(),
          tuition_fee_period: program.tuition_fee_period || null,
          currency: program.currency || "MYR",
          entry_requirements: (() => {
            const val = typeof program.entry_requirements === 'string' ? JSON.parse(program.entry_requirements || '{}') : program.entry_requirements;
            // Initialize user-friendly form states
            if (val && typeof val === 'object' && !Array.isArray(val)) {
              setEntryReqAcademic(val.academic || "");
              setEntryReqEnglish(val.english || "");
              setEntryReqOther(val.other || "");
            }
            return Array.isArray(val) ? { items: val } : (val || null);
          })(),
          curriculum: (() => {
            const val = typeof program.curriculum === 'string' ? JSON.parse(program.curriculum || '{}') : program.curriculum;
            const curriculumVal = Array.isArray(val) ? { items: val } : (val || null);
            // Initialize curriculum years state for editing
            if (curriculumVal && typeof curriculumVal === 'object' && !Array.isArray(curriculumVal)) {
              // Convert JSON object to structured format: {year_1: [...], year_2: [...]}
              const years: Array<{year: string, subjects: string[]}> = [];
              Object.keys(curriculumVal).sort().forEach((yearKey) => {
                const yearData = (curriculumVal as any)[yearKey];
                if (Array.isArray(yearData)) {
                  // Direct array of subjects (new format)
                  years.push({ year: yearKey, subjects: yearData });
                } else if (typeof yearData === 'object' && yearData !== null) {
                  // Old format with semesters - flatten all subjects into one array
                  const allSubjects: string[] = [];
                  Object.keys(yearData).forEach((semesterKey) => {
                    const semesterSubjects = Array.isArray(yearData[semesterKey]) ? yearData[semesterKey] : [];
                    allSubjects.push(...semesterSubjects);
                  });
                  if (allSubjects.length > 0) {
                    years.push({ year: yearKey, subjects: allSubjects });
                  }
                }
              });
              setCurriculumYears(years);
            } else {
              setCurriculumYears([]);
            }
            return curriculumVal;
          })(),
          career_outcomes: (() => {
            const val = typeof program.career_outcomes === 'string' ? JSON.parse(program.career_outcomes || '[]') : program.career_outcomes;
            // Initialize user-friendly form states
            if (Array.isArray(val)) {
              setCareerOutcomes(val.map((item: any) => ({ 
                role: item.role || "", 
                percentage: item.percentage?.toString() || "" 
              })));
              return { outcomes: val };
            } else if (val && typeof val === 'object' && val.outcomes) {
              setCareerOutcomes(val.outcomes.map((item: any) => ({ 
                role: item.role || "", 
                percentage: item.percentage?.toString() || "" 
              })));
            }
            return val || null;
          })(),
          facilities: (() => {
            const val = typeof program.facilities === 'string' ? JSON.parse(program.facilities || '[]') : program.facilities;
            // Initialize user-friendly form states
            if (Array.isArray(val)) {
              setFacilities(val);
              return { items: val };
            } else if (val && typeof val === 'object' && val.items) {
              setFacilities(val.items);
            }
            return Array.isArray(val) ? { items: val } : (val || null);
          })(),
          employment_rate: program.employment_rate || null,
          average_salary: program.average_salary || null,
          satisfaction_rate: program.satisfaction_rate || null,
          rating: program.rating || null,
          review_count: program.review_count || null,
        });
      } else {
        // Add mode - reset to defaults
        reset();
        setCurrentStep(1);
        setSelectedMonths([]);
      }
    }
  }, [open, program, reset]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      
      const [universitiesRes, fieldsRes] = await Promise.all([
        fetch(`${backendUrl}/api/universities`),
        fetch(`${backendUrl}/api/fields`),
      ]);

      if (universitiesRes.ok) {
        const uniResult = await universitiesRes.json();
        setUniversities((uniResult.data || []).filter((u: University) => u && u.id != null));
      }

      if (fieldsRes.ok) {
        const fieldsResult = await fieldsRes.json();
        setFields(fieldsResult.data || []);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const addTag = useCallback(() => {
    if (tagInput.trim() && !watch("tags")?.includes(tagInput.trim())) {
      setValue("tags", [...(watch("tags") || []), tagInput.trim()]);
      setTagInput("");
    }
  }, [tagInput, watch, setValue]);

  const removeTag = useCallback((tagToRemove: string) => {
    setValue("tags", watch("tags")?.filter((t) => t !== tagToRemove) || []);
  }, [watch, setValue]);

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        // Step 1: University Selection - Required
        if (!watch("university_id")) {
          setStepErrors({ ...stepErrors, 1: true });
          toast.error("Please select a university before proceeding.");
          return false;
        }
        setStepErrors({ ...stepErrors, 1: false });
        return true;
      
      case 2:
        // Step 2: Basic Program Info - Name, Level, and Field are required
        const programName = watch("name");
        if (!programName || (typeof programName === "string" && programName.trim() === "")) {
          setStepErrors({ ...stepErrors, 2: true, "2_name": true });
          toast.error("Program name is required.");
          return false;
        }
        if (!watch("level")) {
          setStepErrors({ ...stepErrors, 2: true, "2_level": true });
          toast.error("Program level is required.");
          return false;
        }
        if (!watch("field_id")) {
          setStepErrors({ ...stepErrors, 2: true, "2_field": true });
          toast.error("Field of study is required.");
          return false;
        }
        setStepErrors({ ...stepErrors, 2: false, "2_name": false, "2_level": false, "2_field": false });
        return true;
      
      case 3:
        // Step 3: Duration & Intake - All fields are required
        if (!watch("duration") || watch("duration")?.trim() === "") {
          setStepErrors({ ...stepErrors, 3: true, "3_duration": true });
          toast.error("Duration (Text) is required.");
          return false;
        }
        const durationMonths = watch("duration_months");
        if (!durationMonths || durationMonths < 1) {
          setStepErrors({ ...stepErrors, 3: true, "3_duration_months": true });
          toast.error("Duration (Months) is required and must be at least 1.");
          return false;
        }
        const startMonth = watch("start_month");
        if (!startMonth || startMonth.trim() === "" || selectedMonths.length === 0) {
          setStepErrors({ ...stepErrors, 3: true, "3_start_month": true });
          toast.error("Start Month(s) is required. Please select at least one month.");
          return false;
        }
        if (!watch("deadline")) {
          setStepErrors({ ...stepErrors, 3: true, "3_deadline": true });
          toast.error("Application Deadline is required.");
          return false;
        }
        setStepErrors({ ...stepErrors, 3: false, "3_duration": false, "3_duration_months": false, "3_start_month": false, "3_deadline": false });
        return true;
      
      case 4:
        // Step 4: Fees - All fields are required
        const tuitionFeeAmount = watch("tuition_fee_amount");
        const tuitionFeePeriod = watch("tuition_fee_period");
        
        if (tuitionFeeAmount === null || tuitionFeeAmount === undefined || tuitionFeeAmount === "" || isNaN(tuitionFeeAmount) || tuitionFeeAmount < 0) {
          setStepErrors({ ...stepErrors, 4: true, "4_tuition_fee_amount": true });
          toast.error("Tuition Fee Amount is required and must be 0 or greater.");
          return false;
        }
        
        if (!tuitionFeePeriod || tuitionFeePeriod === "none" || tuitionFeePeriod === "") {
          setStepErrors({ ...stepErrors, 4: true, "4_tuition_fee_period": true });
          toast.error("Fee Period is required.");
          return false;
        }
        
        setStepErrors({ ...stepErrors, 4: false, "4_tuition_fee_amount": false, "4_tuition_fee_period": false });
        return true;
      
      case 5:
        // Step 5: No required validations, optional fields
        return true;
      
      case 6:
        // Step 6: Performance & Metrics - All fields are required
        const employmentRate = watch("employment_rate");
        if (employmentRate === null || employmentRate === undefined || employmentRate === "" || isNaN(employmentRate) || employmentRate < 0 || employmentRate > 100) {
          setStepErrors({ ...stepErrors, 6: true, "6_employment_rate": true });
          toast.error("Employment Rate is required and must be between 0 and 100.");
          return false;
        }
        const averageSalary = watch("average_salary");
        if (averageSalary === null || averageSalary === undefined || averageSalary === "" || isNaN(averageSalary) || averageSalary < 0) {
          setStepErrors({ ...stepErrors, 6: true, "6_average_salary": true });
          toast.error("Average Salary is required and must be 0 or greater.");
          return false;
        }
        const satisfactionRate = watch("satisfaction_rate");
        if (satisfactionRate === null || satisfactionRate === undefined || satisfactionRate === "" || isNaN(satisfactionRate) || satisfactionRate < 0 || satisfactionRate > 100) {
          setStepErrors({ ...stepErrors, 6: true, "6_satisfaction_rate": true });
          toast.error("Satisfaction Rate is required and must be between 0 and 100.");
          return false;
        }
        const rating = watch("rating");
        if (rating === null || rating === undefined || rating === "" || isNaN(rating) || rating < 0 || rating > 5) {
          setStepErrors({ ...stepErrors, 6: true, "6_rating": true });
          toast.error("Rating is required and must be between 0.0 and 5.0.");
          return false;
        }
        const reviewCount = watch("review_count");
        if (reviewCount === null || reviewCount === undefined || reviewCount === "" || isNaN(reviewCount) || reviewCount < 0) {
          setStepErrors({ ...stepErrors, 6: true, "6_review_count": true });
          toast.error("Review Count is required and must be 0 or greater.");
          return false;
        }
        setStepErrors({ ...stepErrors, 6: false, "6_employment_rate": false, "6_average_salary": false, "6_satisfaction_rate": false, "6_rating": false, "6_review_count": false });
        return true;
      
      case 7:
        // Step 7: No required validations, optional fields
        return true;
      
      default:
        return true;
    }
  };

  const nextStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!validateCurrentStep()) {
      return;
    }
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // Clear errors when going back
      setStepErrors({ ...stepErrors, [currentStep]: false });
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ProgramWizardData) => {
    if (!userData?.accessToken) {
      toast.error("Please log in to perform this action.");
      return;
    }

    // Final validation before submission
    if (!data.university_id) {
      toast.error("Please select a university.");
      setCurrentStep(1);
      return;
    }

    if (!data.name || data.name.trim() === "") {
      toast.error("Program name is required.");
      setCurrentStep(2);
      return;
    }

    if (!data.level) {
      toast.error("Program level is required.");
      setCurrentStep(2);
      return;
    }

    if (!data.field_id) {
      toast.error("Field of study is required.");
      setCurrentStep(2);
      return;
    }

    if (!data.duration || data.duration.trim() === "") {
      toast.error("Duration (Text) is required.");
      setCurrentStep(3);
      return;
    }

    if (!data.duration_months || data.duration_months < 1) {
      toast.error("Duration (Months) is required.");
      setCurrentStep(3);
      return;
    }

    if (!data.start_month || data.start_month.trim() === "" || selectedMonths.length === 0) {
      toast.error("Start Month(s) is required. Please select at least one month.");
      setCurrentStep(3);
      return;
    }

    if (!data.deadline) {
      toast.error("Application Deadline is required.");
      setCurrentStep(3);
      return;
    }

    if (data.tuition_fee_amount === null || data.tuition_fee_amount === undefined || data.tuition_fee_amount === "" || isNaN(data.tuition_fee_amount) || data.tuition_fee_amount < 0) {
      toast.error("Tuition Fee Amount is required and must be 0 or greater.");
      setCurrentStep(4);
      return;
    }

    if (!data.tuition_fee_period || data.tuition_fee_period === "none" || data.tuition_fee_period === "") {
      toast.error("Fee Period is required.");
      setCurrentStep(4);
      return;
    }

    if (data.employment_rate === null || data.employment_rate === undefined || data.employment_rate === "" || isNaN(data.employment_rate) || data.employment_rate < 0 || data.employment_rate > 100) {
      toast.error("Employment Rate is required and must be between 0 and 100.");
      setCurrentStep(6);
      return;
    }

    if (data.average_salary === null || data.average_salary === undefined || data.average_salary === "" || isNaN(data.average_salary) || data.average_salary < 0) {
      toast.error("Average Salary is required and must be 0 or greater.");
      setCurrentStep(6);
      return;
    }

    if (data.satisfaction_rate === null || data.satisfaction_rate === undefined || data.satisfaction_rate === "" || isNaN(data.satisfaction_rate) || data.satisfaction_rate < 0 || data.satisfaction_rate > 100) {
      toast.error("Satisfaction Rate is required and must be between 0 and 100.");
      setCurrentStep(6);
      return;
    }

    if (data.rating === null || data.rating === undefined || data.rating === "" || isNaN(data.rating) || data.rating < 0 || data.rating > 5) {
      toast.error("Rating is required and must be between 0.0 and 5.0.");
      setCurrentStep(6);
      return;
    }

    if (data.review_count === null || data.review_count === undefined || data.review_count === "" || isNaN(data.review_count) || data.review_count < 0) {
      toast.error("Review Count is required and must be 0 or greater.");
      setCurrentStep(6);
      return;
    }

    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";

      // Helper to parse JSON strings and ensure correct format
      const parseJsonField = (value: any, fieldName?: string): any => {
        if (!value) return null;
        
        // If it's a string, try to parse it
        if (typeof value === 'string') {
          try {
            value = JSON.parse(value);
          } catch {
            return null; // Return null if not valid JSON
          }
        }
        
        // Backend expects objects for JSONB fields, but career_outcomes might be an array
        // Convert array to object format if needed
        if (Array.isArray(value)) {
          // For career_outcomes, convert array to object with outcomes key
          if (fieldName === 'career_outcomes') {
            return { outcomes: value };
          }
          // For other fields, convert array to object
          return { items: value };
        }
        
        // If it's already an object, return it
        if (typeof value === 'object' && value !== null) {
          return value;
        }
        
        return null;
      };

      // Validate level before submission
      const levelValue = data.level;
      if (!levelValue || levelValue === "none" || levelValue === "") {
        toast.error("Program level is required.");
        setStepErrors({ ...stepErrors, 2: true, "2_level": true });
        setCurrentStep(2);
        setLoading(false);
        return;
      }

      // Normalize level value to match backend enum
      let normalizedLevel: "Foundation" | "Diploma" | "Bachelor" | null = null;
      const levelStr = String(levelValue).trim();
      if (levelStr === "Foundation") {
        normalizedLevel = "Foundation";
      } else if (levelStr === "Diploma") {
        normalizedLevel = "Diploma";
      } else if (levelStr === "Bachelor" || levelStr.toLowerCase() === "degree") {
        normalizedLevel = "Bachelor";
      } else {
        // Try to normalize case variations
        const normalized = levelStr.charAt(0).toUpperCase() + levelStr.slice(1).toLowerCase();
        if (normalized === "Foundation" || normalized === "Diploma" || normalized === "Bachelor") {
          normalizedLevel = normalized as "Foundation" | "Diploma" | "Bachelor";
        }
      }

      if (!normalizedLevel) {
        toast.error("Invalid program level. Please select a valid level.");
        setStepErrors({ ...stepErrors, 2: true, "2_level": true });
        setCurrentStep(2);
        setLoading(false);
        return;
      }

      // Prepare payload - ensure all fields are included
      const payload: any = {
        name: data.name,
        university_id: data.university_id || null,
        level: normalizedLevel,
        field_id: data.field_id || null,
        status: data.status || "active",
        tags: data.tags && data.tags.length > 0 ? data.tags : null,
        description: data.description || null,
        duration: data.duration || null,
        duration_months: data.duration_months ? Number(data.duration_months) : null,
        start_month: data.start_month || null,
        deadline: data.deadline || null,
        tuition_fee_amount: data.tuition_fee_amount ? Number(data.tuition_fee_amount) : null,
        tuition_fee_period: data.tuition_fee_period || null,
        currency: data.currency || "MYR",
        entry_requirements: parseJsonField(data.entry_requirements, 'entry_requirements'),
        curriculum: parseJsonField(data.curriculum, 'curriculum'),
        career_outcomes: parseJsonField(data.career_outcomes, 'career_outcomes'),
        facilities: parseJsonField(data.facilities, 'facilities'),
        employment_rate: data.employment_rate ? Number(data.employment_rate) : null,
        average_salary: data.average_salary ? Number(data.average_salary) : null,
        satisfaction_rate: data.satisfaction_rate ? Number(data.satisfaction_rate) : null,
        rating: data.rating ? Number(data.rating) : null,
        review_count: data.review_count ? Number(data.review_count) : null,
      };

      let response;
      if (program) {
        response = await fetch(`${backendUrl}/api/programs/${program.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${backendUrl}/api/programs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save program");
      }

      toast.success(program ? "Program updated successfully!" : "Program created successfully!");
      onSuccess();
      onOpenChange(false);
      setCurrentStep(1);
      // Reset user-friendly form states
      setEntryReqAcademic("");
      setEntryReqEnglish("");
      setEntryReqOther("");
      setCareerOutcomes([]);
      setFacilities([]);
      setCurriculumYears([]);
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save program");
    } finally {
      setLoading(false);
    }
  };

  const updateCurriculumValue = useCallback((years: Array<{year: string, subjects: string[]}>) => {
    if (years.length === 0) {
      setValue("curriculum", null);
      return;
    }
    
    // Convert structured format to JSON object: {year_1: [...], year_2: [...]}
    const curriculumObj: any = {};
    years.forEach((yearData) => {
      if (yearData.year && yearData.subjects.length > 0) {
        // Normalize year key to year_1, year_2 format
        let yearKey = yearData.year.trim();
        // If it's already in year_1 format, keep it; otherwise convert
        if (!/^year[_\s]*\d+$/i.test(yearKey)) {
          // Extract number from year name (e.g., "Year 1" -> "1", "Year 2" -> "2")
          const yearNum = yearKey.replace(/\D/g, '');
          if (yearNum) {
            yearKey = `year_${yearNum}`;
          } else {
            // If no number found, use index + 1
            const index = years.indexOf(yearData);
            yearKey = `year_${index + 1}`;
          }
        } else {
          // Normalize to lowercase with underscore
          yearKey = yearKey.toLowerCase().replace(/\s+/g, '_');
        }
        
        // Filter out empty subjects
        const validSubjects = yearData.subjects.filter(s => s && s.trim());
        if (validSubjects.length > 0) {
          curriculumObj[yearKey] = validSubjects;
        }
      }
    });
    
    setValue("curriculum", Object.keys(curriculumObj).length > 0 ? curriculumObj : null);
  }, [setValue]);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {program ? "Edit Program" : "Add New Program"}
          </DialogTitle>
          <DialogDescription>
            Complete all steps to {program ? "update" : "create"} the program
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <form 
          onSubmit={(e) => {
            // Only allow submission on step 7 (final step)
            if (currentStep !== TOTAL_STEPS) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
            // On step 7, handle the submission
            handleSubmit(onSubmit)(e);
          }} 
          className="space-y-6"
          onKeyDown={(e) => {
            // Prevent form submission on Enter key unless on final step
            if (e.key === "Enter" && currentStep !== TOTAL_STEPS) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {/* Step 1: University Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Step 1: University Selection</h3>
              </div>
              
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="university_id">
                      Select University <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watch("university_id") ? watch("university_id")!.toString() : "none"}
                      onValueChange={(value) => {
                        setValue("university_id", value && value !== "none" ? Number(value) : null);
                        // Clear error when user selects a university
                        if (value && value !== "none") {
                          setStepErrors({ ...stepErrors, 1: false });
                        }
                      }}
                    >
                      <SelectTrigger className={stepErrors[1] && !watch("university_id") ? "border-red-300 focus:border-red-500" : ""}>
                        <SelectValue placeholder="Select a university" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {universities.map((uni) => (
                          <SelectItem key={uni.id} value={uni.id.toString()}>
                            {uni.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {stepErrors[1] && !watch("university_id") && (
                      <p className="text-sm text-red-600">Please select a university to continue</p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> If the university doesn't exist, you can create it first from the University Management page.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Basic Program Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Step 2: Basic Program Information</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Program Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name", { 
                    required: "Program name is required",
                    minLength: { value: 1, message: "Program name cannot be empty" }
                  })}
                  placeholder="e.g., Bachelor of Computer Science"
                  className={(stepErrors["2_name"] || errors.name) ? "border-red-300 focus:border-red-500" : ""}
                  onChange={(e) => {
                    register("name").onChange(e);
                    // Clear error when user starts typing
                    if (e.target.value.trim() !== "") {
                      setStepErrors({ ...stepErrors, 2: false, "2_name": false });
                    }
                  }}
                />
                {((stepErrors["2_name"] && (!watch("name") || watch("name")?.trim() === "")) || (errors.name && (!watch("name") || watch("name")?.trim() === ""))) && (
                  <p className="text-sm text-red-600">{errors.name?.message || "Program name is required"}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">
                    Program Level <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("level") ? String(watch("level")) : "none"}
                    onValueChange={(value) => {
                      setValue("level", value && value !== "none" ? (value as "Foundation" | "Diploma" | "Bachelor") : null);
                      // Clear error when user selects a level
                      if (value && value !== "none") {
                        setStepErrors({ ...stepErrors, "2_level": false });
                      }
                    }}
                  >
                    <SelectTrigger className={stepErrors["2_level"] && !watch("level") ? "border-red-300 focus:border-red-500" : ""}>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="Foundation">Foundation</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor">Degree</SelectItem>
                    </SelectContent>
                  </Select>
                  {stepErrors["2_level"] && !watch("level") && (
                    <p className="text-sm text-red-600">Program level is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field_id">
                    Field of Study <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("field_id") ? watch("field_id")!.toString() : "none"}
                    onValueChange={(value) => {
                      setValue("field_id", value && value !== "none" ? Number(value) : null);
                      // Clear error when user selects a field
                      if (value && value !== "none") {
                        setStepErrors({ ...stepErrors, "2_field": false });
                      }
                    }}
                  >
                    <SelectTrigger className={stepErrors["2_field"] && !watch("field_id") ? "border-red-300 focus:border-red-500" : ""}>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {fields.map((field) => (
                        <SelectItem key={field.id} value={field.id.toString()}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {stepErrors["2_field"] && !watch("field_id") && (
                    <p className="text-sm text-red-600">Field of study is required</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch("status") || "active"}
                  onValueChange={(value) =>
                    setValue("status", value as "active" | "draft" | "archived")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Type a tag and press Enter"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                {watch("tags") && watch("tags")!.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {watch("tags")!.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Program description..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 3: Duration & Intake */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Step 3: Duration & Intake</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duration (Text) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duration"
                    {...register("duration", { required: "Duration (Text) is required" })}
                    placeholder="e.g., 3 years"
                    className={(stepErrors["3_duration"] || errors.duration) ? "border-red-300 focus:border-red-500" : ""}
                    onChange={(e) => {
                      register("duration").onChange(e);
                      if (e.target.value.trim() !== "") {
                        setStepErrors({ ...stepErrors, "3_duration": false });
                      }
                    }}
                  />
                  {(stepErrors["3_duration"] || errors.duration) && (
                    <p className="text-sm text-red-600">{errors.duration?.message || "Duration (Text) is required"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_months">
                    Duration (Months) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duration_months"
                    type="number"
                    {...register("duration_months", {
                      required: "Duration (Months) is required",
                      valueAsNumber: true,
                      min: { value: 1, message: "Must be at least 1 month" },
                    })}
                    placeholder="e.g., 36"
                    className={(stepErrors["3_duration_months"] || errors.duration_months) ? "border-red-300 focus:border-red-500" : ""}
                    onChange={(e) => {
                      register("duration_months").onChange(e);
                      const value = parseInt(e.target.value);
                      if (value && value >= 1) {
                        setStepErrors({ ...stepErrors, "3_duration_months": false });
                      }
                    }}
                  />
                  {(stepErrors["3_duration_months"] || errors.duration_months) && (
                    <p className="text-sm text-red-600">{errors.duration_months?.message || "Duration (Months) is required"}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_month">
                    Start Month(s) <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => {
                      const isSelected = selectedMonths.includes(month);
                      return (
                        <Button
                          key={month}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            let newMonths: string[];
                            if (isSelected) {
                              newMonths = selectedMonths.filter(m => m !== month);
                            } else {
                              newMonths = [...selectedMonths, month];
                            }
                            
                            // Sort months in chronological order
                            const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            newMonths.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
                            
                            setSelectedMonths(newMonths);
                            setValue("start_month", newMonths.length > 0 ? newMonths.join(",") : null);
                            
                            // Clear error when at least one month is selected
                            if (newMonths.length > 0) {
                              setStepErrors({ ...stepErrors, "3_start_month": false });
                            }
                          }}
                          className={isSelected ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                        >
                          {month}
                        </Button>
                      );
                    })}
                  </div>
                  {selectedMonths.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected: {selectedMonths.join(", ")}
                    </p>
                  )}
                  {(stepErrors["3_start_month"] || (errors.start_month && selectedMonths.length === 0)) && (
                    <p className="text-sm text-red-600">Please select at least one start month</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">
                    Application Deadline <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    {...register("deadline", { required: "Application Deadline is required" })}
                    className={(stepErrors["3_deadline"] || errors.deadline) ? "border-red-300 focus:border-red-500" : ""}
                    onChange={(e) => {
                      register("deadline").onChange(e);
                      if (e.target.value) {
                        setStepErrors({ ...stepErrors, "3_deadline": false });
                      }
                    }}
                  />
                  {(stepErrors["3_deadline"] || errors.deadline) && (
                    <p className="text-sm text-red-600">{errors.deadline?.message || "Application Deadline is required"}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Fees */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Step 4: Tuition Fees</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tuition_fee_amount">
                    Tuition Fee Amount (RM) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tuition_fee_amount"
                    type="number"
                    step="0.01"
                    {...register("tuition_fee_amount", {
                      required: "Tuition Fee Amount is required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be 0 or greater" },
                    })}
                    placeholder="e.g., 50000"
                    className={(stepErrors["4_tuition_fee_amount"] || errors.tuition_fee_amount) ? "border-red-300 focus:border-red-500" : ""}
                    onChange={(e) => {
                      register("tuition_fee_amount").onChange(e);
                      const value = parseFloat(e.target.value);
                      if (value && !isNaN(value) && value >= 0) {
                        setStepErrors({ ...stepErrors, "4_tuition_fee_amount": false });
                      }
                    }}
                  />
                  {(stepErrors["4_tuition_fee_amount"] || errors.tuition_fee_amount) && (
                    <p className="text-sm text-red-600">{errors.tuition_fee_amount?.message || "Tuition Fee Amount is required"}</p>
                  )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tuition_fee_period">
                    Fee Period <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("tuition_fee_period") || "none"}
                    onValueChange={(value) => {
                      setValue("tuition_fee_period", value && value !== "none" ? (value as "semester" | "year" | "total") : null);
                      // Clear error when user selects a period
                      if (value && value !== "none") {
                        setStepErrors({ ...stepErrors, "4_tuition_fee_period": false });
                      }
                    }}
                  >
                    <SelectTrigger className={stepErrors["4_tuition_fee_period"] && !watch("tuition_fee_period") ? "border-red-300 focus:border-red-500" : ""}>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="semester">Per Semester</SelectItem>
                      <SelectItem value="year">Per Year</SelectItem>
                      <SelectItem value="total">Total</SelectItem>
                    </SelectContent>
                  </Select>
                  {stepErrors["4_tuition_fee_period"] && !watch("tuition_fee_period") && (
                    <p className="text-sm text-red-600">Fee Period is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    {...register("currency")}
                    placeholder="MYR"
                    defaultValue="MYR"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Academic Content */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Step 5: Academic Content</h3>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Fill in the fields below. The data will be automatically formatted and saved.
                </p>
              </div>

              {/* Entry Requirements */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Entry Requirements</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="entry_req_academic" className="text-sm font-medium">Academic Requirements</Label>
                    <Input
                      id="entry_req_academic"
                      value={entryReqAcademic}
                      onChange={(e) => {
                        setEntryReqAcademic(e.target.value);
                        const req: any = {};
                        if (e.target.value) req.academic = e.target.value;
                        if (entryReqEnglish) req.english = entryReqEnglish;
                        if (entryReqOther) req.other = entryReqOther;
                        setValue("entry_requirements", Object.keys(req).length > 0 ? req : null);
                      }}
                      placeholder="e.g., SPM: 5 credits including Mathematics"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry_req_english" className="text-sm font-medium">English Requirements</Label>
                    <Input
                      id="entry_req_english"
                      value={entryReqEnglish}
                      onChange={(e) => {
                        setEntryReqEnglish(e.target.value);
                        const req: any = {};
                        if (entryReqAcademic) req.academic = entryReqAcademic;
                        if (e.target.value) req.english = e.target.value;
                        if (entryReqOther) req.other = entryReqOther;
                        setValue("entry_requirements", Object.keys(req).length > 0 ? req : null);
                      }}
                      placeholder="e.g., MUET Band 3 or IELTS 5.5"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry_req_other" className="text-sm font-medium">Other Requirements (Optional)</Label>
                    <Input
                      id="entry_req_other"
                      value={entryReqOther}
                      onChange={(e) => {
                        setEntryReqOther(e.target.value);
                        const req: any = {};
                        if (entryReqAcademic) req.academic = entryReqAcademic;
                        if (entryReqEnglish) req.english = entryReqEnglish;
                        if (e.target.value) req.other = e.target.value;
                        setValue("entry_requirements", Object.keys(req).length > 0 ? req : null);
                      }}
                      placeholder="e.g., Interview required"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Career Outcomes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Career Outcomes</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOutcomes = [...careerOutcomes, { role: "", percentage: "" }];
                      setCareerOutcomes(newOutcomes);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Career
                  </Button>
                </div>
                <div className="space-y-4">
                  {careerOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <Input
                        placeholder="Career role (e.g., Software Engineer)"
                        value={outcome.role}
                        onChange={(e) => {
                          const updated = [...careerOutcomes];
                          updated[idx].role = e.target.value;
                          setCareerOutcomes(updated);
                          const validOutcomes = updated.filter(o => o.role && o.percentage);
                          setValue("career_outcomes", validOutcomes.length > 0 ? { outcomes: validOutcomes.map(o => ({ role: o.role, percentage: parseInt(o.percentage) || 0 })) } : null);
                        }}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="%"
                        value={outcome.percentage}
                        onChange={(e) => {
                          const updated = [...careerOutcomes];
                          updated[idx].percentage = e.target.value;
                          setCareerOutcomes(updated);
                          const validOutcomes = updated.filter(o => o.role && o.percentage);
                          setValue("career_outcomes", validOutcomes.length > 0 ? { outcomes: validOutcomes.map(o => ({ role: o.role, percentage: parseInt(o.percentage) || 0 })) } : null);
                        }}
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = careerOutcomes.filter((_, i) => i !== idx);
                          setCareerOutcomes(updated);
                          const validOutcomes = updated.filter(o => o.role && o.percentage);
                          setValue("career_outcomes", validOutcomes.length > 0 ? { outcomes: validOutcomes.map(o => ({ role: o.role, percentage: parseInt(o.percentage) || 0 })) } : null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {careerOutcomes.length === 0 && (
                    <p className="text-sm text-muted-foreground">Click "Add Career" to add career outcomes</p>
                  )}
                </div>
              </div>

              {/* Facilities */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Facilities</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newFacilities = [...facilities, ""];
                      setFacilities(newFacilities);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Facility
                  </Button>
                </div>
                <div className="space-y-4">
                  {facilities.map((facility, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <Input
                        placeholder="Facility name (e.g., Computer Lab, Library)"
                        value={facility}
                        onChange={(e) => {
                          const updated = [...facilities];
                          updated[idx] = e.target.value;
                          setFacilities(updated);
                          const validFacilities = updated.filter(f => f.trim());
                          setValue("facilities", validFacilities.length > 0 ? { items: validFacilities } : null);
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = facilities.filter((_, i) => i !== idx);
                          setFacilities(updated);
                          const validFacilities = updated.filter(f => f.trim());
                          setValue("facilities", validFacilities.length > 0 ? { items: validFacilities } : null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {facilities.length === 0 && (
                    <p className="text-sm text-muted-foreground">Click "Add Facility" to add facilities</p>
                  )}
                </div>
              </div>

              {/* Curriculum */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Curriculum (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newYears = [...curriculumYears, { year: `Year ${curriculumYears.length + 1}`, subjects: [] }];
                      setCurriculumYears(newYears);
                      updateCurriculumValue(newYears);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Year
                  </Button>
                </div>
                <div className="space-y-4">
                  {curriculumYears.map((yearData, yearIdx) => (
                    <Card key={yearIdx} className="p-4 border-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Input
                            value={yearData.year}
                            onChange={(e) => {
                              const updated = [...curriculumYears];
                              updated[yearIdx].year = e.target.value;
                              setCurriculumYears(updated);
                              updateCurriculumValue(updated);
                            }}
                            placeholder="Year name (e.g., Year 1)"
                            className="flex-1 font-semibold"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = curriculumYears.filter((_, i) => i !== yearIdx);
                              setCurriculumYears(updated);
                              updateCurriculumValue(updated);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="ml-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Subjects</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updated = [...curriculumYears];
                                updated[yearIdx].subjects.push("");
                                setCurriculumYears(updated);
                                updateCurriculumValue(updated);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Subject
                            </Button>
                          </div>
                          
                          {yearData.subjects.map((subject, subjIdx) => (
                            <div key={subjIdx} className="flex gap-2">
                              <Input
                                value={subject}
                                onChange={(e) => {
                                  const updated = [...curriculumYears];
                                  updated[yearIdx].subjects[subjIdx] = e.target.value;
                                  setCurriculumYears(updated);
                                  updateCurriculumValue(updated);
                                }}
                                placeholder="Subject name (e.g., Introduction to Computer Science)"
                                className="flex-1 text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = [...curriculumYears];
                                  updated[yearIdx].subjects = updated[yearIdx].subjects.filter((_, i) => i !== subjIdx);
                                  setCurriculumYears(updated);
                                  updateCurriculumValue(updated);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                          
                          {yearData.subjects.length === 0 && (
                            <p className="text-sm text-muted-foreground">Click "Add Subject" to add subjects</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {curriculumYears.length === 0 && (
                    <p className="text-sm text-muted-foreground">Click "Add Year" to add curriculum structure</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Performance & Metrics */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Step 6: Performance & Metrics</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employment_rate">
                    Employment Rate (%) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="employment_rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    {...register("employment_rate", {
                      required: "Employment Rate is required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be between 0 and 100" },
                      max: { value: 100, message: "Must be between 0 and 100" },
                    })}
                    placeholder="e.g., 85.5"
                    className={(stepErrors["6_employment_rate"] || errors.employment_rate) ? "border-red-300 focus:border-red-500" : ""}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Allow empty input for clearing
                      if (inputValue === "") {
                        register("employment_rate").onChange(e);
                        return;
                      }
                      
                      const value = parseFloat(inputValue);
                      
                      // Prevent invalid values in real-time
                      if (isNaN(value)) {
                        return; // Don't update if not a number
                      }
                      
                      // Clamp value between 0 and 100
                      if (value < 0) {
                        e.target.value = "0";
                        setValue("employment_rate", 0);
                        setStepErrors({ ...stepErrors, "6_employment_rate": false });
                        return;
                      }
                      
                      if (value > 100) {
                        e.target.value = "100";
                        setValue("employment_rate", 100);
                        setStepErrors({ ...stepErrors, "6_employment_rate": false });
                        return;
                      }
                      
                      // Valid value
                      register("employment_rate").onChange(e);
                      setStepErrors({ ...stepErrors, "6_employment_rate": false });
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value);
                      if (isNaN(value) || value < 0 || value > 100) {
                        setStepErrors({ ...stepErrors, "6_employment_rate": true });
                      }
                    }}
                  />
                  {(stepErrors["6_employment_rate"] || errors.employment_rate) && (
                    <p className="text-sm text-red-600">{errors.employment_rate?.message || "Employment Rate is required (0-100)"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="average_salary">
                    Average Salary (RM) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="average_salary"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("average_salary", {
                      required: "Average Salary is required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be 0 or greater" },
                      validate: (value) => {
                        if (value === null || value === undefined || value === "" || isNaN(value)) {
                          return "Average Salary is required";
                        }
                        if (value < 0) {
                          return "Must be 0 or greater";
                        }
                        return true;
                      },
                    })}
                    placeholder="e.g., 4500"
                    className={(stepErrors["6_average_salary"] || errors.average_salary) ? "border-red-300 focus:border-red-500" : ""}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Allow empty input for clearing, but don't clear error yet
                      if (inputValue === "") {
                        register("average_salary").onChange(e);
                        return;
                      }
                      
                      const value = parseFloat(inputValue);
                      
                      // Only clear error if we have a valid number >= 0
                      if (!isNaN(value) && value >= 0) {
                        register("average_salary").onChange(e);
                        setStepErrors({ ...stepErrors, "6_average_salary": false });
                      } else {
                        // Invalid value, don't update
                        return;
                      }
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value);
                      if (e.target.value === "" || isNaN(value) || value < 0) {
                        setStepErrors({ ...stepErrors, "6_average_salary": true });
                      }
                    }}
                  />
                  {(stepErrors["6_average_salary"] || errors.average_salary) && (
                    <p className="text-sm text-red-600">{errors.average_salary?.message || "Average Salary is required"}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="satisfaction_rate">
                    Satisfaction Rate (%) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="satisfaction_rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    {...register("satisfaction_rate", {
                      required: "Satisfaction Rate is required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be between 0 and 100" },
                      max: { value: 100, message: "Must be between 0 and 100" },
                    })}
                    placeholder="e.g., 92.3"
                    className={(stepErrors["6_satisfaction_rate"] || errors.satisfaction_rate) ? "border-red-300 focus:border-red-500" : ""}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Allow empty input for clearing
                      if (inputValue === "") {
                        register("satisfaction_rate").onChange(e);
                        return;
                      }
                      
                      const value = parseFloat(inputValue);
                      
                      // Prevent invalid values in real-time
                      if (isNaN(value)) {
                        return; // Don't update if not a number
                      }
                      
                      // Clamp value between 0 and 100
                      if (value < 0) {
                        e.target.value = "0";
                        setValue("satisfaction_rate", 0);
                        setStepErrors({ ...stepErrors, "6_satisfaction_rate": false });
                        return;
                      }
                      
                      if (value > 100) {
                        e.target.value = "100";
                        setValue("satisfaction_rate", 100);
                        setStepErrors({ ...stepErrors, "6_satisfaction_rate": false });
                        return;
                      }
                      
                      // Valid value
                      register("satisfaction_rate").onChange(e);
                      setStepErrors({ ...stepErrors, "6_satisfaction_rate": false });
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value);
                      if (isNaN(value) || value < 0 || value > 100) {
                        setStepErrors({ ...stepErrors, "6_satisfaction_rate": true });
                      }
                    }}
                  />
                  {(stepErrors["6_satisfaction_rate"] || errors.satisfaction_rate) && (
                    <p className="text-sm text-red-600">{errors.satisfaction_rate?.message || "Satisfaction Rate is required (0-100)"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">
                    Rating (0.0-5.0) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    {...register("rating", {
                      required: "Rating is required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be between 0.0 and 5.0" },
                      max: { value: 5, message: "Must be between 0.0 and 5.0" },
                    })}
                    placeholder="e.g., 4.5"
                    className={(stepErrors["6_rating"] || errors.rating) ? "border-red-300 focus:border-red-500" : ""}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Allow empty input for clearing
                      if (inputValue === "") {
                        register("rating").onChange(e);
                        return;
                      }
                      
                      const value = parseFloat(inputValue);
                      
                      // Prevent invalid values in real-time
                      if (isNaN(value)) {
                        return; // Don't update if not a number
                      }
                      
                      // Clamp value between 0 and 5
                      if (value < 0) {
                        e.target.value = "0";
                        setValue("rating", 0);
                        setStepErrors({ ...stepErrors, "6_rating": false });
                        return;
                      }
                      
                      if (value > 5) {
                        e.target.value = "5";
                        setValue("rating", 5);
                        setStepErrors({ ...stepErrors, "6_rating": false });
                        return;
                      }
                      
                      // Valid value
                      register("rating").onChange(e);
                      setStepErrors({ ...stepErrors, "6_rating": false });
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value);
                      if (isNaN(value) || value < 0 || value > 5) {
                        setStepErrors({ ...stepErrors, "6_rating": true });
                      }
                    }}
                  />
                  {(stepErrors["6_rating"] || errors.rating) && (
                    <p className="text-sm text-red-600">{errors.rating?.message || "Rating is required (0.0-5.0)"}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review_count">
                  Review Count <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="review_count"
                  type="number"
                  {...register("review_count", {
                    required: "Review Count is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Must be 0 or greater" },
                  })}
                  placeholder="e.g., 150"
                  className={(stepErrors["6_review_count"] || errors.review_count) ? "border-red-300 focus:border-red-500" : ""}
                  onChange={(e) => {
                    register("review_count").onChange(e);
                    const value = parseInt(e.target.value);
                    if (value !== null && !isNaN(value) && value >= 0) {
                      setStepErrors({ ...stepErrors, "6_review_count": false });
                    }
                  }}
                />
                {(stepErrors["6_review_count"] || errors.review_count) && (
                  <p className="text-sm text-red-600">{errors.review_count?.message || "Review Count is required"}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 7: Review & Submit */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Step 7: Review & Submit</h3>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Review:</strong> Please review all the information below. Click the "{program ? "Update" : "Add"} Program" button to save the program to the database.
                </p>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-lg">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Program Name:</strong> {watch("name") || "N/A"}</p>
                  <p><strong>Level:</strong> {watch("level") || "N/A"}</p>
                    <p><strong>University:</strong> {universities.find(u => u.id === watch("university_id"))?.name || watch("university_id") || "N/A"}</p>
                    <p><strong>Field of Study:</strong> {fields.find(f => f.id === watch("field_id"))?.name || watch("field_id") || "N/A"}</p>
                  <p><strong>Status:</strong> {watch("status") || "N/A"}</p>
                    {watch("tags") && watch("tags")!.length > 0 && (
                      <p><strong>Tags:</strong> {watch("tags")!.join(", ")}</p>
                    )}
                    {watch("description") && (
                      <div>
                        <strong>Description:</strong>
                        <p className="text-muted-foreground mt-1">{watch("description")}</p>
                </div>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-lg">Duration & Intake</h4>
                  <div className="space-y-2 text-sm">
                  <p><strong>Duration:</strong> {watch("duration") || "N/A"} ({watch("duration_months") || "N/A"} months)</p>
                    <p><strong>Start Month(s):</strong> {watch("start_month") || selectedMonths.join(", ") || "N/A"}</p>
                    <p><strong>Application Deadline:</strong> {watch("deadline") ? new Date(watch("deadline")!).toLocaleDateString() : "N/A"}</p>
                </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-lg">Tuition Fees</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Tuition Fee Amount:</strong> {watch("tuition_fee_amount") ? `RM ${watch("tuition_fee_amount")}` : "N/A"}</p>
                    <p><strong>Fee Period:</strong> {watch("tuition_fee_period") || "N/A"}</p>
                    <p><strong>Currency:</strong> {watch("currency") || "N/A"}</p>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-lg">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                  <p><strong>Employment Rate:</strong> {watch("employment_rate") ? `${watch("employment_rate")}%` : "N/A"}</p>
                  <p><strong>Average Salary:</strong> {watch("average_salary") ? `RM ${watch("average_salary")}` : "N/A"}</p>
                    <p><strong>Satisfaction Rate:</strong> {watch("satisfaction_rate") ? `${watch("satisfaction_rate")}%` : "N/A"}</p>
                  <p><strong>Rating:</strong> {watch("rating") || "N/A"}</p>
                    <p><strong>Review Count:</strong> {watch("review_count") || "N/A"}</p>
                </div>
              </Card>

                {(watch("entry_requirements") || entryReqAcademic || entryReqEnglish) && (
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 text-lg">Entry Requirements</h4>
                    <div className="space-y-2 text-sm">
                      {entryReqAcademic && <p><strong>Academic:</strong> {entryReqAcademic}</p>}
                      {entryReqEnglish && <p><strong>English:</strong> {entryReqEnglish}</p>}
                      {entryReqOther && <p><strong>Other:</strong> {entryReqOther}</p>}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <DialogFooter className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} disabled={loading}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {currentStep < TOTAL_STEPS ? (
                <Button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    nextStep(e);
                  }}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={loading}
                  onClick={(e) => {
                    // Only submit when explicitly clicking the Add/Update button
                    e.preventDefault();
                    handleSubmit(onSubmit)(e);
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {program ? "Update Program" : "Add Program"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


