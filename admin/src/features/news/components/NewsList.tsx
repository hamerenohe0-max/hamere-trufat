"use client";

import { useState } from "react";
import { useNewsList, useDeleteNews, usePublishNews } from "../hooks/useNews";
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
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function NewsList() {
  const router = useRouter();
  const { data: news, isLoading, error, isError } = useNewsList();
  const deleteMutation = useDeleteNews();
  const publishMutation = usePublishNews();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Mock data for development
  const mockNews = [
    {
      id: "1",
      title: "ወደ ማኅበራችን መረጃ ቻናል እንኳን በደህና መጡ!",
      summary: "ይህ ቻናል የማኅበራችን ተግባራትን፣ የተካሄዱ ስራዎችንና የተደረጉ ስኬቶችን በዜና መልክ ለአባላት ለማቅረብ የተከፈተ ነው።",
      status: "published" as const,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["announcement"],
      authorId: "1",
      body: "",
    },
    {
      id: "2",
      title: "የአንደኛ ዓመት የምስረታ በዓላችን",
      summary: "ሐመረ ኖኅ ሀ ብላ እንደ ማኅበር ከተቋቋመችበት...",
      status: "draft" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["anniversary"],
      authorId: "1",
      body: "",
    },
  ];

  const newsItems = news?.items || mockNews;

  const handleDelete = async () => {
    if (deletingId) {
      try {
        await deleteMutation.mutateAsync(deletingId);
        toast.success("News article deleted successfully");
        setDeletingId(null);
      } catch (error) {
        toast.error("Failed to delete news article");
        console.error(error);
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishMutation.mutateAsync(id);
      toast.success("News article published successfully");
    } catch (error) {
      toast.error("Failed to publish news article");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      published: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status] || "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading news...</div>;
  }

  if (isError) {
    return (
      <Card>
        <div className="text-center py-8 text-red-600">
          <p className="font-semibold">Failed to load news articles</p>
          <p className="text-sm text-gray-600 mt-2">
            {error instanceof Error ? error.message : "Please check your authentication and try again."}
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Make sure you are logged in and have the correct permissions.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {newsItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No news items found. Create your first news article!
              </TableCell>
            </TableRow>
          ) : (
            newsItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  {item.publishedAt
                    ? format(new Date(item.publishedAt), "MMM d, yyyy")
                    : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/news/${item.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/news/${item.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {item.status !== "published" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublish(item.id)}
                        disabled={publishMutation.isPending}
                      >
                        {publishMutation.isPending ? "Publishing..." : "Publish"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingId(item.id)}
                      disabled={deleteMutation.isPending}
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

      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the news article
              "{newsItems.find((item) => item.id === deletingId)?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

