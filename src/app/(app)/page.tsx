import { PostCard } from '@/components/post-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { posts } from '@/lib/mock-data';
import { Image as ImageIcon } from 'lucide-react';

export default function FeedPage() {
  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4">
            <textarea
              placeholder="What's on your mind, champ?"
              className="w-full resize-none rounded-md border bg-transparent p-2 text-sm placeholder:text-muted-foreground focus:outline-none"
              rows={2}
            />
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ImageIcon className="mr-2 h-4 w-4" />
                Add Media
              </Button>
              <Button>Post</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
