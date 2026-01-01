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
  tuition_fee: number | null;
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
  
  // User-friendly JSON form states
  const [entryReqAcademic, setEntryReqAcademic] = useState("");
  const [entryReqEnglish, setEntryReqEnglish] = useState("");
  const [entryReqOther, setEntryReqOther] = useState("");
  const [careerOutcomes, setCareerOutcomes] = useState<Array<{role: string, percentage: string}>>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [curriculumYears, setCurriculumYears] = useState<Array<{year: string, semesters: Array<{semester: string, subjects: string[]}>}>>([]);

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
      tuition_fee: null,
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
          level: program.level || null,
          field_id: program.field_id || null,
          status: program.status || "active",
          tags: Array.isArray(program.tags) ? program.tags : (typeof program.tags === 'string' ? JSON.parse(program.tags || '[]') : []),
          description: program.description || null,
          duration: program.duration || null,
          duration_months: program.duration_months || null,
          start_month: program.start_month || null,
          deadline: program.deadline || null,
          tuition_fee: program.tuition_fee || null,
          tuition_fee_amount: program.tuition_fee_amount || null,
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
            return Array.isArray(val) ? { items: val } : (val || null);
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

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ProgramWizardData) => {
    if (!userData?.accessToken) {
      alert("Please log in to perform this action.");
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

      // Prepare payload - ensure all fields are included
      const payload: any = {
        name: data.name,
        university_id: data.university_id || null,
        level: data.level || null,
        field_id: data.field_id || null,
        status: data.status || "active",
        tags: data.tags && data.tags.length > 0 ? data.tags : null,
        description: data.description || null,
        duration: data.duration || null,
        duration_months: data.duration_months ? Number(data.duration_months) : null,
        start_month: data.start_month || null,
        deadline: data.deadline || null,
        tuition_fee: data.tuition_fee ? Number(data.tuition_fee) : null,
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
    } catch (error) {
      console.error("Error saving program:", error);
      alert(error instanceof Error ? error.message : "Failed to save program");
    } finally {
      setLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    <Label htmlFor="university_id">Select University</Label>
                    <Select
                      value={watch("university_id") ? watch("university_id")!.toString() : "none"}
                      onValueChange={(value) =>
                        setValue("university_id", value && value !== "none" ? Number(value) : null)
                      }
                    >
                      <SelectTrigger>
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
                  {...register("name", { required: "Program name is required" })}
                  placeholder="e.g., Bachelor of Computer Science"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Program Level</Label>
                  <Select
                    value={watch("level") || "none"}
                    onValueChange={(value) =>
                      setValue("level", value && value !== "none" ? (value as "Foundation" | "Diploma" | "Bachelor") : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="Foundation">Foundation</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor">Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field_id">Field of Study</Label>
                  <Select
                    value={watch("field_id") ? watch("field_id")!.toString() : "none"}
                    onValueChange={(value) =>
                      setValue("field_id", value && value !== "none" ? Number(value) : null)
                    }
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="duration">Duration (Text)</Label>
                  <Input
                    id="duration"
                    {...register("duration")}
                    placeholder="e.g., 3 years"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_months">Duration (Months)</Label>
                  <Input
                    id="duration_months"
                    type="number"
                    {...register("duration_months", {
                      valueAsNumber: true,
                      min: { value: 1, message: "Must be at least 1 month" },
                    })}
                    placeholder="e.g., 36"
                  />
                  {errors.duration_months && (
                    <p className="text-sm text-red-600">{errors.duration_months.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_month">Start Month(s)</Label>
                  <Input
                    id="start_month"
                    {...register("start_month")}
                    placeholder="e.g., January, July"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    {...register("deadline")}
                  />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tuition_fee">Tuition Fee (Legacy)</Label>
                  <Input
                    id="tuition_fee"
                    type="number"
                    step="0.01"
                    {...register("tuition_fee", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be 0 or greater" },
                    })}
                    placeholder="e.g., 50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tuition_fee_amount">Tuition Fee Amount (RM)</Label>
                  <Input
                    id="tuition_fee_amount"
                    type="number"
                    step="0.01"
                    {...register("tuition_fee_amount", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be 0 or greater" },
                    })}
                    placeholder="e.g., 50000"
                  />
                  {errors.tuition_fee_amount && (
                    <p className="text-sm text-red-600">{errors.tuition_fee_amount.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tuition_fee_period">Fee Period</Label>
                  <Select
                    value={watch("tuition_fee_period") || "none"}
                    onValueChange={(value) =>
                      setValue("tuition_fee_period", value && value !== "none" ? (value as "semester" | "year" | "total") : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="semester">Per Semester</SelectItem>
                      <SelectItem value="year">Per Year</SelectItem>
                      <SelectItem value="total">Total</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="entry_req_academic" className="text-sm">Academic Requirements</Label>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry_req_english" className="text-sm">English Requirements</Label>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry_req_other" className="text-sm">Other Requirements (Optional)</Label>
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
                <div className="space-y-3">
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
                <div className="space-y-3">
                  {facilities.map((facility, idx) => (
                    <div key={idx} className="flex gap-2">
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

              {/* Curriculum - Keep as JSON for now but with better instructions */}
              <div className="space-y-2">
                <Label htmlFor="curriculum">Curriculum (Optional - Advanced)</Label>
                <Textarea
                  id="curriculum"
                  value={
                    watch("curriculum")
                      ? JSON.stringify(watch("curriculum"), null, 2)
                      : ""
                  }
                  onChange={(e) => {
                    try {
                      const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                      setValue("curriculum", parsed);
                    } catch {
                      setValue("curriculum", null);
                    }
                  }}
                  placeholder='{"year1": {"semester1": ["Subject 1", "Subject 2"]}}'
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Enter curriculum structure as JSON. Leave empty if not needed.
                </p>
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
                  <Label htmlFor="employment_rate">Employment Rate (%)</Label>
                  <Input
                    id="employment_rate"
                    type="number"
                    step="0.1"
                    {...register("employment_rate", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be 0 or greater" },
                      max: { value: 100, message: "Must be 100 or less" },
                    })}
                    placeholder="e.g., 85.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="average_salary">Average Salary (RM)</Label>
                  <Input
                    id="average_salary"
                    type="number"
                    step="0.01"
                    {...register("average_salary", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be 0 or greater" },
                    })}
                    placeholder="e.g., 4500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="satisfaction_rate">Satisfaction Rate (%)</Label>
                  <Input
                    id="satisfaction_rate"
                    type="number"
                    step="0.1"
                    {...register("satisfaction_rate", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be 0 or greater" },
                      max: { value: 100, message: "Must be 100 or less" },
                    })}
                    placeholder="e.g., 92.3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    {...register("rating", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be 0 or greater" },
                      max: { value: 5, message: "Must be 5 or less" },
                    })}
                    placeholder="e.g., 4.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review_count">Review Count (Read-only)</Label>
                <Input
                  id="review_count"
                  type="number"
                  {...register("review_count", {
                    valueAsNumber: true,
                    min: { value: 0, message: "Must be 0 or greater" },
                  })}
                  placeholder="Auto-calculated"
                  disabled
                />
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

              <Card className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Program Information</h4>
                  <p><strong>Name:</strong> {watch("name") || "N/A"}</p>
                  <p><strong>Level:</strong> {watch("level") || "N/A"}</p>
                  <p><strong>University ID:</strong> {watch("university_id") || "N/A"}</p>
                  <p><strong>Status:</strong> {watch("status") || "N/A"}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Duration & Fees</h4>
                  <p><strong>Duration:</strong> {watch("duration") || "N/A"} ({watch("duration_months") || "N/A"} months)</p>
                  <p><strong>Tuition Fee:</strong> {watch("tuition_fee_amount") ? `RM ${watch("tuition_fee_amount")}` : "N/A"}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Performance Metrics</h4>
                  <p><strong>Employment Rate:</strong> {watch("employment_rate") ? `${watch("employment_rate")}%` : "N/A"}</p>
                  <p><strong>Average Salary:</strong> {watch("average_salary") ? `RM ${watch("average_salary")}` : "N/A"}</p>
                  <p><strong>Rating:</strong> {watch("rating") || "N/A"}</p>
                </div>
              </Card>
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
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {program ? "Update Program" : "Create Program"}
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


