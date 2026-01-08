"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../services/users.api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Eye, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PublisherProfileForm } from "./PublisherProfileForm";

// Helper function to safely format dates
function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, "MMM d, yyyy");
  } catch {
    return "N/A";
  }
}

export function PublisherManagement() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-publishers"],
    queryFn: () => usersApi.getPublishers(),
  });

  const suspendMutation = useMutation({
    mutationFn: usersApi.suspend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-publishers"] });
      toast.success("Publisher suspended successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to suspend publisher");
    },
  });

  const activateMutation = useMutation({
    mutationFn: usersApi.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-publishers"] });
      toast.success("Publisher activated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to activate publisher");
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading publishers...</div>;
  }

  if (error) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="font-semibold text-red-600">Failed to load publishers</p>
        <p className="text-sm text-gray-600 mt-2">
          {error instanceof Error ? error.message : "Please try again."}
        </p>
      </div>
    );
  }

  const publishers = data?.items || [];

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No publishers found.
                </TableCell>
              </TableRow>
            ) : (
              publishers.map((publisher) => (
                <TableRow key={publisher.id}>
                  <TableCell className="font-medium">{publisher.name}</TableCell>
                  <TableCell>{publisher.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={publisher.status === "active" ? "default" : "secondary"}
                    >
                      {publisher.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {publisher.lastLoginAt ? formatDate(publisher.lastLoginAt) : "Never"}
                  </TableCell>
                  <TableCell>
                    {formatDate(publisher.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingId(publisher.id)}
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingId(publisher.id)}
                        title="Edit Profile"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {publisher.status === "active" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to suspend ${publisher.name}?`
                              )
                            ) {
                              suspendMutation.mutate(publisher.id);
                            }
                          }}
                          className="text-orange-600"
                          title="Suspend Publisher"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => activateMutation.mutate(publisher.id)}
                          className="text-green-600"
                          title="Activate Publisher"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Profile Dialog */}
      <Dialog open={!!viewingId} onOpenChange={(open) => !open && setViewingId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Publisher Profile</DialogTitle>
          </DialogHeader>
          {viewingId && <PublisherProfileView publisherId={viewingId} />}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Publisher Profile</DialogTitle>
          </DialogHeader>
          {editingId && (
            <PublisherProfileForm
              publisherId={editingId}
              onSuccess={() => {
                setEditingId(null);
                queryClient.invalidateQueries({ queryKey: ["admin-publishers"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// View-only component for publisher profile
function PublisherProfileView({ publisherId }: { publisherId: string }) {
  const { data: publisher, isLoading } = useQuery({
    queryKey: ["admin-publisher", publisherId],
    queryFn: () => usersApi.get(publisherId),
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading profile...</div>;
  }

  if (!publisher) {
    return <div className="text-center py-4 text-red-600">Publisher not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Name</label>
          <p className="mt-1">{publisher.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="mt-1">{publisher.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <div className="mt-1">
            <Badge
              variant={publisher.status === "active" ? "default" : "secondary"}
            >
              {publisher.status}
            </Badge>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Role</label>
          <p className="mt-1 capitalize">{publisher.role}</p>
        </div>
        {publisher.profile?.phone && (
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="mt-1">{publisher.profile.phone}</p>
          </div>
        )}
        {publisher.profile?.region && (
          <div>
            <label className="text-sm font-medium text-gray-500">Region</label>
            <p className="mt-1">{publisher.profile.region}</p>
          </div>
        )}
        {publisher.profile?.language && (
          <div>
            <label className="text-sm font-medium text-gray-500">Language</label>
            <p className="mt-1">{publisher.profile.language}</p>
          </div>
        )}
      </div>
      {publisher.profile?.bio && (
        <div>
          <label className="text-sm font-medium text-gray-500">Bio</label>
          <p className="mt-1 text-gray-900">{publisher.profile.bio}</p>
        </div>
      )}
      {publisher.profile?.avatarUrl && (
        <div>
          <label className="text-sm font-medium text-gray-500">Avatar</label>
          <img
            src={publisher.profile.avatarUrl}
            alt={publisher.name}
            className="mt-2 w-24 h-24 rounded-full object-cover"
          />
        </div>
      )}
    </div>
  );
}

