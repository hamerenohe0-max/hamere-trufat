"use client";

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

export function NewsList() {
  const router = useRouter();
  const { data: news, isLoading } = useNewsList();
  const deleteMutation = useDeleteNews();
  const publishMutation = usePublishNews();

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

  const newsItems = news || mockNews;

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
                        onClick={() => publishMutation.mutate(item.id)}
                      >
                        Publish
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this news item?")) {
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

