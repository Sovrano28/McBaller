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
import { PostModerationActions } from "@/components/super-admin/post-moderation-actions";
import { format } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ContentModerationPage() {
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const [allPosts, flaggedPosts] = await Promise.all([
    getAllPosts({ limit: 100 }).catch(() => ({ posts: [], total: 0 })),
    getAllPosts({ isFlagged: true, limit: 100 }).catch(() => ({
      posts: [],
      total: 0,
    })),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">
            Review and moderate user-generated content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Total Posts: {allPosts.total}
          </Badge>
          {flaggedPosts.total > 0 && (
            <Badge variant="destructive" className="text-sm">
              Flagged: {flaggedPosts.total}
            </Badge>
          )}
        </div>
      </div>

      {flaggedPosts.posts.length > 0 && (
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-900 dark:text-red-100">
              Flagged Posts ({flaggedPosts.total})
            </CardTitle>
            <CardDescription>
              Posts that have been flagged as inappropriate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flaggedPosts.posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-lg border border-red-200 bg-white dark:bg-gray-900 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={post.player.avatar || undefined}
                            alt={post.player.name}
                          />
                          <AvatarFallback>
                            {post.player.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/super-admin/players/${post.playerId}`}
                            className="font-medium text-sm hover:underline text-blue-600"
                          >
                            {post.player.name}
                          </Link>
                          <span className="text-xs text-muted-foreground ml-2">
                            @{post.player.username}
                          </span>
                          {post.player.organization && (
                            <span className="text-xs text-muted-foreground ml-2">
                              • {post.player.organization.name}
                            </span>
                          )}
                        </div>
                        <Badge variant="destructive" className="ml-auto">
                          Flagged
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{post.content}</p>
                      {post.flaggedReason && (
                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded text-xs">
                          <p className="font-medium text-red-900 dark:text-red-100">
                            Flag Reason:
                          </p>
                          <p className="text-red-700 dark:text-red-300">
                            {post.flaggedReason}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {post.mediaUrl && (
                          <Badge variant="outline" className="text-xs">
                            {post.mediaType}
                          </Badge>
                        )}
                        <span>
                          {post.likes} likes • {post.comments} comments
                        </span>
                        <span>
                          {format(new Date(post.createdAt), "PPp")}
                        </span>
                      </div>
                    </div>
                    <PostModerationActions
                      postId={post.id}
                      isFlagged={post.isFlagged || false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>
            Player posts and content for moderation ({allPosts.total} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allPosts.posts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts found</p>
            ) : (
              allPosts.posts.map((post) => (
                <div
                  key={post.id}
                  className={`rounded-lg border p-4 ${
                    post.isFlagged
                      ? "border-red-200 bg-red-50/50 dark:bg-red-950/20"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={post.player.avatar || undefined}
                            alt={post.player.name}
                          />
                          <AvatarFallback>
                            {post.player.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/super-admin/players/${post.playerId}`}
                            className="font-medium text-sm hover:underline text-blue-600"
                          >
                            {post.player.name}
                          </Link>
                          <span className="text-xs text-muted-foreground ml-2">
                            @{post.player.username}
                          </span>
                          {post.player.organization && (
                            <span className="text-xs text-muted-foreground ml-2">
                              • {post.player.organization.name}
                            </span>
                          )}
                        </div>
                        {post.isFlagged && (
                          <Badge variant="destructive" className="ml-auto">
                            Flagged
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mb-2">{post.content}</p>
                      {post.flaggedReason && (
                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded text-xs">
                          <p className="font-medium text-red-900 dark:text-red-100">
                            Flag Reason:
                          </p>
                          <p className="text-red-700 dark:text-red-300">
                            {post.flaggedReason}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {post.mediaUrl && (
                          <Badge variant="outline" className="text-xs">
                            {post.mediaType}
                          </Badge>
                        )}
                        <span>
                          {post.likes} likes • {post.comments} comments
                        </span>
                        <span>
                          {format(new Date(post.createdAt), "PPp")}
                        </span>
                      </div>
                    </div>
                    <PostModerationActions
                      postId={post.id}
                      isFlagged={post.isFlagged || false}
                    />
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

