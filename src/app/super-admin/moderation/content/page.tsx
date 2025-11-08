import { getSession } from "@/lib/actions/auth";
import { getAllPosts } from "@/lib/actions/super-admin/moderation";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";

export default async function ContentModerationPage() {
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const { posts, total } = await getAllPosts({
    limit: 50,
  }).catch(() => ({ posts: [], total: 0 }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">
            Review and moderate user-generated content
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Total Posts: {total}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>
            Player posts and content for moderation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts found</p>
            ) : (
              posts.slice(0, 20).map((post) => (
                <div key={post.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-sm">{post.player.name}</p>
                        <span className="text-xs text-muted-foreground">
                          @{post.player.username}
                        </span>
                      </div>
                      <p className="text-sm">{post.content}</p>
                      {post.mediaUrl && (
                        <Badge variant="outline" className="mt-2">
                          {post.mediaType}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-red-600" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

