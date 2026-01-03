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
  Calendar,
  TrendingUp,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { AvatarCropModal } from "@/components/ui/avatar-crop-modal";
import { getRecommendationHistory, type RecommendationHistoryItem } from "@/lib/api/recommendations";

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
  
  // Unified edit state for all sections
  const [isEditing, setIsEditing] = useState(false);
  
  // Form data states
  const [academicData, setAcademicData] = useState<Record<string, string | undefined>>({});
  const [interestsData, setInterestsData] = useState<Record<string, string | number | string[] | undefined>>({});
  const [preferencesData, setPreferencesData] = useState<Record<string, string | number | undefined>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropPreview, setCropPreview] = useState<string | null>(null);

  // Recommendation history state
  const [recommendationHistory, setRecommendationHistory] = useState<RecommendationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'field' | 'program'>('all');

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
  
  // Fetch recommendation history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      
      setHistoryLoading(true);
      setHistoryError(null);
      
      try {
        const type = historyFilter === 'all' ? undefined : historyFilter;
        const { data, error } = await getRecommendationHistory(type, 100);
        
        if (error) {
          setHistoryError(error);
          setRecommendationHistory([]);
        } else if (data) {
          setRecommendationHistory(data.data || []);
        }
      } catch (err: any) {
        setHistoryError(err.message || 'Failed to fetch recommendation history');
        setRecommendationHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id, historyFilter]);
  
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

  const handleSaveAll = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      // Convert extracurricular from "yes"/"no" string to boolean
      const academicPayload = {
        ...academicData,
        extracurricular: academicData.extracurricular === "yes" ? true : academicData.extracurricular === "no" ? false : undefined,
      };

      // Combine all data into one payload
      const payload = {
        ...academicPayload,
        ...interestsData,
        ...preferencesData,
      };

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      
      // Save academic and interests (profile update)
      const profileRes = await fetch(`${backendUrl}/api/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...academicPayload,
          ...interestsData,
        }),
      });

      if (!profileRes.ok) {
        const errorData = await profileRes.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update profile");
      }

      // Save preferences separately
      if (Object.keys(preferencesData).length > 0) {
        const preferencesRes = await fetch(`${backendUrl}/api/profile/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(preferencesData),
        });

        if (!preferencesRes.ok) {
          const errorData = await preferencesRes.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to update preferences");
        }
      }

      // Update local state
      if (userData) {
        setUserData({
          ...userData,
          profile: {
            ...userData.profile,
            ...academicPayload,
            ...interestsData,
          },
          preferences: {
            ...userData.preferences,
            ...preferencesData,
          },
        });
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      // Dispatch event to clear recommendations cache
      window.dispatchEvent(new CustomEvent("profileUpdated"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
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
  };

  return (
    <StudentLayout title="Profile & Settings">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="backdrop-blur-xl bg-white/40 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50 shadow-lg">
          <div className="p-6">
            {error && (
              <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3">
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
              <div className="mb-4 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-3">
                {success}
              </div>
            )}

          </div>
        </Card>

        {/* Tabbed Content */}
        <Card className="backdrop-blur-xl bg-white/40 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50 shadow-lg">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 dark:bg-slate-700/50 backdrop-blur-sm border-b border-gray-200/50 dark:border-slate-700/50 rounded-t-lg p-1 gap-1">
              <TabsTrigger 
                value="profile" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 rounded-lg font-medium"
              >
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 rounded-lg font-medium"
              >
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="p-6 space-y-8">
              {/* Edit Button */}
              <div className="flex justify-end mb-4">
                {!isEditing ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveAll}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save All
                    </Button>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Personal information cannot be edited. Contact support if you need to update these details.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Full Name
                    </label>
                    <div className="backdrop-blur-sm bg-gray-100/50 dark:bg-slate-700/50 border border-gray-200/50 dark:border-slate-600/50 rounded-lg p-3 min-h-[42px] flex items-center opacity-75">
                      <span className="text-gray-700 dark:text-gray-300">
                        {user?.fullName || "Not provided"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Email Address
                    </label>
                    <div className="backdrop-blur-sm bg-gray-100/50 dark:bg-slate-700/50 border border-gray-200/50 dark:border-slate-600/50 rounded-lg p-3 min-h-[42px] flex items-center opacity-75">
                      <span className="text-gray-700 dark:text-gray-300">{user?.email || "Not provided"}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Phone Number
                    </label>
                    <div className="backdrop-blur-sm bg-gray-100/50 dark:bg-slate-700/50 border border-gray-200/50 dark:border-slate-600/50 rounded-lg p-3 min-h-[42px] flex items-center opacity-75">
                      <span className="text-gray-700 dark:text-gray-300">
                        {profile?.phoneNumber || "Not provided"}
                      </span>
                    </div>
                  </div>
                  {profile?.countryCode && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Country Code
                      </label>
                      <div className="backdrop-blur-sm bg-gray-100/50 dark:bg-slate-700/50 border border-gray-200/50 dark:border-slate-600/50 rounded-lg p-3 min-h-[42px] flex items-center opacity-75">
                        <span className="text-gray-700 dark:text-gray-300">{profile.countryCode}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Background */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Academic Background
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Study Level
                    </Label>
                    {isEditing ? (
                      <Select
                        value={academicData.studyLevel}
                        onValueChange={(value) =>
                          setAcademicData({ ...academicData, studyLevel: value })
                        }
                      >
                        <SelectTrigger className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/70 border-white/30 dark:border-slate-700/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SPM">SPM</SelectItem>
                          <SelectItem value="STPM">STPM</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-lg p-3 min-h-[42px] flex items-center">
                        <span className="text-gray-900 dark:text-foreground">
                          {profile?.studyLevel || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Extracurricular Activities
                    </Label>
                    {isEditing ? (
                      <Select
                        value={academicData.extracurricular || "no"}
                        onValueChange={(value) =>
                          setAcademicData({ ...academicData, extracurricular: value })
                        }
                      >
                        <SelectTrigger className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/70 border-white/30 dark:border-slate-700/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-lg p-3 min-h-[42px] flex items-center">
                        <span className="text-gray-900 dark:text-foreground">
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
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    Subject Grades
                  </label>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SUBJECTS.map((subject) => {
                      const grade = isEditing
                        ? academicData[subject.key]
                        : (profile?.[subject.key as keyof typeof profile] as string | undefined);
                      return (
                        <div
                          key={subject.key}
                          className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{subject.label}</span>
                            {isEditing ? (
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Interests & Skills
                  </h3>
                </div>

                {/* Interests */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    Interests (1-5 scale)
                  </label>
                  <div className="space-y-3">
                    {INTERESTS.map((interest) => {
                      const value = isEditing
                        ? interestsData[interest.key]
                        : (profile?.[interest.key as keyof typeof profile] as number | undefined);
                      return (
                        <div key={interest.key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{interest.label}</span>
                            {isEditing ? (
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
                              <span className="text-sm text-gray-500 dark:text-gray-400">{getInterestLevel(typeof value === 'number' ? value : undefined)}</span>
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
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    Skills (1-5 scale)
                  </label>
                  <div className="space-y-3">
                    {SKILLS.map((skill) => {
                      const value = isEditing
                        ? interestsData[skill.key]
                        : (profile?.[skill.key as keyof typeof profile] as number | undefined);
                      return (
                        <div key={skill.key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{skill.label}</span>
                            {isEditing ? (
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
                              <span className="text-sm text-gray-500 dark:text-gray-400">{getSkillLevel(typeof value === 'number' ? value : undefined)}</span>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Preferences
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Budget Range
                    </Label>
                    {isEditing ? (
                      <Input
                        value={preferencesData.budgetRange || ""}
                        onChange={(e) =>
                          setPreferencesData({ ...preferencesData, budgetRange: e.target.value })
                        }
                        placeholder="e.g., RM 50,000 - RM 100,000"
                        className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/70 border-white/30 dark:border-slate-700/50"
                      />
                    ) : (
                      <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-lg p-3 min-h-[42px] flex items-center">
                        <span className="text-gray-900 dark:text-foreground">
                          {preferences?.budgetRange || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Preferred Location
                    </Label>
                    {isEditing ? (
                      <Input
                        value={preferencesData.preferredLocation || ""}
                        onChange={(e) =>
                          setPreferencesData({
                            ...preferencesData,
                            preferredLocation: e.target.value,
                          })
                        }
                        placeholder="e.g., Kuala Lumpur"
                        className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/70 border-white/30 dark:border-slate-700/50"
                      />
                    ) : (
                      <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-lg p-3 min-h-[42px] flex items-center">
                        <span className="text-gray-900 dark:text-foreground">
                          {preferences?.preferredLocation || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Preferred Country
                    </Label>
                    {isEditing ? (
                      <Input
                        value={preferencesData.preferredCountry || ""}
                        onChange={(e) =>
                          setPreferencesData({
                            ...preferencesData,
                            preferredCountry: e.target.value,
                          })
                        }
                        placeholder="e.g., Malaysia"
                        className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/70 border-white/30 dark:border-slate-700/50"
                      />
                    ) : (
                      <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-lg p-3 min-h-[42px] flex items-center">
                        <span className="text-gray-900 dark:text-foreground">
                          {preferences?.preferredCountry || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Study Mode
                    </Label>
                    {isEditing ? (
                      <Input
                        value={preferencesData.studyMode || ""}
                        onChange={(e) =>
                          setPreferencesData({ ...preferencesData, studyMode: e.target.value })
                        }
                        placeholder="e.g., Full-time"
                        className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/70 border-white/30 dark:border-slate-700/50"
                      />
                    ) : (
                      <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-lg p-3 min-h-[42px] flex items-center">
                        <span className="text-gray-900 dark:text-foreground">
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
              <div className="backdrop-blur-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 dark:from-purple-500/30 dark:to-blue-500/30 border border-white/20 dark:border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        Recommendation History
                      </h3>
                      <p className="text-muted-foreground">
                        Track your AI recommendations over time
                      </p>
                    </div>
                  </div>
                  
                  {/* Filter Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant={historyFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={historyFilter === 'field' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('field')}
                    >
                      Fields
                    </Button>
                    <Button
                      variant={historyFilter === 'program' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('program')}
                    >
                      Programs
                    </Button>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {historyLoading && (
                <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">Loading recommendation history...</p>
                </div>
              )}

              {/* Error State */}
              {!historyLoading && historyError && (
                <div className="backdrop-blur-sm bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <p className="text-red-600">Error: {historyError}</p>
                </div>
              )}

              {/* Empty State */}
              {!historyLoading && !historyError && recommendationHistory.length === 0 && (
                <div className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">No recommendation history available yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start getting recommendations to see your history here.
                  </p>
                </div>
              )}

              {/* Recommendation History List */}
              {!historyLoading && !historyError && recommendationHistory.length > 0 && (
                <div className="space-y-4">
                  {(() => {
                    // Group recommendations by session
                    const groupedBySession = recommendationHistory.reduce((acc, rec) => {
                      const sessionId = rec.recommendation_session_id || 'no-session';
                      if (!acc[sessionId]) {
                        acc[sessionId] = [];
                      }
                      acc[sessionId].push(rec);
                      return acc;
                    }, {} as Record<string, RecommendationHistoryItem[]>);

                    return Object.entries(groupedBySession).map(([sessionId, recs]) => {
                      // Get the date from the first recommendation in the session
                      const sessionDate = recs[0]?.created_at 
                        ? new Date(recs[0].created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Unknown date';

                      // Separate field and program recommendations
                      const fieldRecs = recs.filter(r => r.recommendation_type === 'field');
                      const programRecs = recs.filter(r => r.recommendation_type === 'program');
                      
                      // Calculate counts
                      const fieldCount = fieldRecs.length;
                      const programCount = programRecs.length;
                      const totalCount = recs.length;

                      return (
                        <div
                          key={sessionId}
                          className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-lg p-6 space-y-4"
                        >
                          {/* Session Header */}
                          <div className="flex items-center justify-between border-b border-white/20 pb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-foreground">
                                {sessionDate}
                              </span>
                            </div>
                          </div>

                          {/* Field Recommendations */}
                          {fieldRecs.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <TrendingUp className="w-4 h-4 text-purple-600" />
                                Field Recommendations
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {fieldRecs
                                  .sort((a, b) => (a.final_rank || 0) - (b.final_rank || 0))
                                  .map((rec) => (
                                    <div
                                      key={rec.recommendation_id}
                                      className="backdrop-blur-sm bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200/50 dark:border-purple-800/50 rounded-lg p-4"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <GraduationCap className="w-4 h-4 text-purple-600" />
                                          <span className="font-medium text-sm text-foreground">
                                            {rec.field_name || 'Unknown Field'}
                                          </span>
                                        </div>
                                        <Badge
                                          variant="secondary"
                                          className="text-xs bg-purple-100 text-purple-700"
                                        >
                                          #{rec.final_rank || 'N/A'}
                                        </Badge>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-muted-foreground">Match Score:</span>
                                          <span className="font-semibold text-purple-600">
                                            {((rec.final_score || rec.ml_confidence_score) * 100).toFixed(1)}%
                                          </span>
                                        </div>
                                        {rec.openai_validated && (
                                          <div className="flex items-center gap-1 text-xs">
                                            <Sparkles className="w-3 h-3 text-blue-500" />
                                            <span className="text-muted-foreground">
                                              OpenAI Validated
                                            </span>
                                          </div>
                                        )}
                                        {rec.powered_by && rec.powered_by.length > 0 && (
                                          <div className="text-xs text-muted-foreground">
                                            Powered by: {rec.powered_by.join(', ')}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Program Recommendations */}
                          {programRecs.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                Program Recommendations
                              </div>
                              <div className="space-y-3">
                                {programRecs
                                  .sort((a, b) => (a.final_rank || 0) - (b.final_rank || 0))
                                  .map((rec) => (
                                    <div
                                      key={rec.recommendation_id}
                                      className="backdrop-blur-sm bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <GraduationCap className="w-4 h-4 text-blue-600" />
                                            <span className="font-medium text-foreground">
                                              {rec.program_name || `Program #${rec.program_id}`}
                                            </span>
                                          </div>
                                          {rec.field_name && (
                                            <Badge variant="outline" className="text-xs">
                                              {rec.field_name}
                                            </Badge>
                                          )}
                                        </div>
                                        <Badge
                                          variant="secondary"
                                          className="text-xs bg-blue-100 text-blue-700 ml-2"
                                        >
                                          #{rec.final_rank || 'N/A'}
                                        </Badge>
                                      </div>
                                      <div className="space-y-2 mt-3">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-muted-foreground">Match Score:</span>
                                          <span className="font-semibold text-blue-600">
                                            {((rec.final_score || rec.ml_confidence_score) * 100).toFixed(1)}%
                                          </span>
                                        </div>
                                        {rec.openai_explanation && (
                                          <p className="text-xs text-muted-foreground line-clamp-2">
                                            {rec.openai_explanation}
                                          </p>
                                        )}
                                        {rec.openai_validated && (
                                          <div className="flex items-center gap-1 text-xs">
                                            <Sparkles className="w-3 h-3 text-blue-500" />
                                            <span className="text-muted-foreground">
                                              OpenAI Validated
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
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
