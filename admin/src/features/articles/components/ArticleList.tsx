"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "../services/articles.api";
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

export function ArticleList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: articles, isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: articlesApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: articlesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
  });

  // Mock data
  const mockArticles = [
    {
      id: "1",
      title: "ኑ ከዚህ አለም እንውጣ",
      slug: "nuke-kezih-alem-enwet",
      content: "",
      authorId: "1",
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      relatedEventIds: [],
      relatedFeastIds: [],
    },
  ];

  const articleItems = articles || mockArticles;

  if (isLoading) {
    return <div className="text-center py-8">Loading articles...</div>;
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Published</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articleItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                No articles found. Create your first article!
              </TableCell>
            </TableRow>
          ) : (
            articleItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  {item.publishedAt
                    ? format(new Date(item.publishedAt), "MMM d, yyyy")
                    : "Draft"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/articles/${item.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/articles/${item.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this article?")) {
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

