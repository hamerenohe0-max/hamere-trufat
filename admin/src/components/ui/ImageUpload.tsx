"use client";

import { useState, useRef } from "react";
import { Button } from "./button";
import { X, Upload, Loader2 } from "lucide-react";
import { uploadImageToCloudinary } from "@/services/cloudinary";
import { toast } from "sonner";
import { ImageCropper } from "./ImageCropper";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  maxSizeMB?: number;
  folder?: string;
  disabled?: boolean;
  aspectRatio?: number;
  enableCrop?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  maxSizeMB = 10,
  folder = "hamere-trufat",
  disabled = false,
  aspectRatio = 1,
  enableCrop = true,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // If cropping is enabled, show cropper first
    if (enableCrop) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImageToCrop(imageUrl);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // If cropping is disabled, upload directly
    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadImageToCloudinary({
        file,
        folder,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      onChange(result.secure_url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    setShowCropper(false);
    setImageToCrop(null);

    // Convert data URL to blob
    const response = await fetch(croppedImageUrl);
    const blob = await response.blob();
    const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });

    // Upload the cropped image
    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadImageToCloudinary({
        file,
        folder,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      onChange(result.secure_url);
      toast.success("Image cropped and uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <>
      {showCropper && imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setImageToCrop(null);
          }}
          aspectRatio={aspectRatio}
        />
      )}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
          id={`image-upload-${Math.random().toString(36).substr(2, 9)}`}
        />
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Upload preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Upload className="h-4 w-4 mr-2" />
              Change Image
            </Button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || uploading}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white rounded-full p-1.5 shadow-lg disabled:opacity-50"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-gray-600">Uploading... {Math.round(uploadProgress)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to {maxSizeMB}MB</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
              >
                Select Image
              </Button>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
}

