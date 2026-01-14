"use client";

import { useState, useEffect, useRef } from "react";
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
import { Loader2, Building2, MapPin, FileText, Globe, Mail, Phone, DollarSign, Image as ImageIcon, X, Upload } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface UniversityFormData {
  name: string;
  university_type: "public" | "private";
  based_in: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  description: string | null;
  website_url: string | null;
  email: string | null;
  phone_number: string | null;
  average_fee: number | null;
  logo_url: string | null;
  image_urls: string[];
}

interface UniversityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  university?: any | null;
  onSuccess: () => void;
}

export function UniversityFormModal({
  open,
  onOpenChange,
  university,
  onSuccess,
}: UniversityFormModalProps) {
  const { userData } = useUser();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UniversityFormData>({
    defaultValues: {
      name: "",
      university_type: "public",
      based_in: null,
      state: null,
      city: null,
      address: null,
      description: null,
      website_url: null,
      email: null,
      phone_number: null,
      average_fee: null,
      logo_url: null,
      image_urls: [],
    },
  });

  // Reset form when university changes
  useEffect(() => {
    if (open) {
      if (university) {
        // Edit mode
        const imageUrls = Array.isArray(university.image_urls)
          ? university.image_urls
          : typeof university.image_urls === 'string'
          ? JSON.parse(university.image_urls || '[]')
          : [];

        reset({
          name: university.name || "",
          university_type: university.university_type || "public",
          based_in: university.based_in || null,
          state: university.state || null,
          city: university.city || null,
          address: university.address || null,
          description: university.description || null,
          website_url: university.website_url || null,
          email: university.email || null,
          phone_number: university.phone_number || null,
          average_fee: university.average_fee || null,
          logo_url: university.logo_url || null,
          image_urls: imageUrls,
        });
        setLogoPreview(university.logo_url || null);
      } else {
        // Add mode
        reset({
          name: "",
          university_type: "public",
          based_in: null,
          state: null,
          city: null,
          address: null,
          description: null,
          website_url: null,
          email: null,
          phone_number: null,
          average_fee: null,
          logo_url: null,
          image_urls: [],
        });
        setLogoPreview(null);
      }
    }
  }, [university, open, reset]);

  const removeImageUrl = (urlToRemove: string) => {
    setValue("image_urls", watch("image_urls")?.filter((url) => url !== urlToRemove) || []);
  };

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error("Only JPG and PNG images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    setUploadingLogo(true);
    try {
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const formData = new FormData();
      formData.append("file", file);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const res = await fetch(`${backendUrl}/api/universities/upload-logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload logo");
      }

      const data = await res.json();
      if (data.logoUrl) {
        setValue("logo_url", data.logoUrl);
        setLogoPreview(data.logoUrl);
        toast.success("Logo uploaded successfully!");
      }
    } catch (err) {
      console.error("Error uploading logo:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = "";
      }
    }
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error("Only JPG and PNG images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const formData = new FormData();
      formData.append("file", file);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
      const res = await fetch(`${backendUrl}/api/universities/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload image");
      }

      const data = await res.json();
      if (data.imageUrl) {
        const currentUrls = watch("image_urls") || [];
        if (!currentUrls.includes(data.imageUrl)) {
          setValue("image_urls", [...currentUrls, data.imageUrl]);
          toast.success("Image uploaded successfully!");
        }
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = "";
      }
    }
  };

  const onSubmit = async (data: UniversityFormData) => {
    if (!userData?.accessToken) {
      toast.error("Please log in to perform this action.");
      return;
    }

    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";

      const payload: any = {
        name: data.name,
        university_type: data.university_type,
        based_in: data.based_in || null,
        state: data.state || null,
        city: data.city || null,
        address: data.address || null,
        description: data.description || null,
        website_url: data.website_url || null,
        email: data.email || null,
        phone_number: data.phone_number || null,
        average_fee: data.average_fee ? Number(data.average_fee) : null,
        logo_url: data.logo_url || null,
        image_urls: data.image_urls && data.image_urls.length > 0 ? data.image_urls : null,
      };

      let response;
      if (university) {
        response = await fetch(`${backendUrl}/api/universities/${university.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${backendUrl}/api/universities`, {
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
        throw new Error(errorData.message || "Failed to save university");
      }

      toast.success(
        university 
          ? "University updated successfully!" 
          : "University created successfully!"
      );
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving university:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save university");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1400px] w-[95vw] sm:!max-w-[1400px] sm:w-[90vw] md:!max-w-[1400px] lg:!max-w-[1400px] lg:w-[1400px] max-h-[95vh] flex flex-col overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {university ? "Edit University" : "Add New University"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                {university
                  ? "Update the university information below."
                  : "Fill in the details to create a new university."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto py-4 px-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Basic Information & Location */}
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 mb-3 pb-2 border-b-2 border-blue-200 dark:border-blue-800">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      University Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register("name", { required: "University name is required" })}
                      placeholder="e.g., University of Malaya"
                      className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span>⚠</span> {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      University Type
                    </Label>
                    <Select
                      value={watch("university_type") || "public"}
                      onValueChange={(value) =>
                        setValue("university_type", value as "public" | "private")
                      }
                    >
                      <SelectTrigger className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5 mb-3 pb-2 border-b-2 border-green-200 dark:border-green-800">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Location</h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="based_in" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Country/Region
                    </Label>
                    <Input
                      id="based_in"
                      {...register("based_in")}
                      placeholder="e.g., Malaysia"
                      className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-200 rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      State
                    </Label>
                    <Input
                      id="state"
                      {...register("state")}
                      placeholder="e.g., Selangor"
                      className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-200 rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      City
                    </Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="e.g., Kuala Lumpur"
                      className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-200 rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Address
                    </Label>
                    <Input
                      id="address"
                      {...register("address")}
                      placeholder="Complete address"
                      className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-200 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Contact & Fees */}
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 mb-3 pb-2 border-b-2 border-amber-200 dark:border-amber-800">
                  <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Contact Information</h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="website_url" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Globe className="w-4 h-4" />
                      Website URL
                    </Label>
                    <Input
                      id="website_url"
                      type="url"
                      {...register("website_url")}
                      placeholder="https://www.university.edu.my"
                      className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200 rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="contact@university.edu.my"
                      className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200 rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone_number"
                      {...register("phone_number")}
                      placeholder="+60 3-1234 5678"
                      className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5 mb-3 pb-2 border-b-2 border-orange-200 dark:border-orange-800">
                  <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Fees & Media</h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="average_fee" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      Average Fee (RM)
                    </Label>
                    <Input
                      id="average_fee"
                      type="number"
                      step="0.01"
                      {...register("average_fee", {
                        valueAsNumber: true,
                        min: { value: 0, message: "Must be 0 or greater" },
                      })}
                      placeholder="e.g., 50000"
                      className="h-10 text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-200 rounded-md"
                    />
                    {errors.average_fee && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span>⚠</span> {errors.average_fee.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo_url" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      Logo URL
                    </Label>
                    <div className="flex gap-2">
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleLogoFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        disabled={uploadingLogo}
                        variant="outline"
                        className="h-10 border-2 border-orange-300 dark:border-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-200 rounded-md whitespace-nowrap"
                      >
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-1.5" />
                            Add Picture
                          </>
                        )}
                      </Button>
                    </div>
                    {logoPreview && (
                      <div className="mt-2 relative inline-block">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-20 w-20 object-cover rounded-md border-2 border-orange-200 dark:border-orange-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setValue("logo_url", null);
                            setLogoPreview(null);
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Description & Images */}
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 mb-3 pb-2 border-b-2 border-purple-200 dark:border-purple-800">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Description</h3>
                </div>
                <div className="space-y-2">
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Provide a detailed description of the university, including its history, mission, and notable features..."
                    rows={10}
                    className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200 resize-none rounded-md"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5 mb-3 pb-2 border-b-2 border-indigo-200 dark:border-indigo-800">
                  <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Image URLs</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      ref={imageFileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => imageFileInputRef.current?.click()}
                      disabled={uploadingImage}
                      variant="outline"
                      className="h-10 border-2 border-indigo-300 dark:border-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 rounded-md whitespace-nowrap"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-1.5" />
                          Add Picture
                        </>
                      )}
                    </Button>
                  </div>
                  {watch("image_urls") && watch("image_urls")!.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {watch("image_urls")!.length} image{watch("image_urls")!.length !== 1 ? 's' : ''} added
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {watch("image_urls")!.map((url, idx) => (
                          <div
                            key={idx}
                            className="group relative bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all"
                          >
                            <img
                              src={url}
                              alt={`University image ${idx + 1}`}
                              className="w-full h-20 object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                      <ImageIcon class="w-6 h-6 text-gray-400" />
                                    </div>
                                  `;
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImageUrl(url)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-10 px-6 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 rounded-md"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {university ? "Updating..." : "Creating..."}
                </>
              ) : university ? (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Update University
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Create University
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

