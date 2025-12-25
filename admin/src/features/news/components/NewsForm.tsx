"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useCreateNews, useUpdateNews, useNews } from "../hooks/useNews";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";

const newsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  body: z.string().min(1, "Body is required"),
  tags: z.string(),
  images: z.array(z.string()).max(4, "Maximum 4 images allowed").optional(),
  status: z.enum(["draft", "scheduled", "published"]),
  publishAt: z.string().optional(),
});

type NewsFormData = z.infer<typeof newsSchema>;

interface NewsFormProps {
  newsId?: string;
}

export function NewsForm({ newsId }: NewsFormProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data: existingNews } = useNews(newsId || "");
  const createMutation = useCreateNews();
  const updateMutation = useUpdateNews();

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      status: "draft",
      tags: "",
      images: [],
    },
  });

  useEffect(() => {
    if (existingNews) {
      setValue("title", existingNews.title);
      setValue("summary", existingNews.summary);
      setValue("body", existingNews.body);
      setValue("tags", existingNews.tags.join(", "));
      setValue("status", existingNews.status);
      const newsImages = existingNews.images || (existingNews.coverImage ? [existingNews.coverImage] : []);
      // Set existing images (these are URLs, not blob URLs)
      setImages(newsImages);
      setValue("images", newsImages);
      setImageFiles([]); // Clear file list when editing existing news (only new uploads go here)
    }
  }, [existingNews, setValue]);

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
    // Check if this is a blob URL (new upload) or regular URL (existing image)
    const isBlobUrl = images[index]?.startsWith("blob:");
    
    if (isBlobUrl) {
      // Remove from both files and previews
      const newFiles = imageFiles.filter((_, i) => i !== index);
      const newPreviews = images.filter((_, i) => i !== index);
      
      // Revoke object URL to free memory
      URL.revokeObjectURL(images[index]);
      
      setImageFiles(newFiles);
      setImages(newPreviews);
    } else {
      // Remove existing image URL
      const newPreviews = images.filter((_, i) => i !== index);
      setImages(newPreviews);
    }
  };

  const onSubmit = async (data: NewsFormData) => {
    try {
      setUploading(true);
      const tags = data.tags.split(",").map((t) => t.trim()).filter(Boolean);

      // Create FormData with files and other data
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("summary", data.summary);
      formData.append("body", data.body);
      formData.append("tags", JSON.stringify(tags));
      formData.append("status", data.status);
      
      // Append image files
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const tokens = useAuthStore.getState().tokens;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      if (newsId) {
        // For update: if there are new files, upload them and combine with existing images
        // Otherwise, update with current image list (existing URLs only, no blob URLs)
        if (imageFiles.length > 0) {
          // Get existing image URLs (not blob URLs) to preserve them
          const existingImageUrls = images.filter((img) => !img.startsWith("blob:"));
          
          // Send existing images as JSON string in FormData
          if (existingImageUrls.length > 0) {
            formData.append("existingImages", JSON.stringify(existingImageUrls));
          }
          
          // Upload new files via FormData
          const response = await fetch(`${API_URL}/admin/news/${newsId}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${tokens?.accessToken}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to update news article");
          }
        } else {
          // No new files, update with current image list (existing URLs only, no blob URLs)
          const existingImageUrls = images.filter((img) => !img.startsWith("blob:"));
          await updateMutation.mutateAsync({
            id: newsId,
            data: {
              title: data.title,
              summary: data.summary,
              body: data.body,
              tags,
              images: existingImageUrls,
              status: data.status,
            },
          });
        }
        toast.success("News article updated successfully");
      } else {
        // For create, always use FormData with files
        const response = await fetch(`${API_URL}/admin/news`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to create news article");
        }

        toast.success("News article created successfully");
      }

      router.push("/news");
    } catch (error) {
      toast.error(newsId ? "Failed to update news article" : "Failed to create news article");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{newsId ? "Edit News Article" : "Create News Article"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <Input {...register("title")} placeholder="Enter news title" />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary *
            </label>
            <Textarea
              {...register("summary")}
              placeholder="Brief summary of the news"
              rows={3}
            />
            {errors.summary && (
              <p className="text-red-600 text-sm mt-1">{errors.summary.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body *
            </label>
            <Textarea
              {...register("body")}
              placeholder="Full news article content"
              rows={10}
            />
            {errors.body && (
              <p className="text-red-600 text-sm mt-1">{errors.body.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images (up to 4)
            </label>
            <div className="space-y-4">
              {images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`News image ${index + 1}`}
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length < 4 && (
                <div>
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB each (Select multiple files)
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {images.length} / 4 images selected
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        handleImageSelect(e.target.files);
                        // Reset input to allow selecting the same file again
                        e.target.value = "";
                      }}
                      disabled={uploading}
                    />
                  </label>
                  {uploading && (
                    <p className="text-sm text-gray-500 mt-2">Uploading images...</p>
                  )}
                </div>
              )}
              {images.length >= 4 && (
                <p className="text-sm text-gray-500">Maximum 4 images reached. Remove an image to add more.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <Input
              {...register("tags")}
              placeholder="announcement, church, event"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select {...register("status")}>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : newsId
                  ? "Update News"
                  : "Create News"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

