"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEvent, useUpdateEvent, useEvent } from "../hooks/useEvents";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  location: z.string().min(1, "Location is required"),
  featured: z.boolean(),
  reminderEnabled: z.boolean(),
  flyerImage: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  eventId?: string;
  onSuccess?: () => void;
}

export function EventForm({ eventId, onSuccess }: EventFormProps) {
  const { data: existingEvent } = useEvent(eventId || "");
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      featured: false,
      reminderEnabled: false,
    },
  });

  useEffect(() => {
    if (existingEvent) {
      setValue("name", existingEvent.name);
      setValue("description", existingEvent.description);
      setValue("startDate", existingEvent.start_date ? new Date(existingEvent.start_date).toISOString().slice(0, 16) : "");
      setValue("endDate", existingEvent.end_date ? new Date(existingEvent.end_date).toISOString().slice(0, 16) : "");
      setValue("location", existingEvent.location);
      setValue("featured", existingEvent.featured);
      setValue("reminderEnabled", existingEvent.reminder_enabled);
      setValue("flyerImage", existingEvent.flyer_images?.[0] || "");
    }
  }, [existingEvent, setValue]);

  const onSubmit = async (data: EventFormData) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        location: data.location,
        featured: data.featured,
        reminderEnabled: data.reminderEnabled,
        flyerImages: data.flyerImage ? [data.flyerImage] : [],
      };

      if (eventId) {
        await updateMutation.mutateAsync({
          id: eventId,
          data: payload,
        });
        toast.success("Event updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Event created successfully");
      }
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save event", error);
      toast.error("Failed to save event");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Event Name *</label>
        <Input {...register("name")} placeholder="Event name" />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description *</label>
        <Textarea {...register("description")} placeholder="Event description" rows={3} />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date *</label>
          <Input type="datetime-local" {...register("startDate")} />
          {errors.startDate && (
            <p className="text-red-500 text-sm">{errors.startDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">End Date *</label>
          <Input type="datetime-local" {...register("endDate")} />
          {errors.endDate && (
            <p className="text-red-500 text-sm">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Location *</label>
        <Input {...register("location")} placeholder="Event location" />
        {errors.location && (
          <p className="text-red-500 text-sm">{errors.location.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Flyer Image URL</label>
        <Input {...register("flyerImage")} placeholder="https://..." />
      </div>

      <div className="flex items-center space-x-2">
      <Checkbox 
          id="featured" 
          checked={!!watch("featured")}
          onCheckedChange={(checked) => setValue("featured", checked as boolean)}
        />
        <label htmlFor="featured" className="text-sm font-medium">
          Featured Event
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="reminderEnabled" 
          checked={!!watch("reminderEnabled")}
          onCheckedChange={(checked) => setValue("reminderEnabled", checked as boolean)}
        />
        <label htmlFor="reminderEnabled" className="text-sm font-medium">
          Enable Reminders
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : eventId ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
