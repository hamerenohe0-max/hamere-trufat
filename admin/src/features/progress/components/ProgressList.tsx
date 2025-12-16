"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { progressApi } from "../services/progress.api";
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

export function ProgressList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-progress"],
    queryFn: progressApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: progressApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-progress"] });
    },
  });

  // Mock data
  const mockReports = [
    {
      id: "1",
      title: "የቤተክርስቲያን ሕንፃ የግንባታ ስራ",
      summary: "ደብረ ምህረት መድኃኔዓለም ቤተክርስቲያን",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [],
    },
  ];

  const reportItems = reports?.items || mockReports;

  if (isLoading) {
    return <div className="text-center py-8">Loading progress reports...</div>;
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                No progress reports found. Create your first report!
              </TableCell>
            </TableRow>
          ) : (
            reportItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell className="max-w-md truncate">{item.summary}</TableCell>
                <TableCell>
                  {format(new Date(item.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/progress/${item.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/progress/${item.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this report?")) {
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

