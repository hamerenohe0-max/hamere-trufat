"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, User } from "../services/users.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { toast } from "sonner";

interface PublisherProfileFormProps {
  publisherId: string;
  onSuccess?: () => void;
}

export function PublisherProfileForm({
  publisherId,
  onSuccess,
}: PublisherProfileFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    region: "",
    language: "",
    avatarUrl: "",
    status: "active" as "active" | "suspended",
  });

  const { data: publisher, isLoading } = useQuery({
    queryKey: ["admin-publisher", publisherId],
    queryFn: () => usersApi.get(publisherId),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<User> & {
      bio?: string;
      phone?: string;
      region?: string;
      language?: string;
      avatarUrl?: string;
    }) => usersApi.update(publisherId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-publisher", publisherId] });
      queryClient.invalidateQueries({ queryKey: ["admin-publishers"] });
      toast.success("Publisher profile updated successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update publisher profile");
    },
  });

  useEffect(() => {
    if (publisher) {
      setFormData({
        name: publisher.name || "",
        email: publisher.email || "",
        bio: publisher.profile?.bio || "",
        phone: publisher.profile?.phone || "",
        region: publisher.profile?.region || "",
        language: publisher.profile?.language || "",
        avatarUrl: publisher.profile?.avatarUrl || "",
        status: publisher.status || "active",
      });
    }
  }, [publisher]);




  const handleImageUpload = (url: string | null) => {
    setFormData((prev) => ({ ...prev, avatarUrl: url || "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: formData.name,
      status: formData.status,
      bio: formData.bio,
      phone: formData.phone,
      region: formData.region,
      language: formData.language,
      avatarUrl: formData.avatarUrl,
    });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading publisher data...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name *</label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input value={formData.email} disabled className="bg-gray-50" />
          <p className="text-xs text-gray-500">Email cannot be changed</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Bio</label>
        <Textarea
          value={formData.bio}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, bio: e.target.value }))
          }
          rows={4}
          placeholder="Publisher biography..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone</label>
          <Input
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="+1234567890"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Region</label>
          <Input
            value={formData.region}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, region: e.target.value }))
            }
            placeholder="e.g., Addis Ababa"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Language</label>
          <Select
            value={formData.language}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, language: e.target.value }))
            }
          >
            <option value="">Select language</option>
            <option value="amharic">Amharic</option>
            <option value="english">English</option>
            <option value="geez">Geez</option>
            <option value="tigrinya">Tigrinya</option>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status *</label>
          <Select
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                status: e.target.value as "active" | "suspended",
              }))
            }
            required
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Avatar</label>
        <ImageUpload
          value={formData.avatarUrl || undefined}
          onChange={handleImageUpload}
          folder="hamere-trufat/profiles"
          maxSizeMB={5}
          disabled={updateMutation.isPending}
          aspectRatio={1}
          enableCrop={true}
        />
        <p className="text-xs text-gray-500">
          Upload a square image. You can crop and adjust the image before uploading.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={updateMutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

