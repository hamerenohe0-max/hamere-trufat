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
import { X, Upload, Link as LinkIcon } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";

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

  const [imageUrls, setImageUrls] = useState<string[]>(['', '', '', '']); // 4 URL input fields
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('upload'); // Toggle between URL and file upload

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
      // Fill URL inputs with existing images
      const urls = [...newsImages, '', '', '', ''].slice(0, 4);
      setImageUrls(urls);
      setValue("images", newsImages);
    }
  }, [existingNews, setValue]);

  // Convert Google Drive sharing links to direct image URLs
  const convertGoogleDriveLink = (url: string): string => {
    if (!url || typeof url !== 'string') return url;
    
    // Match Google Drive sharing link format: https://drive.google.com/file/d/FILE_ID/view
    // Also handles: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      const fileId = driveMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    // Also handle shortened Google Drive links
    const shortMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (shortMatch) {
      const fileId = shortMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    // Handle direct file ID in URL
    const directIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (directIdMatch && url.includes('drive.google.com')) {
      const fileId = directIdMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    return url; // Return as-is if not a Google Drive link
  };

  const handleUrlChange = (index: number, url: string) => {
    // Automatically convert Google Drive links
    const convertedUrl = convertGoogleDriveLink(url);
    
    const newUrls = [...imageUrls];
    newUrls[index] = convertedUrl;
    setImageUrls(newUrls);
    
    // Update form value with non-empty URLs
    const validUrls = newUrls.filter((u) => u && u.trim().length > 0);
    setValue("images", validUrls);
    
    // Show notification if conversion happened
    if (convertedUrl !== url && url.includes('drive.google.com')) {
      toast.info("Google Drive link converted to direct image URL");
    }
  };

  const removeImageUrl = (index: number) => {
    const newUrls = [...imageUrls];
    newUrls[index] = '';
    setImageUrls(newUrls);
    
    const validUrls = newUrls.filter((u) => u && u.trim().length > 0);
    setValue("images", validUrls);
  };

  const onSubmit = async (data: NewsFormData) => {
    try {
      const tags = data.tags.split(",").map((t) => t.trim()).filter(Boolean);
      
      // Get valid image URLs (non-empty)
      const validImageUrls = imageUrls.filter((url) => url && url.trim().length > 0);
      
      // Validate URLs
      const invalidUrls = validImageUrls.filter((url) => {
        try {
          new URL(url);
          return false;
        } catch {
          return true;
        }
      });
      
      if (invalidUrls.length > 0) {
        toast.error("Please enter valid image URLs (must start with http:// or https://)");
        return;
      }

      if (newsId) {
        // Update existing news
        await updateMutation.mutateAsync({
          id: newsId,
          data: {
            title: data.title,
            summary: data.summary,
            body: data.body,
            tags,
            images: validImageUrls, // Send URLs directly
            status: data.status,
          },
        });
        toast.success("News article updated successfully");
      } else {
        // Create new news
        await createMutation.mutateAsync({
          title: data.title,
          summary: data.summary,
          body: data.body,
          tags,
          images: validImageUrls, // Send URLs directly
          status: data.status,
          authorId: user?.id || "",
        });
        toast.success("News article created successfully");
      }

      router.push("/news");
    } catch (error) {
      toast.error(newsId ? "Failed to update news article" : "Failed to create news article");
      console.error(error);
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Images (up to 4)
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={uploadMode === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMode('upload')}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
                <Button
                  type="button"
                  variant={uploadMode === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMode('url')}
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  URL
                </Button>
              </div>
            </div>
            
            {uploadMode === 'upload' ? (
              <div className="space-y-4">
                {imageUrls.map((url, index) => (
                  <div key={index}>
                    <label className="block text-xs text-gray-600 mb-1">
                      Image {index + 1}
                    </label>
                    <ImageUpload
                      value={url || undefined}
                      onChange={(newUrl) => {
                        const newUrls = [...imageUrls];
                        newUrls[index] = newUrl || '';
                        setImageUrls(newUrls);
                        const validUrls = newUrls.filter((u) => u && u.trim().length > 0);
                        setValue("images", validUrls);
                      }}
                      folder="hamere-trufat/news"
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-500">
                  Upload images directly to Cloudinary. Images are optimized automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 mb-3">
                  Enter image URLs (e.g., from Cloudinary, Imgur, or any image hosting service). 
                  These will appear in the mobile app. Leave empty if not needed.
                </p>
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        type="url"
                        placeholder={`Image ${index + 1} URL (e.g., https://res.cloudinary.com/...)`}
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                      />
                    </div>
                    {url && (
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-gray-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-700 z-10"
                          title="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <p className="text-xs text-gray-500">
                  Tip: Use the Upload mode for direct Cloudinary uploads, or paste URLs here.
                </p>
              </div>
            )}
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

