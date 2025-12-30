"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, Check } from "lucide-react";
import type { Area, Point } from "react-easy-crop";

// Dynamically import Cropper to avoid SSR issues
const Cropper = dynamic(
  () => import("react-easy-crop"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
) as React.ComponentType<{
  image: string;
  crop: Point;
  zoom: number;
  aspect: number;
  onCropChange: (crop: Point) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  cropShape?: "round" | "rect";
  showGrid?: boolean;
  style?: {
    containerStyle?: React.CSSProperties;
  };
}>;

interface AvatarCropModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedPreview: string, croppedFile: File) => void;
}

export function AvatarCropModal({
  open,
  onClose,
  imageSrc,
  onCropComplete,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [open]);

  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    targetSize: number = 512
  ): Promise<{ previewUrl: string; file: File }> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    // Calculate scale to resize to target size while maintaining aspect ratio
    const scale = targetSize / Math.max(pixelCrop.width, pixelCrop.height);
    const outputWidth = Math.round(pixelCrop.width * scale);
    const outputHeight = Math.round(pixelCrop.height * scale);

    // Set canvas size to target size (square for avatar)
    canvas.width = targetSize;
    canvas.height = targetSize;

    // Fill with white background (for transparency handling)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, targetSize, targetSize);

    // Draw the cropped and resized image centered
    const offsetX = (targetSize - outputWidth) / 2;
    const offsetY = (targetSize - outputHeight) / 2;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      offsetX,
      offsetY,
      outputWidth,
      outputHeight
    );

    // Create preview URL and File from the same canvas
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob from canvas"));
            return;
          }

          // Create preview URL
          const previewUrl = URL.createObjectURL(blob);

          // Create File object with proper name and type
          const file = new File(
            [blob],
            `avatar-${Date.now()}.jpg`,
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            }
          );

          resolve({ previewUrl, file });
        },
        "image/jpeg",
        0.92 // 92% quality for good balance between size and quality
      );
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (croppedAreaPixels) {
        // Generate cropped image (both preview and file)
        const { previewUrl, file } = await getCroppedImg(imageSrc, croppedAreaPixels);
        console.log("✅ Cropped image created:", {
          previewUrl,
          fileSize: file.size,
          fileType: file.type,
        });
        onCropComplete(previewUrl, file);
      } else {
        // No crop area - this shouldn't happen, but handle gracefully
        // Convert original image to File for consistency
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const file = new File([blob], `avatar-${Date.now()}.jpg`, {
          type: blob.type || "image/jpeg",
        });
        onCropComplete(imageSrc, file);
      }
    } catch (error) {
      console.error("❌ Error cropping image:", error);
      // Fallback: try to convert original to File
      try {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const file = new File([blob], `avatar-${Date.now()}.jpg`, {
          type: blob.type || "image/jpeg",
        });
        onCropComplete(imageSrc, file);
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
        // Last resort: create empty file (will fail upload but won't crash)
        const emptyFile = new File([], "avatar.jpg", { type: "image/jpeg" });
        onCropComplete(imageSrc, emptyFile);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-none shadow-2xl">
        <DialogTitle className="text-2xl font-bold text-white mb-2">
          Crop Your Profile Picture
        </DialogTitle>
        <DialogDescription className="text-gray-300 mb-4">
          Adjust the image to fit the circular frame. The cropped image will be uploaded.
        </DialogDescription>

        <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden">
          {open && imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteCallback}
              cropShape="round"
              showGrid={false}
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  position: "relative",
                },
              }}
            />
          )}
        </div>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Use This Picture
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

