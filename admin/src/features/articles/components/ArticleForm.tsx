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
import { uploadImageToCloudinary } from "@/services/cloudinary";

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
    }
  }, [existingArticle, setValue]);


  const handleImageSelect = async (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const remainingSlots = 4 - images.length;

    // Validate files
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

    // Upload files directly to Cloudinary
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of newFiles) {
        try {
          const result = await uploadImageToCloudinary({
            file,
            folder: "hamere-trufat/articles",
            onProgress: (progress) => {
              // Could show individual progress here
            },
          });
          uploadedUrls.push(result.secure_url);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        const updatedImages = [...images, ...uploadedUrls].slice(0, 4);
        setImages(updatedImages);
        setValue("images", updatedImages);

        if (updatedImages.length >= 4) {
          toast.info("Maximum 4 images reached");
        } else {
          toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue("images", newImages);
  };

  const onSubmit = async (data: ArticleFormData) => {
    try {
      const keywords = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

      if (articleId) {
        // Update article - images are already uploaded URLs
        await updateMutation.mutateAsync({
          id: articleId,
          data: {
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            images: images, // Already Cloudinary URLs
            keywords,
          },
        });
        toast.success("Article updated successfully");
      } else {
        // Create article - images are already uploaded URLs
        await createMutation.mutateAsync({
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          images: images, // Already Cloudinary URLs
          keywords,
        });
        toast.success("Article created successfully");
      }
      reset();
      setImages([]);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save article", error);
      toast.error("Failed to save article");
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
        <label className="text-sm font-medium">Photos / Images (up to 4) *</label>
        <p className="text-xs text-gray-500 mb-3">
          Upload photos to display with your article. These will appear in the mobile app.
        </p>
        
        {/* Image Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-100 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
                  disabled={isPending}
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-b-lg">
                  Image {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length < 4 && (
          <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center bg-blue-50 hover:bg-blue-100 transition-colors">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleImageSelect(e.target.files);
                if (e.target) e.target.value = "";
              }}
              disabled={images.length >= 4 || isPending}
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer flex flex-col items-center gap-2 ${
                images.length >= 4 || isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="w-10 h-10 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">
                <span className="text-blue-600">Click to upload photos</span> or drag and drop
              </span>
              <span className="text-xs text-gray-600">
                PNG, JPG, GIF up to 10MB each
              </span>
              <span className="text-xs font-medium text-blue-600 mt-1">
                {images.length} / 4 images selected
              </span>
            </label>
          </div>
        )}

        {images.length >= 4 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800 font-medium">
              ✓ Maximum 4 images reached. Remove an image to add more.
            </p>
          </div>
        )}

        {uploading && (
          <p className="text-sm text-blue-600 font-medium">Uploading images...</p>
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
