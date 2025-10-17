"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { GraduationCap, User, Mail, Phone, Calendar, MapPin, Lock, Camera, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";

import { useAuthModals } from "./AuthModalProvider";

type IdentityType = "ic" | "passport";

interface RegisterFormState {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  identityType: IdentityType;
  icNumber: string;
  passportNumber: string;
  dob: string;
  nationality: string;
  currentLocation: string;
  avatarUrl: string;
  password: string;
  confirmPassword: string;
  educationLevel: string;
  currentInstitution: string;
  fieldOfInterestId: string;
  academicResult: string;
  studyPreferences: string;
  careerGoal: string;
}

interface FieldOfInterestOption {
  id: number;
  name: string;
}

const EDUCATION_LEVELS = [
  "SPM",
  "STPM",
  "A-Levels",
  "Foundation",
  "Diploma",
  "Bachelor",
  "Master",
  "Other",
] as const;

export default function RegisterModal() {
  const { isRegisterOpen, closeRegister, switchToLogin } = useAuthModals();
  const [formData, setFormData] = useState<RegisterFormState>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    identityType: "ic",
    icNumber: "",
    passportNumber: "",
    dob: "",
    nationality: "",
    currentLocation: "",
    avatarUrl: "",
    password: "",
    confirmPassword: "",
    educationLevel: "",
    currentInstitution: "",
    fieldOfInterestId: "",
    academicResult: "",
    studyPreferences: "",
    careerGoal: "",
  });
  const [fieldOptions, setFieldOptions] = useState<FieldOfInterestOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isRegisterOpen) {
      return;
    }
    let mounted = true;
    supabase
      .from("field_of_interest")
      .select("id,name")
      .order("name")
      .then(({ data, error }) => {
        if (mounted && !error && data) {
          setFieldOptions(data);
        } else if (error) {
          console.warn("Unable to load field_of_interest options", error.message);
        }
      });
    return () => {
      mounted = false;
    };
  }, [isRegisterOpen]);

  const identityLabel = useMemo(
    () => (formData.identityType === "ic" ? "IC Number" : "Passport Number"),
    [formData.identityType],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!formData.firstName || !formData.lastName) {
      setError("Please provide your first and last name.");
      return;
    }
    if (!formData.email) {
      setError("Email is required.");
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.identityType === "ic" && !formData.icNumber) {
      setError("IC Number is required for Malaysian IC identity type.");
      return;
    }
    if (formData.identityType === "passport" && !formData.passportNumber) {
      setError("Passport Number is required for passport identity type.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("Unable to complete registration. Please try again.");
      setLoading(false);
      return;
    }

    const { error: userDetailsError } = await supabase.from("users_details").insert({
      id: userId,
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phoneNumber || null,
      nationality: formData.nationality || null,
      current_location: formData.currentLocation || null,
      avatar_url: formData.avatarUrl || null,
      career_goal: formData.careerGoal || null,
      role: "student",
    });

    if (userDetailsError) {
      setError(userDetailsError.message);
      setLoading(false);
      return;
    }

    const fieldId = formData.fieldOfInterestId ? Number(formData.fieldOfInterestId) : null;
    const { error: studentError } = await supabase.from("students_details").insert({
      id: userId,
      education_level: formData.educationLevel || null,
      field_of_interest_id: fieldId,
      academic_result: formData.academicResult || null,
      study_preferences: formData.studyPreferences || null,
    });

    if (studentError) {
      setError(studentError.message);
      setLoading(false);
      return;
    }

    setStatus(
      "Account created! Please check your email for a verification link before signing in."
    );
    setLoading(false);
    closeRegister();
    switchToLogin();
  };

  return (
    <Dialog open={isRegisterOpen} onOpenChange={(open) => (!open ? closeRegister() : null)}>
      <DialogContent className="h-[90vh] w-full max-w-3xl gap-0 overflow-hidden border-none bg-white/95 p-0 shadow-2xl backdrop-blur-xl">
        <DialogHeader className="space-y-3 border-b border-slate-200/60 px-8 py-6 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-600">
            <GraduationCap className="size-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Create Your Account
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Start exploring Malaysian universities and programs today.
          </p>
        </DialogHeader>

        <ScrollArea className="h-full max-h-[calc(90vh-8rem)]">
          <form className="space-y-8 px-8 py-6" onSubmit={handleSubmit}>
            <Section title="Personal Information" description="Tell us about yourself to personalise your experience.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  id="firstName"
                  label="First Name"
                  placeholder="Enter first name"
                  icon={<User className="size-4" />}
                  value={formData.firstName}
                  onChange={(value) => setFormData((prev) => ({ ...prev, firstName: value }))}
                />
                <Field
                  id="lastName"
                  label="Last Name"
                  placeholder="Enter last name"
                  icon={<User className="size-4" />}
                  value={formData.lastName}
                  onChange={(value) => setFormData((prev) => ({ ...prev, lastName: value }))}
                />
                <Field
                  id="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  type="email"
                  icon={<Mail className="size-4" />}
                  value={formData.email}
                  onChange={(value) => setFormData((prev) => ({ ...prev, email: value }))}
                />
                <Field
                  id="phone"
                  label="Phone Number"
                  placeholder="+60 12-345-6789"
                  icon={<Phone className="size-4" />}
                  value={formData.phoneNumber}
                  onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))}
                />
                <div className="space-y-2">
                  <Label>Identity Type</Label>
                  <Select
                    value={formData.identityType}
                    onValueChange={(value: IdentityType) =>
                      setFormData((prev) => ({ ...prev, identityType: value }))
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select identity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ic">Malaysian IC Number</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field
                  id="identity-number"
                  label={identityLabel}
                  placeholder={formData.identityType === "ic" ? "123456-12-1234" : "A12345678"}
                  value={
                    formData.identityType === "ic" ? formData.icNumber : formData.passportNumber
                  }
                  onChange={(value) =>
                    setFormData((prev) =>
                      prev.identityType === "ic"
                        ? { ...prev, icNumber: value }
                        : { ...prev, passportNumber: value },
                    )
                  }
                />
                <Field
                  id="dob"
                  label="Date of Birth"
                  type="date"
                  icon={<Calendar className="size-4" />}
                  value={formData.dob}
                  onChange={(value) => setFormData((prev) => ({ ...prev, dob: value }))}
                />
                <Field
                  id="nationality"
                  label="Nationality"
                  placeholder="Enter nationality"
                  value={formData.nationality}
                  onChange={(value) => setFormData((prev) => ({ ...prev, nationality: value }))}
                />
                <Field
                  id="currentLocation"
                  label="Current Location"
                  placeholder="City, State"
                  icon={<MapPin className="size-4" />}
                  value={formData.currentLocation}
                  onChange={(value) => setFormData((prev) => ({ ...prev, currentLocation: value }))}
                />
                <Field
                  id="avatarUrl"
                  label="Avatar URL (optional)"
                  placeholder="https://example.com/profile.jpg"
                  icon={<Camera className="size-4" />}
                  value={formData.avatarUrl}
                  onChange={(value) => setFormData((prev) => ({ ...prev, avatarUrl: value }))}
                />
              </div>
            </Section>

            <Section title="Account Security" description="Secure your account with a strong password.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Create password"
                  icon={<Lock className="size-4" />}
                  value={formData.password}
                  onChange={(value) => setFormData((prev) => ({ ...prev, password: value }))}
                />
                <Field
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm password"
                  icon={<Lock className="size-4" />}
                  value={formData.confirmPassword}
                  onChange={(value) => setFormData((prev) => ({ ...prev, confirmPassword: value }))}
                />
              </div>
            </Section>

            <Section
              title="Academic Information"
              description="Share your current academic background and interests."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Education Level</Label>
                  <Select
                    value={formData.educationLevel}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, educationLevel: value }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Field
                  id="currentInstitution"
                  label="Current Institution"
                  placeholder="e.g., SMK Kuala Lumpur"
                  value={formData.currentInstitution}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, currentInstitution: value }))
                  }
                />
                <div className="space-y-2 md:col-span-2">
                  <Label>Field of Interest</Label>
                  <Select
                    value={formData.fieldOfInterestId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, fieldOfInterestId: value }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select preferred field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldOptions.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Field
                  id="academicResult"
                  label="Academic Result"
                  placeholder="CGPA, number of As, or highlight results"
                  value={formData.academicResult}
                  onChange={(value) => setFormData((prev) => ({ ...prev, academicResult: value }))}
                />
                <div className="md:col-span-2 space-y-2">
                  <Label>Study Preferences</Label>
                  <Textarea
                    placeholder="Preferred study locations, university type, budget, etc."
                    className="min-h-24"
                    value={formData.studyPreferences}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, studyPreferences: event.target.value }))
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Career Goal</Label>
                  <Textarea
                    placeholder="Tell us about your aspirations or desired career path."
                    className="min-h-24"
                    value={formData.careerGoal}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, careerGoal: event.target.value }))
                    }
                  />
                </div>
              </div>
            </Section>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {status && <p className="text-sm text-green-600">{status}</p>}

            <div className="flex flex-col gap-4 pb-6">
              <Button
                type="submit"
                className="h-11 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-700"
                  onClick={switchToLogin}
                >
                  Sign in instead
                </button>
              </p>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface SectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <header className="space-y-1">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Target className="size-5 text-blue-600" />
          {title}
        </h2>
        <p className="text-sm text-gray-600">{description}</p>
      </header>
      {children}
    </section>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
}

function Field({ id, label, value, onChange, placeholder, type = "text", icon }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={icon ? "h-11 pl-10" : "h-11"}
        />
      </div>
    </div>
  );
}
