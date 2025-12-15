"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feastsApi } from "../services/feasts.api";
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
import { Edit, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export function FeastList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: feasts, isLoading } = useQuery({
    queryKey: ["admin-feasts"],
    queryFn: feastsApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: feastsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feasts"] });
    },
  });

  // Mock data
  const mockFeasts = [
    {
      id: "1",
      name: "ገና (የክርስቶስ ልደት)",
      date: "2025-01-07",
      region: "Ethiopian Orthodox",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      articleIds: [],
    },
  ];

  const feastItems = feasts || mockFeasts;

  if (isLoading) {
    return <div className="text-center py-8">Loading feasts...</div>;
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Feast Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Region</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feastItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                No feasts found. Create your first feast!
              </TableCell>
            </TableRow>
          ) : (
            feastItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  {format(new Date(item.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{item.region}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/feasts/${item.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/feasts/${item.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this feast?")) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
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

