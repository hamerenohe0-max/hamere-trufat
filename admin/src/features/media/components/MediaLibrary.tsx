"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "../services/media.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Image as ImageIcon, File, Video, Music } from "lucide-react";
import { format } from "date-fns";

export function MediaLibrary() {
  const queryClient = useQueryClient();
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

  // Mock data
  const mockMedia = [
    {
      id: "1",
      filename: "church-image.jpg",
      url: "https://via.placeholder.com/300",
      type: "image" as const,
      size: 1024000,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "admin",
    },
  ];

  const mediaItems = media || mockMedia;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return ImageIcon;
      case "video":
        return Video;
      case "audio":
        return Music;
      default:
        return File;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading media...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {mediaItems.map((item) => {
        const Icon = getTypeIcon(item.type);
        return (
          <Card key={item.id} className="overflow-hidden">
            {item.type === "image" ? (
              <img
                src={item.url}
                alt={item.filename}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <Icon className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="p-4">
              <p className="font-medium text-sm truncate">{item.filename}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatFileSize(item.size)} • {format(new Date(item.uploadedAt), "MMM d")}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this media?")) {
                    deleteMutation.mutate(item.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

