"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSendNotification } from "../hooks/useNotifications";
import { useRouter } from "next/navigation";

const notificationSchema = z.object({
  type: z.enum(["assignment", "submission", "news", "system"]),
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  targetRole: z.enum(["all", "user", "publisher", "admin"]).optional(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export function NotificationForm() {
  const router = useRouter();
  const sendMutation = useSendNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: "news",
      targetRole: "all",
    },
  });

  const onSubmit = async (data: NotificationFormData) => {
    await sendMutation.mutateAsync({
      type: data.type,
      title: data.title,
      body: data.body,
      targetRole: data.targetRole,
    });
    router.push("/notifications");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Notification</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <Select {...register("type")}>
              <option value="news">News</option>
              <option value="system">System</option>
              <option value="assignment">Assignment</option>
              <option value="submission">Submission</option>
            </Select>
            {errors.type && (
              <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <Input {...register("title")} placeholder="Notification title" />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body *
            </label>
            <Textarea
              {...register("body")}
              placeholder="Notification message"
              rows={4}
            />
            {errors.body && (
              <p className="text-red-600 text-sm mt-1">{errors.body.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience
            </label>
            <Select {...register("targetRole")}>
              <option value="all">All Users</option>
              <option value="user">Regular Users</option>
              <option value="publisher">Publishers</option>
              <option value="admin">Admins</option>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? "Sending..." : "Send Notification"}
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

