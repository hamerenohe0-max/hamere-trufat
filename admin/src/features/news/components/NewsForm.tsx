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

const newsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  body: z.string().min(1, "Body is required"),
  tags: z.string(),
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
    },
  });

  useEffect(() => {
    if (existingNews) {
      setValue("title", existingNews.title);
      setValue("summary", existingNews.summary);
      setValue("body", existingNews.body);
      setValue("tags", existingNews.tags.join(", "));
      setValue("status", existingNews.status);
    }
  }, [existingNews, setValue]);

  const onSubmit = async (data: NewsFormData) => {
    const tags = data.tags.split(",").map((t) => t.trim()).filter(Boolean);

    if (newsId) {
      await updateMutation.mutateAsync({
        id: newsId,
        data: {
          title: data.title,
          summary: data.summary,
          body: data.body,
          tags,
          status: data.status,
        },
      });
    } else {
      await createMutation.mutateAsync({
        title: data.title,
        summary: data.summary,
        body: data.body,
        tags,
        status: data.status,
        authorId: user?.id || "",
      });
    }

    router.push("/news");
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

