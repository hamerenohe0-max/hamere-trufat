"use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useNews } from "@/features/news/hooks/useNews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Calendar, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { use } from "react";

export default function NewsViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: news, isLoading, error } = useNews(id);

  if (isLoading) {
    return (
      <AuthGate roles={["admin", "publisher"]}>
        <AdminLayout>
          <div className="text-center py-8">Loading news article...</div>
        </AdminLayout>
      </AuthGate>
    );
  }

  if (error || !news) {
    return (
      <AuthGate roles={["admin", "publisher"]}>
        <AdminLayout>
          <div className="text-center py-8 text-red-600">
            Failed to load news article. {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </AdminLayout>
      </AuthGate>
    );
  }

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

  const formatDate = (dateString: string | null | undefined, fallback: string = "N/A"): string => {
    if (!dateString) return fallback;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return fallback;
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch {
      return fallback;
    }
  };

  return (
    <AuthGate roles={["admin", "publisher"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/news")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to News
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">News Article</h1>
                <p className="text-gray-600 mt-1">View news article details</p>
              </div>
            </div>
            <Button onClick={() => router.push(`/news/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl">{news.title}</CardTitle>
                {getStatusBadge(news.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    <strong>Published:</strong>{" "}
                    {formatDate(news.publishedAt, "Not published")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    <strong>Created:</strong>{" "}
                    {formatDate(news.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    <strong>Updated:</strong>{" "}
                    {formatDate(news.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>
                    <strong>Author ID:</strong> {news.authorId}
                  </span>
                </div>
              </div>

              {news.images && news.images.length > 0 && (
                <div>
                  <strong className="text-sm font-medium text-gray-700 mb-2 block">Images:</strong>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {news.images.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`News image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {news.tags && news.tags.length > 0 && (
                <div>
                  <strong className="text-sm font-medium text-gray-700 mb-2 block">Tags:</strong>
                  <div className="flex gap-2 flex-wrap">
                    {news.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <strong className="text-sm font-medium text-gray-700 mb-2 block">Summary:</strong>
                <p className="text-gray-700 whitespace-pre-wrap">{news.summary}</p>
              </div>

              <div>
                <strong className="text-sm font-medium text-gray-700 mb-2 block">Content:</strong>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{news.body}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AuthGate>
  );
}

