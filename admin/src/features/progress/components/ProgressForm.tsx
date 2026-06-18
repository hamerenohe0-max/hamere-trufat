"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useCreateProgress, useUpdateProgress, useProgress } from "../hooks/useProgress";
import { toast } from "sonner";
import { Plus, X, Loader2, FileText } from "lucide-react";
import { uploadFileToCloudinary } from "@/services/cloudinary";

const progressSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  beforeImage: z.string().optional(),
  afterImage: z.string().optional(),
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

  const [pdfUrl, setPdfUrl] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [mediaGallery, setMediaGallery] = useState<string[]>(['']);
  const pdfInputRef = useRef<HTMLInputElement>(null);

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
      setPdfUrl(existingProgress.pdf_url || "");
      setBeforeImage(existingProgress.before_image || "");
      setAfterImage(existingProgress.after_image || "");
      const gallery = existingProgress.media_gallery || [];
      setMediaGallery(gallery.length > 0 ? gallery : ['']);
    }
  }, [existingProgress, setValue]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    setUploadingPdf(true);
    try {
      const result = await uploadFileToCloudinary({
        file,
        folder: "hamere-trufat/progress/pdfs",
        resourceType: "raw",
      });
      setPdfUrl(result.secure_url);
      toast.success("PDF uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload PDF");
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const addMediaSlot = () => {
    setMediaGallery([...mediaGallery, '']);
  };

  const removeMedia = (index: number) => {
    const newGallery = mediaGallery.filter((_, i) => i !== index);
    setMediaGallery(newGallery.length > 0 ? newGallery : ['']);
  };

  const onSubmit = async (data: ProgressFormData) => {
    try {
      const validGallery = mediaGallery.filter((url) => url && url.trim().length > 0);

      const payload = {
        title: data.title,
        summary: data.summary,
        pdfUrl,
        beforeImage,
        afterImage,
        mediaGallery: validGallery,
      };

      if (progressId) {
        await updateMutation.mutateAsync({ id: progressId, data: payload });
        toast.success("Progress report updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Progress report created");
      }
      reset();
      setPdfUrl("");
      setBeforeImage("");
      setAfterImage("");
      setMediaGallery(['']);
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
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Summary *</label>
        <Textarea {...register("summary")} placeholder="Report summary" rows={3} />
        {errors.summary && <p className="text-red-500 text-sm">{errors.summary.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">PDF Document</label>
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handlePdfUpload}
          className="hidden"
        />
        {pdfUrl ? (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-700 truncate flex-1">{pdfUrl.split('/').pop()}</span>
            <button type="button" onClick={() => setPdfUrl("")} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => pdfInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400"
          >
            {uploadingPdf ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Uploading PDF...</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Click to upload a PDF document</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Before Image</label>
          <ImageUpload
            value={beforeImage || undefined}
            onChange={(url) => setBeforeImage(url || "")}
            folder="hamere-trufat/progress"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">After Image</label>
          <ImageUpload
            value={afterImage || undefined}
            onChange={(url) => setAfterImage(url || "")}
            folder="hamere-trufat/progress"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Media Gallery</label>
        <div className="space-y-3">
          {mediaGallery.map((url, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <ImageUpload
                  value={url || undefined}
                  onChange={(newUrl) => {
                    const newGallery = [...mediaGallery];
                    newGallery[index] = newUrl || '';
                    setMediaGallery(newGallery);
                  }}
                  folder="hamere-trufat/progress/gallery"
                />
              </div>
              {mediaGallery.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="mt-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addMediaSlot} className="mt-2">
          <Plus className="h-4 w-4 mr-1" />
          Add Image
        </Button>
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
