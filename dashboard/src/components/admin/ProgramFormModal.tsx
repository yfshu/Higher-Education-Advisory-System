"use client";

import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface University {
  id: number;
  name: string;
}

interface ProgramFormData {
  name: string;
  university_id: number | null;
  level: "Foundation" | "Diploma" | "Bachelor" | null;
  description: string | null;
  duration_months: number | null;
  tuition_fee_amount: number | null;
  tuition_fee_period: "semester" | "year" | "total" | null;
  currency: string | null;
  start_month: string | null;
  deadline: string | null;
  field_id: number | null;
  status: "active" | "draft" | "archived";
}

interface ProgramFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program?: any | null;
  onSuccess: () => void;
}

export function ProgramFormModal({
  open,
  onOpenChange,
  program,
  onSuccess,
}: ProgramFormModalProps) {
  const { userData } = useUser();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProgramFormData>({
    defaultValues: {
      name: "",
      university_id: null,
      level: null,
      description: null,
      duration_months: null,
      tuition_fee_amount: null,
      tuition_fee_period: null,
      currency: "MYR",
      start_month: null,
      deadline: null,
      field_id: null,
      status: "active",
    },
  });

  // Fetch universities
  useEffect(() => {
    if (open) {
      fetchUniversities();
    }
  }, [open]);

  // Reset form when program changes
  useEffect(() => {
    if (open) {
      if (program) {
        // Edit mode - populate form
        reset({
          name: program.name || "",
          university_id: program.university_id || null,
          level: program.level || null,
          description: program.description || null,
          duration_months: program.duration_months || null,
          tuition_fee_amount: program.tuition_fee_amount || null,
          tuition_fee_period: program.tuition_fee_period || null,
          currency: program.currency || "MYR",
          start_month: program.start_month || null,
          deadline: program.deadline || null,
          field_id: program.field_id || null,
          status: program.status || "active",
        });
      } else {
        // Add mode - reset to defaults
        reset({
          name: "",
          university_id: null,
          level: null,
          description: null,
          duration_months: null,
          tuition_fee_amount: null,
          tuition_fee_period: null,
          currency: "MYR",
          start_month: null,
          deadline: null,
          field_id: null,
          status: "active",
        });
      }
    }
  }, [program, open, reset]);

  const fetchUniversities = async () => {
    try {
      setLoadingUniversities(true);
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/universities`);
      if (!response.ok) throw new Error("Failed to fetch universities");
      const result = await response.json();
      // Filter to ensure only universities with valid IDs are included
      const validUniversities = (result.data || []).filter(
        (uni: University) => uni && uni.id != null
      );
      setUniversities(validUniversities);
    } catch (error) {
      console.error("Error fetching universities:", error);
    } finally {
      setLoadingUniversities(false);
    }
  };

  const onSubmit = async (data: ProgramFormData) => {
    if (!userData?.accessToken) {
      alert("Please log in to perform this action.");
      return;
    }

    try {
      setLoading(true);
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";

      // Prepare payload - convert null strings to null
      const payload: any = {
        name: data.name,
        university_id: data.university_id || null,
        level: data.level || null,
        description: data.description || null,
        duration_months: data.duration_months
          ? Number(data.duration_months)
          : null,
        tuition_fee_amount: data.tuition_fee_amount
          ? Number(data.tuition_fee_amount)
          : null,
        tuition_fee_period: data.tuition_fee_period || null,
        currency: data.currency || "MYR",
        start_month: data.start_month || null,
        deadline: data.deadline || null,
        field_id: data.field_id ? Number(data.field_id) : null,
        status: data.status || "active",
      };

      let response;
      if (program) {
        // Update
        response = await fetch(`${backendUrl}/api/programs/${program.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
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

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving program:", error);
      alert(error instanceof Error ? error.message : "Failed to save program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {program ? "Edit Program" : "Add New Program"}
          </DialogTitle>
          <DialogDescription>
            {program
              ? "Update the program information below."
              : "Fill in the details to create a new program."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Program Name */}
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

          {/* University */}
          <div className="space-y-2">
            <Label htmlFor="university_id">University</Label>
            {loadingUniversities ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading universities...
              </div>
            ) : (
              <Select
                value={
                  watch("university_id")
                    ? watch("university_id")!.toString()
                    : "none"
                }
                onValueChange={(value) =>
                  setValue(
                    "university_id",
                    value && value !== "none" ? Number(value) : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a university" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {universities && universities.length > 0
                    ? universities.map((uni) => (
                        <SelectItem key={uni.id} value={uni.id.toString()}>
                          {uni.name}
                        </SelectItem>
                      ))
                    : null}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Level and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Program Level</Label>
              <Select
                value={watch("level") || "none"}
                onValueChange={(value) =>
                  setValue(
                    "level",
                    value && value !== "none"
                      ? (value as "Foundation" | "Diploma" | "Bachelor")
                      : null
                  )
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
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Program description..."
              rows={4}
            />
          </div>

          {/* Duration and Tuition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_months">Duration (months)</Label>
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
                <p className="text-sm text-red-600">
                  {errors.duration_months.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tuition_fee_amount">Tuition Fee (RM)</Label>
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
                <p className="text-sm text-red-600">
                  {errors.tuition_fee_amount.message}
                </p>
              )}
            </div>
          </div>

          {/* Tuition Period and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tuition_fee_period">Tuition Period</Label>
              <Select
                value={watch("tuition_fee_period") || "none"}
                onValueChange={(value) =>
                  setValue(
                    "tuition_fee_period",
                    value && value !== "none"
                      ? (value as "semester" | "year" | "total")
                      : null
                  )
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

          {/* Start Month and Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_month">Start Month</Label>
              <Input
                id="start_month"
                {...register("start_month")}
                placeholder="e.g., January"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : program ? (
                "Update Program"
              ) : (
                "Create Program"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
