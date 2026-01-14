"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  XCircle,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuthModals } from "./AuthModalProvider";
import PhoneInput from "@/components/ui/phone-input";

// Step 1: Email & Account Security (OTP + Password + Personal Details)
interface Step1Data {
  fullName: string;
  phoneNumber: string;
  currentLocation: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Step 2: Education Details
type StudyLevel = "SPM" | "STPM";
type SubjectGrade = "A" | "B" | "C" | "D" | "E" | "G" | "0";

interface Step2Data {
  studyLevel: StudyLevel;
  extracurricular: boolean;
  bm: SubjectGrade;
  english: SubjectGrade;
  history: SubjectGrade;
  mathematics: SubjectGrade;
  islamicEducationMoralEducation: SubjectGrade;
  physics: SubjectGrade;
  chemistry: SubjectGrade;
  biology: SubjectGrade;
  additionalMathematics: SubjectGrade;
  geography: SubjectGrade;
  economics: SubjectGrade;
  accounting: SubjectGrade;
  chinese: SubjectGrade;
  tamil: SubjectGrade;
  ict: SubjectGrade;
}

// Step 3: Interest & Skills Survey
interface Step3Data {
  mathsInterest: number;
  scienceInterest: number;
  computerInterest: number;
  writingInterest: number;
  artInterest: number;
  businessInterest: number;
  socialInterest: number;
  logicalThinking: number;
  problemSolving: number;
  creativity: number;
  communication: number;
  teamwork: number;
  leadership: number;
  attentionToDetail: number;
}

// Step 4: Preferences
interface Step4Data {
  budgetRange: string;
  preferredLocation: string;
  preferredCountry?: string;
  studyMode?: string;
}

const SUBJECTS = [
  { key: "bm", label: "Bahasa Malaysia" },
  { key: "english", label: "English" },
  { key: "history", label: "History" },
  { key: "mathematics", label: "Mathematics" },
  {
    key: "islamicEducationMoralEducation",
    label: "Islamic Education / Moral Education",
  },
  { key: "physics", label: "Physics" },
  { key: "chemistry", label: "Chemistry" },
  { key: "biology", label: "Biology" },
  { key: "additionalMathematics", label: "Additional Mathematics" },
  { key: "geography", label: "Geography" },
  { key: "economics", label: "Economics" },
  { key: "accounting", label: "Accounting" },
  { key: "chinese", label: "Chinese" },
  { key: "tamil", label: "Tamil" },
  { key: "ict", label: "ICT" },
] as const;

const GRADES: SubjectGrade[] = ["A", "B", "C", "D", "E", "G", "0"];

const INTEREST_FIELDS = [
  { key: "mathsInterest", label: "Mathematics" },
  { key: "scienceInterest", label: "Science" },
  { key: "computerInterest", label: "Computers/IT" },
  { key: "writingInterest", label: "Writing" },
  { key: "artInterest", label: "Arts" },
  { key: "businessInterest", label: "Business" },
  { key: "socialInterest", label: "Social Sciences" },
] as const;

const SKILL_FIELDS = [
  { key: "logicalThinking", label: "Logical Thinking" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "creativity", label: "Creativity" },
  { key: "communication", label: "Communication" },
  { key: "teamwork", label: "Teamwork" },
  { key: "leadership", label: "Leadership" },
  { key: "attentionToDetail", label: "Attention to Detail" },
] as const;

export default function MultiStepRegisterModal() {
  const { isRegisterOpen, closeRegister, switchToLogin } = useAuthModals();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [nameErrors, setNameErrors] = useState<string>("");
  const [phoneErrors, setPhoneErrors] = useState<string>("");
  const [locationErrors, setLocationErrors] = useState<string>("");
  const [emailErrors, setEmailErrors] = useState<string>("");
  const [passwordErrors, setPasswordErrors] = useState<string>("");
  const [confirmPasswordErrors, setConfirmPasswordErrors] =
    useState<string>("");
  
  // Global dropdown state - ensures only one dropdown is open at a time
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Form data for each step
  const [step1Data, setStep1Data] = useState<Step1Data>({
    fullName: "",
    phoneNumber: "",
    currentLocation: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    studyLevel: "SPM",
    extracurricular: false,
    bm: "0",
    english: "0",
    history: "0",
    mathematics: "0",
    islamicEducationMoralEducation: "0",
    physics: "0",
    chemistry: "0",
    biology: "0",
    additionalMathematics: "0",
    geography: "0",
    economics: "0",
    accounting: "0",
    chinese: "0",
    tamil: "0",
    ict: "0",
  });

  const [step3Data, setStep3Data] = useState<Step3Data>({
    mathsInterest: 3,
    scienceInterest: 3,
    computerInterest: 3,
    writingInterest: 3,
    artInterest: 3,
    businessInterest: 3,
    socialInterest: 3,
    logicalThinking: 3,
    problemSolving: 3,
    creativity: 3,
    communication: 3,
    teamwork: 3,
    leadership: 3,
    attentionToDetail: 3,
  });

  const [step4Data, setStep4Data] = useState<Step4Data>({
    budgetRange: "",
    preferredLocation: "",
    preferredCountry: "",
    studyMode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset active dropdown when step changes
  useEffect(() => {
    setActiveDropdown(null);
  }, [currentStep]);

  useEffect(() => {
    if (!isRegisterOpen) {
      setActiveDropdown(null); // Close all dropdowns when modal closes
      setStep1Data({
        fullName: "",
        phoneNumber: "",
        currentLocation: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setStep2Data({
        studyLevel: "SPM",
        extracurricular: false,
        bm: "0",
        english: "0",
        history: "0",
        mathematics: "0",
        islamicEducationMoralEducation: "0",
        physics: "0",
        chemistry: "0",
        biology: "0",
        additionalMathematics: "0",
        geography: "0",
        economics: "0",
        accounting: "0",
        chinese: "0",
        tamil: "0",
        ict: "0",
      });
      setStep3Data({
        mathsInterest: 3,
        scienceInterest: 3,
        computerInterest: 3,
        writingInterest: 3,
        artInterest: 3,
        businessInterest: 3,
        socialInterest: 3,
        logicalThinking: 3,
        problemSolving: 3,
        creativity: 3,
        communication: 3,
        teamwork: 3,
        leadership: 3,
        attentionToDetail: 3,
      });
      setStep4Data({
        budgetRange: "",
        preferredLocation: "",
        preferredCountry: "",
        studyMode: "",
      });
      setCurrentStep(1);
      setError(null);
      setNameErrors("");
      setPhoneErrors("");
      setLocationErrors("");
      setEmailErrors("");
      setPasswordErrors("");
      setConfirmPasswordErrors("");
    }
  }, [isRegisterOpen]);

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailErrors("Email is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailErrors("Please enter a valid email address.");
      return false;
    }
    setEmailErrors("");
    return true;
  };

  const validatePassword = (password: string) => {
    setPasswordErrors("");
    if (!password) {
      setPasswordErrors("Password is required.");
      return false;
    }
    if (password.length < 8) {
      setPasswordErrors("Password must be at least 8 characters long.");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordErrors("Password must contain at least one uppercase letter.");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordErrors("Password must contain at least one number.");
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setPasswordErrors(
        "Password must contain at least one special character."
      );
      return false;
    }
    // Check if password contains email
    const emailLower = step1Data.email.toLowerCase();
    const passwordLower = password.toLowerCase();
    if (emailLower && passwordLower.includes(emailLower)) {
      setPasswordErrors("Password cannot contain your email address.");
      return false;
    }
    setPasswordErrors("");
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    setConfirmPasswordErrors("");
    if (!confirmPassword) {
      setConfirmPasswordErrors("Please confirm your password.");
      return false;
    }
    if (confirmPassword !== step1Data.password) {
      setConfirmPasswordErrors("Passwords do not match.");
      return false;
    }
    setConfirmPasswordErrors("");
    return true;
  };

  const validateName = (name: string) => {
    setNameErrors("");
    if (!name || name.trim().length < 2) {
      setNameErrors("Full name is required (min 2 characters).");
      return false;
    }
    return true;
  };

  const validatePhone = (phone: string) => {
    setPhoneErrors("");
    if (!phone || phone.trim().length === 0) {
      setPhoneErrors("Phone number is required.");
      return false;
    }
    
    // Validate E.164 format: + followed by 8-15 digits
    const e164Regex = /^\+\d{8,15}$/;
    const sanitizedPhone = phone.replace(/[\s\-\(\)]/g, ''); // Remove formatting
    
    if (!e164Regex.test(sanitizedPhone)) {
      setPhoneErrors("Phone number must include country code (e.g., +60123456789)");
      return false;
    }
    
    return true;
  };

  const validateLocation = (loc: string) => {
    setLocationErrors("");
    if (!loc || loc.trim().length < 2) {
      setLocationErrors("Current location is required.");
      return false;
    }
    return true;
  };

  const handleStep1 = async () => {
    setError(null);
    setEmailErrors("");

    // Step 1: Validate all form fields first
    const isNameValid = validateName(step1Data.fullName);
    const isPhoneValid = validatePhone(step1Data.phoneNumber);
    const isEmailValid = validateEmail(step1Data.email);
    const isPasswordValid = validatePassword(step1Data.password);
    const isConfirmPasswordValid = validateConfirmPassword(
      step1Data.confirmPassword
    );
    const isLocationValid = validateLocation(step1Data.currentLocation);

    if (
      !isNameValid ||
      !isPhoneValid ||
      !isEmailValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid ||
      !isLocationValid
    ) {
      return;
    }

    // Step 2: Check if email already exists - THIS IS MANDATORY
    setLoading(true);
    setEmailErrors(""); // Clear any previous errors
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const emailCheckUrl = `${backendUrl}/api/auth/check-email?email=${encodeURIComponent(step1Data.email.trim())}`;
      
      console.log("🔍 [Step 1] Starting email existence check for:", step1Data.email);
      console.log("🔍 [Step 1] API URL:", emailCheckUrl);
      
      const response = await fetch(emailCheckUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📡 [Step 1] Email check response status:", response.status, response.statusText);

      if (!response.ok) {
        // If API call fails (404, 500, etc.), show error and BLOCK progression
        let errorMessage = "Unable to verify email. Please check your connection and try again.";
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use status-based message
          if (response.status === 404) {
            errorMessage = "Email verification service is unavailable. Please ensure the backend server is running and try again.";
          } else if (response.status === 500) {
            errorMessage = "Email verification service error. Please try again later.";
          }
        }
        
        console.error("❌ [Step 1] Email check API error:", response.status, response.statusText);
        
        setEmailErrors(errorMessage);
        setLoading(false);
        return; // BLOCK - Do not proceed to step 2
      }

      const data = await response.json();
      console.log("✅ [Step 1] Email check result:", data);

      // Validate response structure
      if (typeof data.exists !== 'boolean') {
        console.error("❌ [Step 1] Invalid response format:", data);
        setEmailErrors("Invalid response from email verification service. Please try again.");
        setLoading(false);
        return; // BLOCK - Do not proceed to step 2
      }

      if (data.exists === true) {
        // Email exists in auth.users - BLOCK user from proceeding
        console.log("⚠️ [Step 1] Email already exists in auth.users - BLOCKING progression");
        const errorMsg = data.message || "This email is already registered. Please use a different email or try logging in.";
        setEmailErrors(errorMsg);
        setLoading(false);
        return; // BLOCK - Do not proceed to step 2
      }

      // Email is NOT found in auth.users - ALLOW progression to step 2
      console.log("✅ [Step 1] Email is NOT in auth.users - ALLOWING progression to step 2");
      setEmailErrors(""); // Clear any errors
      setCurrentStep(2);
      
    } catch (error) {
      // Network error or other exception - BLOCK progression
      console.error("❌ [Step 1] Error checking email:", error);
      setEmailErrors("Unable to verify email. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = () => {
    setError(null);
    setCurrentStep(3);
  };

  const handleStep3 = () => {
    setError(null);
    setCurrentStep(4);
  };

  const handleStep4 = async () => {
    setError(null);
    setLoading(true);

    if (!step4Data.budgetRange || !step4Data.preferredLocation) {
      setError("Please fill in budget range and preferred location.");
      setLoading(false);
      return;
    }

    try {
      // Sanitize phone number to E.164 format (remove spaces, dashes, parentheses)
      const sanitizedPhone = step1Data.phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...step1Data,
          phoneNumber: sanitizedPhone, // Use sanitized phone
          ...step2Data,
          ...step3Data,
          ...step4Data,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to complete registration");
      }

      setError(null);
      setShowSuccess(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to complete registration";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <Dialog open={isRegisterOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[480px] border-none shadow-2xl p-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-emerald-600/10 pointer-events-none" />
          
          <div className="relative flex flex-col items-center justify-center px-8 py-12 text-center">
            {/* Success Icon - Enhanced with glow */}
            <div className="mb-8 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 shadow-2xl ring-8 ring-emerald-500/30 animate-pulse">
              <Check className="size-10 text-white stroke-[3]" />
            </div>

            {/* Title */}
            <DialogTitle className="mb-4 text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent tracking-tight">
              Registration Successful
            </DialogTitle>

            {/* Description */}
            <DialogDescription className="text-base text-gray-200 mb-6 max-w-sm leading-relaxed">
              Your account has been created. We&apos;ve sent a verification link to:
            </DialogDescription>

            {/* Email Address - Enhanced with vibrant colors */}
            <div className="mb-6 w-full max-w-sm px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 border-2 border-blue-400/50 backdrop-blur-sm shadow-lg">
              <p className="text-base font-semibold text-blue-300 break-all">
                {step1Data.email}
              </p>
            </div>

            {/* Instructions */}
            <p className="text-sm text-gray-300 mb-8 max-w-sm leading-relaxed">
              Please check your inbox and click the verification link to activate your account and access the platform.
            </p>

            {/* CTA Button - Enhanced gradient */}
            <Button
              onClick={() => {
                setShowSuccess(false);
                closeRegister();
                switchToLogin();
              }}
              className="w-full max-w-xs bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-700 hover:via-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 transform hover:scale-105"
            >
              Continue to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <Dialog
      open={isRegisterOpen}
      onOpenChange={(open) => (!open ? closeRegister() : null)}
    >
      <DialogContent className="h-[92vh] w-[70vw] sm:max-w-[70vw] gap-0 overflow-hidden border-none bg-white p-0 shadow-2xl">
        <DialogHeader className="space-y-4 border-b border-gray-200 px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
              <GraduationCap className="size-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Create Your Account
              </DialogTitle>
              <p className="text-sm text-gray-500 font-normal">
                Step {currentStep} of 4
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2 bg-gray-200" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Account Setup</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-900 mb-1">
                  Registration Error
                </h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Email & Account Security (OTP + Password) */}
          {currentStep === 1 && (
            <Step1Form
              data={step1Data}
              setData={setStep1Data}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              emailErrors={emailErrors}
              passwordErrors={passwordErrors}
              confirmPasswordErrors={confirmPasswordErrors}
              nameErrors={nameErrors}
              phoneErrors={phoneErrors}
              locationErrors={locationErrors}
              setLocationErrors={setLocationErrors}
              setActiveDropdown={setActiveDropdown}
              onNameChange={(name) => {
                setStep1Data({ ...step1Data, fullName: name });
                validateName(name);
              }}
              onPhoneChange={(phone) => {
                setStep1Data({ ...step1Data, phoneNumber: phone });
                validatePhone(phone);
              }}
              onLocationChange={(loc) => {
                setStep1Data({ ...step1Data, currentLocation: loc });
                validateLocation(loc);
              }}
              onEmailChange={(email) => {
                setStep1Data({ ...step1Data, email });
                validateEmail(email);
              }}
              onPasswordChange={(password) => {
                setStep1Data({ ...step1Data, password });
                validatePassword(password);
              }}
              onConfirmPasswordChange={(confirmPassword) => {
                setStep1Data({ ...step1Data, confirmPassword });
                validateConfirmPassword(confirmPassword);
              }}
            />
          )}

          {/* Step 2: Education Details */}
          {currentStep === 2 && (
            <Step2Form 
              data={step2Data} 
              setData={setStep2Data}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          )}

          {/* Step 3: Interest & Skills Survey */}
          {currentStep === 3 && (
            <Step3Form 
              data={step3Data} 
              setData={setStep3Data}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          )}

          {/* Step 4: Preferences */}
          {currentStep === 4 && (
            <Step4Form 
              data={step4Data} 
              setData={setStep4Data}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          )}
        </div>

        <div className="border-t border-gray-200 px-8 py-5 flex items-center justify-between bg-gray-50">
          <Button
            variant="ghost"
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1 || loading}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-white disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-3">
            {currentStep < 4 ? (
              <Button
                onClick={async () => {
                  if (currentStep === 1) await handleStep1();
                  else if (currentStep === 2) handleStep2();
                  else if (currentStep === 3) handleStep3();
                }}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? "Processing..." : "Next"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleStep4}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Check className="w-4 h-4" />
                {loading ? "Creating Account..." : "Complete Registration"}
              </Button>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-8 py-4 text-center bg-white">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              onClick={switchToLogin}
            >
              Sign in instead
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Password Strength Checker Component
function PasswordStrengthChecker({ password, email }: { password: string; email: string }) {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    notContainsEmail: !email || !password.toLowerCase().includes(email.toLowerCase()),
  };

  const CheckItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
      )}
      <span className={`text-sm ${met ? "text-green-700" : "text-gray-600"}`}>
        {text}
      </span>
    </div>
  );

  if (!password) return null;

  return (
    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
      <p className="text-sm font-medium text-gray-700 mb-2">
        Password Requirements:
      </p>
      <CheckItem met={checks.minLength} text="At least 8 characters" />
      <CheckItem met={checks.hasUppercase} text="One uppercase letter" />
      <CheckItem met={checks.hasNumber} text="One number" />
      <CheckItem met={checks.hasSpecial} text="One special character (!@#$%...)" />
      <CheckItem met={checks.notContainsEmail} text="Does not contain email" />
    </div>
  );
}

// Step 1 Component
function Step1Form({
  data,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  emailErrors,
  passwordErrors,
  confirmPasswordErrors,
  nameErrors,
  phoneErrors,
  locationErrors,
  setLocationErrors,
  setActiveDropdown,
  onNameChange,
  onPhoneChange,
  onLocationChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
}: {
  data: Step1Data;
  setData: (data: Step1Data) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  emailErrors: string;
  passwordErrors: string;
  confirmPasswordErrors: string;
  nameErrors: string;
  phoneErrors: string;
  locationErrors: string;
  setLocationErrors: (msg: string) => void;
  setActiveDropdown: (key: string | null) => void;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  onLocationChange: (loc: string) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
}) {
  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setLocationErrors("Geolocation not supported by your browser.");
      return;
    }
    setLocationErrors("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const fallback = `Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`;
        onLocationChange(fallback);
        try {
          // Use backend proxy to avoid CORS issues
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
          const resp = await fetch(
            `${backendUrl}/api/auth/reverse-geocode?lat=${lat}&lon=${lon}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          
          if (!resp.ok) {
            // If API fails, use fallback coordinates
            console.warn('[Location] Reverse geocoding API error:', resp.status, resp.statusText);
            onLocationChange(fallback);
            return;
          }
          
          const data = await resp.json();
          console.log('[Location] Reverse geocoding result:', data);
          
          // Use the formatted location from backend
          if (data.location) {
            onLocationChange(data.location);
          } else {
            onLocationChange(fallback);
          }
        } catch (error) {
          // If API call fails (network error, etc.), use fallback coordinates
          console.warn('[Location] Failed to fetch location:', error);
          onLocationChange(fallback);
        }
      },
      () =>
        setLocationErrors("Unable to detect location. Please enter manually."),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const passwordMismatch =
    data.confirmPassword &&
    data.password &&
    data.password !== data.confirmPassword;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Email & Account Security
        </h2>
        <p className="text-sm text-gray-500">
          Create your account with a secure password
        </p>
      </div>

      {/* Personal Information Section */}
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={data.fullName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1.5"
                aria-invalid={!!nameErrors}
              />
              {nameErrors && (
                <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  {nameErrors}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="Enter your email address"
                className="mt-1.5"
                aria-invalid={!!emailErrors}
              />
              {emailErrors && (
                <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  {emailErrors}
                </p>
              )}
            </div>

            <div>
              <PhoneInput
                id="phoneNumber"
                label="Phone Number"
                value={data.phoneNumber}
                defaultCountry="MY"
                onChange={(value) => onPhoneChange(value || "")}
                placeholder="12-345-6789"
                required
                error={phoneErrors}
                setActiveDropdown={setActiveDropdown}
              />
            </div>

            <div>
              <Label
                htmlFor="currentLocation"
                className="text-sm font-medium text-gray-700"
              >
                Current Location <span className="text-red-500">*</span>
              </Label>
              <div className="mt-1.5 flex gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="currentLocation"
                    value={data.currentLocation}
                    onChange={(e) => onLocationChange(e.target.value)}
                    placeholder="Enter your city"
                    className="pl-9"
                    aria-invalid={!!locationErrors}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAutoDetect}
                  className="whitespace-nowrap"
                >
                  Auto-detect
                </Button>
              </div>
              {locationErrors && (
                <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  {locationErrors}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Security Section */}
      <div className="space-y-5 pt-4 border-t border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">
          Account Security
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-1.5">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={data.password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Create a strong password"
                className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  passwordErrors
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
                aria-invalid={!!passwordErrors}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <PasswordStrengthChecker password={data.password} email={data.email} />
          </div>

          <div>
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-1.5">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={data.confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                placeholder="Re-enter your password"
                className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  confirmPasswordErrors || passwordMismatch
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
                aria-invalid={!!confirmPasswordErrors || !!passwordMismatch}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {confirmPasswordErrors && (
              <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                {confirmPasswordErrors}
              </p>
            )}
            {!confirmPasswordErrors && passwordMismatch && (
              <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                Passwords do not match
              </p>
            )}
            {!confirmPasswordErrors &&
              !passwordMismatch &&
              data.confirmPassword &&
              data.password === data.confirmPassword && (
                <p className="text-sm text-green-600 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Passwords match
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2 Component
function Step2Form({
  data,
  setData,
  activeDropdown,
  setActiveDropdown,
}: {
  data: Step2Data;
  setData: (data: Step2Data) => void;
  activeDropdown: string | null;
  setActiveDropdown: (key: string | null) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Education Details
        </h2>
        <p className="text-gray-600">
          Select your study level and enter your academic subject grades.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="text-gray-900 font-medium">Study Level *</Label>
          <Select
            value={data.studyLevel}
            onValueChange={(value: StudyLevel) =>
              setData({ ...data, studyLevel: value })
            }
            open={activeDropdown === "study-level"}
            onOpenChange={(isOpen) => setActiveDropdown(isOpen ? "study-level" : null)}
          >
            <SelectTrigger className="mt-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2 transition-colors duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SPM">SPM</SelectItem>
              <SelectItem value="STPM">STPM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Label className="text-gray-900 font-medium">
            Extracurricular Activities
          </Label>
          <Select
            value={data.extracurricular ? "yes" : "no"}
            onValueChange={(value) =>
              setData({ ...data, extracurricular: value === "yes" })
            }
            open={activeDropdown === "extracurricular"}
            onOpenChange={(isOpen) => setActiveDropdown(isOpen ? "extracurricular" : null)}
          >
            <SelectTrigger className="w-32 border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2 transition-colors duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Academic Subjects
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {SUBJECTS.map((subject) => (
            <div key={subject.key}>
              <Label className="text-gray-900 font-medium">
                {subject.label}
              </Label>
              <Select
                value={data[subject.key as keyof Step2Data] as string}
                onValueChange={(value: SubjectGrade) =>
                  setData({ ...data, [subject.key]: value })
                }
                open={activeDropdown === `grade-${subject.key}`}
                onOpenChange={(isOpen) => setActiveDropdown(isOpen ? `grade-${subject.key}` : null)}
              >
                <SelectTrigger className="mt-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2 transition-colors duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade === "0" ? "Not Taken" : grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 3 Component
function Step3Form({
  data,
  setData,
  activeDropdown,
  setActiveDropdown,
}: {
  data: Step3Data;
  setData: (data: Step3Data) => void;
  activeDropdown: string | null;
  setActiveDropdown: (key: string | null) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Interest & Skills Survey
        </h2>
        <p className="text-gray-600">
          Rate your interests and skills on a scale of 1-5 (1 = Low, 5 = High).
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interests</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {INTEREST_FIELDS.map((field) => (
            <div key={field.key}>
              <Label className="text-gray-900 font-medium">{field.label}</Label>
              <Select
                value={String(data[field.key as keyof Step3Data])}
                onValueChange={(value) =>
                  setData({ ...data, [field.key]: parseInt(value) })
                }
                open={activeDropdown === `interest-${field.key}`}
                onOpenChange={(isOpen) => setActiveDropdown(isOpen ? `interest-${field.key}` : null)}
              >
                <SelectTrigger className="mt-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2 transition-colors duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} -{" "}
                      {num === 1 ? "Low" : num === 5 ? "High" : "Medium"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {SKILL_FIELDS.map((field) => (
            <div key={field.key}>
              <Label className="text-gray-900 font-medium">{field.label}</Label>
              <Select
                value={String(data[field.key as keyof Step3Data])}
                onValueChange={(value) =>
                  setData({ ...data, [field.key]: parseInt(value) })
                }
                open={activeDropdown === `skill-${field.key}`}
                onOpenChange={(isOpen) => setActiveDropdown(isOpen ? `skill-${field.key}` : null)}
              >
                <SelectTrigger className="mt-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2 transition-colors duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} -{" "}
                      {num === 1 ? "Low" : num === 5 ? "High" : "Medium"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 4 Component
function Step4Form({
  data,
  setData,
  activeDropdown,
  setActiveDropdown,
}: {
  data: Step4Data;
  setData: (data: Step4Data) => void;
  activeDropdown: string | null;
  setActiveDropdown: (key: string | null) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Preferences
        </h2>
        <p className="text-gray-600">
          Tell us about your study preferences to get better recommendations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="budgetRange" className="text-gray-900 font-medium">
            Budget Range *
          </Label>
          <Input
            id="budgetRange"
            value={data.budgetRange}
            onChange={(e) => setData({ ...data, budgetRange: e.target.value })}
            placeholder="e.g., RM 50,000 - RM 100,000"
            className="mt-2"
          />
        </div>

        <div>
          <Label
            htmlFor="preferredLocation"
            className="text-gray-900 font-medium"
          >
            Preferred Location *
          </Label>
          <Input
            id="preferredLocation"
            value={data.preferredLocation}
            onChange={(e) =>
              setData({ ...data, preferredLocation: e.target.value })
            }
            placeholder="e.g., Kuala Lumpur"
            className="mt-2"
          />
        </div>

        <div>
          <Label
            htmlFor="preferredCountry"
            className="text-gray-900 font-medium"
          >
            Preferred Country (Optional)
          </Label>
          <Input
            id="preferredCountry"
            value={data.preferredCountry || ""}
            onChange={(e) =>
              setData({ ...data, preferredCountry: e.target.value })
            }
            placeholder="e.g., Malaysia"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="studyMode" className="text-gray-900 font-medium">
            Study Mode (Optional)
          </Label>
          <Select
            value={data.studyMode || ""}
            onValueChange={(value) => setData({ ...data, studyMode: value })}
            open={activeDropdown === "study-mode"}
            onOpenChange={(isOpen) => setActiveDropdown(isOpen ? "study-mode" : null)}
          >
            <SelectTrigger className="mt-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2 transition-colors duration-200">
              <SelectValue placeholder="Select study mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
