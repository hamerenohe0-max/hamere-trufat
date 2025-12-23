"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateArticle, useUpdateArticle, useArticle } from "../hooks/useArticles";
import { toast } from "sonner";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().optional(),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
  });

  useEffect(() => {
    if (existingArticle) {
      setValue("title", existingArticle.title);
      setValue("excerpt", existingArticle.excerpt);
      setValue("content", existingArticle.content);
      setValue("coverImage", existingArticle.cover_image || "");
      // setValue("tags", existingArticle.keywords?.join(", ") || ""); // Map keywords if available?
    }
  }, [existingArticle, setValue]);

  const onSubmit = async (data: ArticleFormData) => {
    // Map tags input string to keywords array for backend
    const keywords = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined;

    try {
      if (articleId) {
        await updateMutation.mutateAsync({
          id: articleId,
          data: {
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            coverImage: data.coverImage,
            keywords, 
          },
        });
        toast.success("Article updated successfully");
      } else {
        await createMutation.mutateAsync({
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          coverImage: data.coverImage,
          keywords,
          // authorId is injected by backend from JWT
        });
        toast.success("Article created successfully");
      }
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save article", error);
      toast.error("Failed to save article");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

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
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Cover Image URL</label>
        <Input {...register("coverImage")} placeholder="https://..." />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Keywords (comma separated)</label>
        <Input {...register("tags")} placeholder="faith, history, prayer" />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : articleId ? "Update Article" : "Create Article"}
        </Button>
      </div>
    </form>
  );
}
