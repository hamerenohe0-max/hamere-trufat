"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProgress, useUpdateProgress, useProgress } from "../hooks/useProgress";
import { toast } from "sonner";

const progressSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  pdfUrl: z.string().optional(),
  beforeImage: z.string().optional(),
  afterImage: z.string().optional(),
  mediaGallery: z.string().optional(), // Comma separated
});

type ProgressFormData = z.infer<typeof progressSchema>;

interface ProgressFormProps {
  progressId?: string;
  onSuccess?: () => void;
}

export function ProgressForm({ progressId, onSuccess }: ProgressFormProps) {
  const { data: existingProgress } = useProgress(progressId || "");
  const createMutation = useCreateProgress();
  const updateMutation = useUpdateProgress();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
  });

  useEffect(() => {
    if (existingProgress) {
      setValue("title", existingProgress.title);
      setValue("summary", existingProgress.summary);
      setValue("pdfUrl", existingProgress.pdf_url || "");
      setValue("beforeImage", existingProgress.before_image || "");
      setValue("afterImage", existingProgress.after_image || "");
      setValue("mediaGallery", existingProgress.media_gallery?.join(", ") || "");
    }
  }, [existingProgress, setValue]);

  const onSubmit = async (data: ProgressFormData) => {
    try {
      const payload = {
        title: data.title,
        summary: data.summary,
        pdfUrl: data.pdfUrl,
        beforeImage: data.beforeImage,
        afterImage: data.afterImage,
        mediaGallery: data.mediaGallery 
          ? data.mediaGallery.split(",").map(url => url.trim()).filter(Boolean) 
          : [],
      };

      if (progressId) {
        await updateMutation.mutateAsync({
          id: progressId,
          data: payload,
        });
        toast.success("Progress report updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Progress report created");
      }
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save progress", error);
      toast.error("Failed to save progress report");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title *</label>
        <Input {...register("title")} placeholder="Report title" />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Summary *</label>
        <Textarea {...register("summary")} placeholder="Report summary" rows={3} />
        {errors.summary && (
          <p className="text-red-500 text-sm">{errors.summary.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">PDF URL</label>
        <Input {...register("pdfUrl")} placeholder="https://..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Before Image URL</label>
          <Input {...register("beforeImage")} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">After Image URL</label>
          <Input {...register("afterImage")} placeholder="https://..." />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Media Gallery (Comma separated URLs)</label>
        <Textarea {...register("mediaGallery")} placeholder="https://..., https://..." rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : progressId ? "Update Report" : "Create Report"}
        </Button>
      </div>
    </form>
  );
}
