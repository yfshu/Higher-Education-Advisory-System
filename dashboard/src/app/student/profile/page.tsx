"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  GraduationCap,
  Target,
  MapPin,
  Phone,
  Mail,
  History,
  Camera,
  Edit,
  Save,
  X,
  Upload,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { AvatarCropModal } from "@/components/ui/avatar-crop-modal";

// Subject mapping for display
const SUBJECTS = [
  { key: "bm", label: "Bahasa Malaysia" },
  { key: "english", label: "English" },
  { key: "history", label: "History" },
  { key: "mathematics", label: "Mathematics" },
  { key: "islamicEducationMoralEducation", label: "Islamic Education / Moral Education" },
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

// Interests mapping
const INTERESTS = [
  { key: "mathsInterest", label: "Mathematics" },
  { key: "scienceInterest", label: "Science" },
  { key: "computerInterest", label: "Computer / Technology" },
  { key: "writingInterest", label: "Writing / Media" },
  { key: "artInterest", label: "Art / Design" },
  { key: "businessInterest", label: "Business / Economics" },
  { key: "socialInterest", label: "Social / Community" },
] as const;

// Skills mapping
const SKILLS = [
  { key: "logicalThinking", label: "Logical Thinking" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "creativity", label: "Creativity" },
  { key: "communication", label: "Communication" },
  { key: "teamwork", label: "Teamwork" },
  { key: "leadership", label: "Leadership" },
  { key: "attentionToDetail", label: "Attention to Detail" },
] as const;

export default function StudentProfile() {
  const { userData, setUserData } = useUser();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Edit states for different sections
  const [editingAcademic, setEditingAcademic] = useState(false);
  const [editingInterests, setEditingInterests] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);
  
  // Form data states
  const [academicData, setAcademicData] = useState<Record<string, string | undefined>>({});
  const [interestsData, setInterestsData] = useState<Record<string, string | number | string[] | undefined>>({});
  const [preferencesData, setPreferencesData] = useState<Record<string, string | number | undefined>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropPreview, setCropPreview] = useState<string | null>(null);

  const user = userData?.user;
  const profile = userData?.profile;
  const preferences = userData?.preferences;
  
  // Debug: Log avatar URL and verify it's a valid URL
  useEffect(() => {
    if (profile?.avatarUrl) {
      console.log("🖼️ Current avatar URL:", profile.avatarUrl);
      console.log("🖼️ Avatar URL type:", typeof profile.avatarUrl);
      console.log("🖼️ Avatar URL is valid URL:", profile.avatarUrl.startsWith('http'));
      // Test if URL is accessible
      if (profile.avatarUrl.startsWith('http')) {
        fetch(profile.avatarUrl, { method: 'HEAD' })
          .then(res => {
            console.log("✅ Avatar URL is accessible, status:", res.status);
          })
          .catch(err => {
            console.error("❌ Avatar URL is not accessible:", err);
          });
      }
    } else {
      console.log("⚠️ No avatar URL in profile");
      console.log("⚠️ Profile data:", profile);
    }
  }, [profile?.avatarUrl]);
  
  // Fetch latest profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const sessionRes = await supabase.auth.getSession();
        const accessToken = sessionRes.data.session?.access_token;
        if (!accessToken) {
          console.log("⚠️ No access token, skipping profile fetch");
          return;
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
        const res = await fetch(`${backendUrl}/api/profile/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("✅ Profile data fetched:", data);
          console.log("✅ Avatar URL from API:", data.profile?.avatarUrl);
          if (userData) {
            const updatedData = {
              ...userData,
              user: data.user,
              profile: data.profile,
              preferences: data.preferences,
            };
            setUserData(updatedData);
            localStorage.setItem("userData", JSON.stringify(updatedData));
          }
        } else {
          console.error("❌ Failed to fetch profile:", res.status, res.statusText);
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []); // Only run on mount

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setAcademicData({
        studyLevel: profile.studyLevel || "",
        extracurricular: profile.extracurricular ? "yes" : "no",
        bm: profile.bm || "0",
        english: profile.english || "0",
        history: profile.history || "0",
        mathematics: profile.mathematics || "0",
        islamicEducationMoralEducation: profile.islamicEducationMoralEducation || "0",
        physics: profile.physics || "0",
        chemistry: profile.chemistry || "0",
        biology: profile.biology || "0",
        additionalMathematics: profile.additionalMathematics || "0",
        geography: profile.geography || "0",
        economics: profile.economics || "0",
        accounting: profile.accounting || "0",
        chinese: profile.chinese || "0",
        tamil: profile.tamil || "0",
        ict: profile.ict || "0",
      });
      
      setInterestsData({
        mathsInterest: profile.mathsInterest || 1,
        scienceInterest: profile.scienceInterest || 1,
        computerInterest: profile.computerInterest || 1,
        writingInterest: profile.writingInterest || 1,
        artInterest: profile.artInterest || 1,
        businessInterest: profile.businessInterest || 1,
        socialInterest: profile.socialInterest || 1,
        logicalThinking: profile.logicalThinking || 1,
        problemSolving: profile.problemSolving || 1,
        creativity: profile.creativity || 1,
        communication: profile.communication || 1,
        teamwork: profile.teamwork || 1,
        leadership: profile.leadership || 1,
        attentionToDetail: profile.attentionToDetail || 1,
      });
    }
    
    if (preferences) {
      setPreferencesData({
        budgetRange: preferences.budgetRange || "",
        preferredLocation: preferences.preferredLocation || "",
        preferredCountry: preferences.preferredCountry || "",
        studyMode: preferences.studyMode || "",
      });
    }
  }, [profile, preferences]);

  // Calculate profile completion percentage
  const completionPercentage = useMemo(() => {
    if (!profile) return 0;

    let completed = 0;
    let total = 0;

    // Personal Information (30%)
    total += 3;
    if (user?.fullName) completed += 1;
    if (user?.email) completed += 1;
    if (profile.phoneNumber) completed += 1;

    // Academic Background (30%)
    total += 3;
    if (profile.studyLevel) completed += 1;
    const hasGrades = SUBJECTS.some((s) => profile[s.key as keyof typeof profile]);
    if (hasGrades) completed += 1;
    if (profile.extracurricular !== undefined) completed += 1;

    // Interests & Skills (25%)
    total += 2.5;
    const hasInterests = INTERESTS.some((i) => profile[i.key as keyof typeof profile]);
    if (hasInterests) completed += 1.25;
    const hasSkills = SKILLS.some((s) => profile[s.key as keyof typeof profile]);
    if (hasSkills) completed += 1.25;

    // Preferences (15%)
    total += 1.5;
    if (preferences?.budgetRange) completed += 0.5;
    if (preferences?.preferredLocation) completed += 0.5;
    if (preferences?.preferredCountry || preferences?.studyMode) completed += 0.5;

    return Math.round((completed / total) * 100);
  }, [profile, user, preferences]);

  const formatGrade = (grade: string | undefined | null): string => {
    if (!grade || grade === "0") return "Not Taken";
    return grade;
  };

  const getInterestLevel = (value: number | undefined | null): string => {
    if (!value) return "Not specified";
    return `${value}/5`;
  };

  const getSkillLevel = (value: number | undefined | null): string => {
    if (!value) return "Not specified";
    return `${value}/5`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setError("Only JPG and PNG images are allowed.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    // Store the original file for upload
    setSelectedFile(file);

    // Show in crop modal
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedPreview: string, croppedFile: File) => {
    // Store the cropped preview for display
    setCropPreview(croppedPreview);
    setShowCropModal(false);
    
    // Upload the CROPPED file (not the original)
    console.log("✅ Uploading cropped file:", {
      name: croppedFile.name,
      size: croppedFile.size,
      type: croppedFile.type,
    });
    
    // Clean up previous preview URL if it exists
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    
    uploadCroppedFile(croppedFile);
  };

  const uploadCroppedFile = async (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const formData = new FormData();
      formData.append("file", file); // Upload CROPPED file

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const res = await fetch(`${backendUrl}/api/profile/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload avatar");
      }

      const data = await res.json();
      console.log("✅ Avatar upload response:", data);
      console.log("✅ Avatar URL from backend:", data.avatarUrl);
      
      // Immediately update with the signed URL from upload response
      if (userData && data.avatarUrl) {
        const updatedUserData = {
          ...userData,
          profile: {
            ...userData.profile,
            avatarUrl: data.avatarUrl,
          },
        };
        console.log("✅ Updating user context with avatar URL:", data.avatarUrl);
        setUserData(updatedUserData);
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
      }

      setSuccess("Avatar uploaded successfully!");
      
      // Re-fetch profile to get fresh signed URL and ensure consistency
      try {
        const sessionRes = await supabase.auth.getSession();
        const accessToken = sessionRes.data.session?.access_token;
        if (accessToken) {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
          const profileRes = await fetch(`${backendUrl}/api/profile/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            console.log("✅ Profile refreshed after upload:", profileData);
            console.log("✅ Fresh avatar URL:", profileData.profile?.avatarUrl);
            if (userData) {
              const refreshedData = {
                ...userData,
                user: profileData.user,
                profile: profileData.profile,
                preferences: profileData.preferences,
              };
              setUserData(refreshedData);
              localStorage.setItem("userData", JSON.stringify(refreshedData));
            }
          }
        }
      } catch (err) {
        console.error("⚠️ Failed to refresh profile after upload:", err);
        // Continue anyway, we already have the URL from upload response
      }
      
      // Clear crop preview after showing success, use actual URL from server
      setTimeout(() => {
        // Clean up preview URL
        if (cropPreview && cropPreview.startsWith('blob:')) {
          URL.revokeObjectURL(cropPreview);
        }
        setCropPreview(null);
      }, 1500);
      
      setSelectedFile(null);
      // Clean up avatar preview URL
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
      setCropPreview(null);
      setSelectedFile(null);
      setAvatarPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAcademic = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const res = await fetch(`${backendUrl}/api/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(academicData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update profile");
      }

      // Update local state
      if (userData) {
        setUserData({
          ...userData,
          profile: {
            ...userData.profile,
            ...academicData,
          },
        });
      }

      setSuccess("Academic background updated successfully!");
      setEditingAcademic(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInterests = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const res = await fetch(`${backendUrl}/api/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(interestsData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update profile");
      }

      // Update local state
      if (userData) {
        setUserData({
          ...userData,
          profile: {
            ...userData.profile,
            ...interestsData,
          },
        });
      }

      setSuccess("Interests and skills updated successfully!");
      setEditingInterests(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const res = await fetch(`${backendUrl}/api/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preferencesData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update preferences");
      }

      // Update local state
      if (userData) {
        setUserData({
          ...userData,
          preferences: {
            ...userData.preferences,
            ...preferencesData,
          },
        });
      }

      setSuccess("Preferences updated successfully!");
      setEditingPreferences(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout title="Profile & Settings">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            {loading && (
              <div className="mb-4 text-sm text-blue-600">Loading profile...</div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar 
                    className="w-20 h-20 border-4 border-white/50 shadow-lg"
                    key={profile?.avatarUrl || "no-avatar"}
                  >
                    <AvatarImage 
                      src={cropPreview || profile?.avatarUrl || undefined} 
                      alt={user?.fullName || "User"}
                      className="object-cover"
                      onError={(e) => {
                        console.error("Avatar image failed to load:", profile?.avatarUrl);
                        e.currentTarget.style.display = "none";
                      }}
                      onLoad={() => {
                        console.log("Avatar image loaded successfully:", profile?.avatarUrl);
                      }}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-semibold">
                      {user?.fullName
                        ? user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0 bg-blue-600 hover:bg-blue-700 shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    {user?.fullName || "User"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="text-muted-foreground">{user?.email || "No email"}</p>
                  </div>
                  {profile?.phoneNumber && (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {profile.phoneNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {success && (
              <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                {success}
              </div>
            )}

            {/* Profile Completion */}
            <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Profile Completion</span>
                <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Complete your profile to get better program recommendations.
              </p>
            </div>
          </div>
        </Card>

        {/* Tabbed Content */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 backdrop-blur-sm border-b border-gray-200/50 rounded-t-lg p-1 gap-1">
              <TabsTrigger 
                value="profile" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-lg font-medium"
              >
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-lg font-medium"
              >
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="p-6 space-y-8">
              {/* Personal Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Personal information cannot be edited. Contact support if you need to update these details.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Full Name
                    </label>
                    <div className="backdrop-blur-sm bg-gray-100/50 border border-gray-200/50 rounded-lg p-3 min-h-[42px] flex items-center opacity-75">
                      <span className="text-gray-700">
                        {user?.fullName || "Not provided"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address
                    </label>
                    <div className="backdrop-blur-sm bg-gray-100/50 border border-gray-200/50 rounded-lg p-3 min-h-[42px] flex items-center opacity-75">
                      <span className="text-gray-700">{user?.email || "Not provided"}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Phone Number
                    </label>
                    <div className="backdrop-blur-sm bg-gray-100/50 border border-gray-200/50 rounded-lg p-3 min-h-[42px] flex items-center opacity-75">
                      <span className="text-gray-700">
                        {profile?.phoneNumber || "Not provided"}
                      </span>
                    </div>
                  </div>
                  {profile?.countryCode && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Country Code
                      </label>
                      <div className="backdrop-blur-sm bg-gray-100/50 border border-gray-200/50 rounded-lg p-3 min-h-[42px] flex items-center opacity-75">
                        <span className="text-gray-700">{profile.countryCode}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Background */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Academic Background
                  </h3>
                  {!editingAcademic ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingAcademic(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingAcademic(false);
                          // Reset to original values
                          if (profile) {
                            setAcademicData({
                              studyLevel: profile.studyLevel || "",
                              extracurricular: profile.extracurricular ? "yes" : "no",
                              bm: profile.bm || "0",
                              english: profile.english || "0",
                              history: profile.history || "0",
                              mathematics: profile.mathematics || "0",
                              islamicEducationMoralEducation: profile.islamicEducationMoralEducation || "0",
                              physics: profile.physics || "0",
                              chemistry: profile.chemistry || "0",
                              biology: profile.biology || "0",
                              additionalMathematics: profile.additionalMathematics || "0",
                              geography: profile.geography || "0",
                              economics: profile.economics || "0",
                              accounting: profile.accounting || "0",
                              chinese: profile.chinese || "0",
                              tamil: profile.tamil || "0",
                              ict: profile.ict || "0",
                            });
                          }
                        }}
                        disabled={loading}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveAcademic}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Study Level
                    </Label>
                    {editingAcademic ? (
                      <Select
                        value={academicData.studyLevel}
                        onValueChange={(value) =>
                          setAcademicData({ ...academicData, studyLevel: value })
                        }
                      >
                        <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SPM">SPM</SelectItem>
                          <SelectItem value="STPM">STPM</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3 min-h-[42px] flex items-center">
                        <span className="text-gray-900">
                          {profile?.studyLevel || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Extracurricular Activities
                    </Label>
                    {editingAcademic ? (
                      <Select
                        value={academicData.extracurricular || "no"}
                        onValueChange={(value) =>
                          setAcademicData({ ...academicData, extracurricular: value })
                        }
                      >
                        <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3 min-h-[42px] flex items-center">
                        <span className="text-gray-900">
                          {profile?.extracurricular !== undefined
                            ? profile.extracurricular
                              ? "Yes"
                              : "No"
                            : "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subject Grades */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Subject Grades
                  </label>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SUBJECTS.map((subject) => {
                      const grade = editingAcademic
                        ? academicData[subject.key]
                        : (profile?.[subject.key as keyof typeof profile] as string | undefined);
                      return (
                        <div
                          key={subject.key}
                          className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{subject.label}</span>
                            {editingAcademic ? (
                              <Select
                                value={grade || "0"}
                                onValueChange={(value) =>
                                  setAcademicData({ ...academicData, [subject.key]: value })
                                }
                              >
                                <SelectTrigger className="w-20 h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="A">A</SelectItem>
                                  <SelectItem value="B">B</SelectItem>
                                  <SelectItem value="C">C</SelectItem>
                                  <SelectItem value="D">D</SelectItem>
                                  <SelectItem value="E">E</SelectItem>
                                  <SelectItem value="G">G</SelectItem>
                                  <SelectItem value="0">Not Taken</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge
                                variant={grade && grade !== "0" ? "default" : "secondary"}
                                className="ml-2"
                              >
                                {formatGrade(grade)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Interests & Skills */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Interests & Skills
                  </h3>
                  {!editingInterests ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingInterests(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingInterests(false);
                          // Reset to original values
                          if (profile) {
                            setInterestsData({
                              mathsInterest: profile.mathsInterest || 1,
                              scienceInterest: profile.scienceInterest || 1,
                              computerInterest: profile.computerInterest || 1,
                              writingInterest: profile.writingInterest || 1,
                              artInterest: profile.artInterest || 1,
                              businessInterest: profile.businessInterest || 1,
                              socialInterest: profile.socialInterest || 1,
                              logicalThinking: profile.logicalThinking || 1,
                              problemSolving: profile.problemSolving || 1,
                              creativity: profile.creativity || 1,
                              communication: profile.communication || 1,
                              teamwork: profile.teamwork || 1,
                              leadership: profile.leadership || 1,
                              attentionToDetail: profile.attentionToDetail || 1,
                            });
                          }
                        }}
                        disabled={loading}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveInterests}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                {/* Interests */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Interests (1-5 scale)
                  </label>
                  <div className="space-y-3">
                    {INTERESTS.map((interest) => {
                      const value = editingInterests
                        ? interestsData[interest.key]
                        : (profile?.[interest.key as keyof typeof profile] as number | undefined);
                      return (
                        <div key={interest.key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{interest.label}</span>
                            {editingInterests ? (
                              <Select
                                value={String(value || 1)}
                                onValueChange={(val) =>
                                  setInterestsData({ ...interestsData, [interest.key]: Number(val) })
                                }
                              >
                                <SelectTrigger className="w-20 h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((num) => (
                                    <SelectItem key={num} value={String(num)}>
                                      {num}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-sm text-gray-500">{getInterestLevel(typeof value === 'number' ? value : undefined)}</span>
                            )}
                          </div>
                          <Progress
                            value={typeof value === 'number' && value ? (value / 5) * 100 : 0}
                            className="h-2"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Skills (1-5 scale)
                  </label>
                  <div className="space-y-3">
                    {SKILLS.map((skill) => {
                      const value = editingInterests
                        ? interestsData[skill.key]
                        : (profile?.[skill.key as keyof typeof profile] as number | undefined);
                      return (
                        <div key={skill.key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{skill.label}</span>
                            {editingInterests ? (
                              <Select
                                value={String(value || 1)}
                                onValueChange={(val) =>
                                  setInterestsData({ ...interestsData, [skill.key]: Number(val) })
                                }
                              >
                                <SelectTrigger className="w-20 h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((num) => (
                                    <SelectItem key={num} value={String(num)}>
                                      {num}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-sm text-gray-500">{getSkillLevel(typeof value === 'number' ? value : undefined)}</span>
                            )}
                          </div>
                          <Progress
                            value={typeof value === 'number' && value ? (value / 5) * 100 : 0}
                            className="h-2"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Preferences
                  </h3>
                  {!editingPreferences ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPreferences(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPreferences(false);
                          // Reset to original values
                          if (preferences) {
                            setPreferencesData({
                              budgetRange: preferences.budgetRange || "",
                              preferredLocation: preferences.preferredLocation || "",
                              preferredCountry: preferences.preferredCountry || "",
                              studyMode: preferences.studyMode || "",
                            });
                          }
                        }}
                        disabled={loading}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSavePreferences}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Budget Range
                    </Label>
                    {editingPreferences ? (
                      <Input
                        value={preferencesData.budgetRange || ""}
                        onChange={(e) =>
                          setPreferencesData({ ...preferencesData, budgetRange: e.target.value })
                        }
                        placeholder="e.g., RM 50,000 - RM 100,000"
                        className="backdrop-blur-sm bg-white/50 border-white/30"
                      />
                    ) : (
                      <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3 min-h-[42px] flex items-center">
                        <span className="text-gray-900">
                          {preferences?.budgetRange || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Preferred Location
                    </Label>
                    {editingPreferences ? (
                      <Input
                        value={preferencesData.preferredLocation || ""}
                        onChange={(e) =>
                          setPreferencesData({
                            ...preferencesData,
                            preferredLocation: e.target.value,
                          })
                        }
                        placeholder="e.g., Kuala Lumpur"
                        className="backdrop-blur-sm bg-white/50 border-white/30"
                      />
                    ) : (
                      <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3 min-h-[42px] flex items-center">
                        <span className="text-gray-900">
                          {preferences?.preferredLocation || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Preferred Country
                    </Label>
                    {editingPreferences ? (
                      <Input
                        value={preferencesData.preferredCountry || ""}
                        onChange={(e) =>
                          setPreferencesData({
                            ...preferencesData,
                            preferredCountry: e.target.value,
                          })
                        }
                        placeholder="e.g., Malaysia"
                        className="backdrop-blur-sm bg-white/50 border-white/30"
                      />
                    ) : (
                      <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3 min-h-[42px] flex items-center">
                        <span className="text-gray-900">
                          {preferences?.preferredCountry || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Study Mode
                    </Label>
                    {editingPreferences ? (
                      <Input
                        value={preferencesData.studyMode || ""}
                        onChange={(e) =>
                          setPreferencesData({ ...preferencesData, studyMode: e.target.value })
                        }
                        placeholder="e.g., Full-time"
                        className="backdrop-blur-sm bg-white/50 border-white/30"
                      />
                    ) : (
                      <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-3 min-h-[42px] flex items-center">
                        <span className="text-gray-900">
                          {preferences?.studyMode || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="p-6 space-y-6">
              <div className="backdrop-blur-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <History className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Recommendation History
                    </h3>
                    <p className="text-muted-foreground">
                      Track your AI recommendations over time
                    </p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">No recommendation history available yet.</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Avatar Crop Modal */}
        {avatarPreview && (
          <AvatarCropModal
            open={showCropModal}
            onClose={() => {
              setShowCropModal(false);
              // Clean up preview URL
              if (avatarPreview && avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
              }
              setAvatarPreview(null);
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            imageSrc={avatarPreview}
            onCropComplete={handleCropComplete}
          />
        )}
      </div>
    </StudentLayout>
  );
}
