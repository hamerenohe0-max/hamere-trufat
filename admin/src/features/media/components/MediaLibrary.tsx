"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "../services/media.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Image as ImageIcon, File, Video, Music, Upload, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function MediaLibrary() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: media, isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: mediaApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: mediaApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
      toast.error("Please select an image, video, or audio file");
      return;
    }

    setUploading(true);
    try {
      await mediaApi.upload(file);
      toast.success("File uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this media?")) {
      deleteMutation.mutate(id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image": return ImageIcon;
      case "video": return Video;
      case "audio": return Music;
      default: return File;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const mediaItems = media?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          onChange={handleUpload}
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {uploading && (
        <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700">Uploading to Cloudinary...</span>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading media...</div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center py-12">
          <Upload className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">No media files yet</p>
          <p className="text-sm text-gray-500 mt-1">Click the Upload Media button above to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mediaItems.map((item) => {
            const Icon = getTypeIcon(item.type);
            return (
              <Card key={item.id} className="overflow-hidden">
                {item.type === "image" ? (
                  <img src={item.url} alt={item.filename} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <Icon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="p-4">
                  <p className="font-medium text-sm truncate">{item.filename}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(item.size)} &bull; {format(new Date(item.uploadedAt), "MMM d")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

