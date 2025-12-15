"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "../services/roles.api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export function PublisherList() {
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-publisher-requests"],
    queryFn: rolesApi.getPublisherRequests,
  });

  const approveMutation = useMutation({
    mutationFn: rolesApi.approvePublisher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-publisher-requests"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rolesApi.rejectPublisher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-publisher-requests"] });
    },
  });

  // Mock data
  const mockRequests = [
    {
      id: "1",
      userId: "user-1",
      userName: "John Doe",
      userEmail: "john@example.com",
      status: "pending" as const,
      requestedAt: new Date().toISOString(),
    },
  ];

  const requestItems = requests || mockRequests;
  const pendingRequests = requestItems.filter((r) => r.status === "pending");

  if (isLoading) {
    return <div className="text-center py-8">Loading publisher requests...</div>;
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingRequests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No pending publisher requests.
              </TableCell>
            </TableRow>
          ) : (
            pendingRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.userName}</TableCell>
                <TableCell>{request.userEmail}</TableCell>
                <TableCell>
                  {format(new Date(request.requestedAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Pending
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => approveMutation.mutate(request.id)}
                      className="text-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to reject this request?")) {
                          rejectMutation.mutate(request.id);
                        }
                      }}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

