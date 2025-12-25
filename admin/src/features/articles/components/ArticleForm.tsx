"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateArticle, useUpdateArticle, useArticle } from "../hooks/useArticles";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  images: z.array(z.string()).max(4, "Maximum 4 images allowed").optional(),
  tags: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  articleId?: string;
  onSuccess?: () => void;
}

export function ArticleForm({ articleId, onSuccess }: ArticleFormProps) {
  const { data: existingArticle } = useArticle(articleId || "");
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      images: [],
    },
  });

  useEffect(() => {
    if (existingArticle) {
      setValue("title", existingArticle.title);
      setValue("excerpt", existingArticle.excerpt);
      setValue("content", existingArticle.content);
      const articleImages = existingArticle.images || (existingArticle.cover_image ? [existingArticle.cover_image] : []);
      setImages(articleImages);
      setValue("images", articleImages);
      setImageFiles([]);
    }
  }, [existingArticle, setValue]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const remainingSlots = 4 - imageFiles.length;

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }
      newFiles.push(file);
    }

    if (newFiles.length === 0) return;

    const updatedFiles = [...imageFiles, ...newFiles].slice(0, 4);
    setImageFiles(updatedFiles);

    // Create preview URLs
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    const updatedPreviews = [...images, ...newPreviews].slice(0, 4);
    setImages(updatedPreviews);

    if (updatedFiles.length >= 4) {
      toast.info("Maximum 4 images reached");
    } else {
      toast.success(`${newFiles.length} image(s) added`);
    }
  };

  const removeImage = (index: number) => {
    const isBlobUrl = images[index]?.startsWith("blob:");
    
    if (isBlobUrl) {
      const newFiles = imageFiles.filter((_, i) => i !== index);
      const newPreviews = images.filter((_, i) => i !== index);
      URL.revokeObjectURL(images[index]);
      setImageFiles(newFiles);
      setImages(newPreviews);
    } else {
      const newPreviews = images.filter((_, i) => i !== index);
      setImages(newPreviews);
    }
  };

  const onSubmit = async (data: ArticleFormData) => {
    try {
      setUploading(true);
      const keywords = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

      const tokens = useAuthStore.getState().tokens;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      if (articleId) {
        // Update article
        if (imageFiles.length > 0) {
          // Has new files to upload
          const formData = new FormData();
          formData.append("title", data.title);
          formData.append("excerpt", data.excerpt);
          formData.append("content", data.content);
          formData.append("keywords", JSON.stringify(keywords));
          
          // Get existing image URLs (not blob URLs)
          const existingImageUrls = images.filter((img) => !img.startsWith("blob:"));
          if (existingImageUrls.length > 0) {
            formData.append("existingImages", JSON.stringify(existingImageUrls));
          }
          
          // Append new image files
          imageFiles.forEach((file) => {
            formData.append("images", file);
          });

          const response = await fetch(`${API_URL}/admin/articles/${articleId}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${tokens?.accessToken}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to update article");
          }

          toast.success("Article updated successfully");
        } else {
          // No new files, update with existing image URLs only
          const existingImageUrls = images.filter((img) => !img.startsWith("blob:"));
          await updateMutation.mutateAsync({
            id: articleId,
            data: {
              title: data.title,
              excerpt: data.excerpt,
              content: data.content,
              images: existingImageUrls,
              keywords,
            },
          });
          toast.success("Article updated successfully");
        }
      } else {
        // Create article
        if (imageFiles.length > 0) {
          // Has files to upload
          const formData = new FormData();
          formData.append("title", data.title);
          formData.append("excerpt", data.excerpt);
          formData.append("content", data.content);
          formData.append("keywords", JSON.stringify(keywords));
          
          // Append image files
          imageFiles.forEach((file) => {
            formData.append("images", file);
          });

          const response = await fetch(`${API_URL}/admin/articles`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokens?.accessToken}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to create article");
          }

          toast.success("Article created successfully");
        } else {
          // No files, create without images
          await createMutation.mutateAsync({
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            keywords,
          });
          toast.success("Article created successfully");
        }
      }
      reset();
      setImages([]);
      setImageFiles([]);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save article", error);
      toast.error("Failed to save article");
    } finally {
      setUploading(false);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || uploading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title *</label>
        <Input {...register("title")} placeholder="Article title" />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Excerpt *</label>
        <Textarea {...register("excerpt")} placeholder="Brief summary" rows={3} />
        {errors.excerpt && (
          <p className="text-red-500 text-sm">{errors.excerpt.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Content *</label>
        <Textarea {...register("content")} placeholder="Full article content" rows={8} />
        {errors.content && (
          <p className="text-red-500 text-sm">{errors.content.message}</p>
        )}
      </div>

      {/* Image Upload Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Images (up to 4)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleImageSelect(e.target.files)}
            disabled={images.length >= 4 || isPending}
          />
          <label
            htmlFor="image-upload"
            className={`cursor-pointer flex flex-col items-center gap-2 ${
              images.length >= 4 || isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              {images.length >= 4
                ? "Maximum 4 images reached"
                : "Click to upload or drag and drop"}
            </span>
            <span className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB each
            </span>
          </label>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isPending}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Keywords (comma separated)</label>
        <Input {...register("tags")} placeholder="faith, history, prayer" />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => onSuccess?.()} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : articleId ? "Update Article" : "Create Article"}
        </Button>
      </div>
    </form>
  );
}
