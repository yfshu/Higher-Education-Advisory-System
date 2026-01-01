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
  const [imageUrlInput, setImageUrlInput] = useState("");

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
      }
    }
  }, [university, open, reset]);

  const addImageUrl = () => {
    if (imageUrlInput.trim() && !watch("image_urls")?.includes(imageUrlInput.trim())) {
      setValue("image_urls", [...(watch("image_urls") || []), imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  const removeImageUrl = (urlToRemove: string) => {
    setValue("image_urls", watch("image_urls")?.filter((url) => url !== urlToRemove) || []);
  };

  const onSubmit = async (data: UniversityFormData) => {
    if (!userData?.accessToken) {
      alert("Please log in to perform this action.");
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

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving university:", error);
      alert(error instanceof Error ? error.message : "Failed to save university");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {university ? "Edit University" : "Add New University"}
          </DialogTitle>
          <DialogDescription>
            {university
              ? "Update the university information below."
              : "Fill in the details to create a new university."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                University Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name", { required: "University name is required" })}
                placeholder="e.g., University of Malaya"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="university_type">University Type</Label>
              <Select
                value={watch("university_type") || "public"}
                onValueChange={(value) =>
                  setValue("university_type", value as "public" | "private")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="based_in">Based In (Country/Region)</Label>
              <Input
                id="based_in"
                {...register("based_in")}
                placeholder="e.g., Malaysia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                {...register("state")}
                placeholder="e.g., Selangor"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="e.g., Kuala Lumpur"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Complete address"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="University description..."
              rows={4}
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                {...register("website_url")}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="contact@university.edu.my"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                {...register("phone_number")}
                placeholder="+60 3-1234 5678"
              />
            </div>
          </div>

          {/* Fees & Media */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="average_fee">Average Fee (RM)</Label>
              <Input
                id="average_fee"
                type="number"
                step="0.01"
                {...register("average_fee", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Must be 0 or greater" },
                })}
                placeholder="e.g., 50000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                {...register("logo_url")}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Image URLs */}
          <div className="space-y-2">
            <Label htmlFor="image_urls">Image URLs</Label>
            <div className="flex gap-2">
              <Input
                id="image_urls"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
                placeholder="Enter image URL and press Enter"
              />
              <Button type="button" onClick={addImageUrl} variant="outline">
                Add
              </Button>
            </div>
            {watch("image_urls") && watch("image_urls")!.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {watch("image_urls")!.map((url, idx) => (
                  <div
                    key={idx}
                    className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex items-center gap-1"
                  >
                    <span className="truncate max-w-[200px]">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeImageUrl(url)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              ) : university ? (
                "Update University"
              ) : (
                "Create University"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

