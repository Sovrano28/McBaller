import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Link href={`/profile/${post.player.username}`}>
          <Avatar>
            <AvatarImage src={post.player.avatar} alt={post.player.name} data-ai-hint="person portrait" />
            <AvatarFallback>{post.player.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="grid gap-0.5">
          <Link href={`/profile/${post.player.username}`} className="font-semibold hover:underline">
            {post.player.name}
          </Link>
          <p className="text-sm text-muted-foreground">{post.createdAt}</p>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto">
          <MoreHorizontal className="h-5 w-5" />
          <span className="sr-only">More options</span>
        </Button>
      </CardHeader>
      <CardContent>
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
        {post.media && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={post.media.url}
              alt="Post media"
              fill
              className="object-cover"
              data-ai-hint={post.media.hint}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-3">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          <span>{post.likes}</span>
          <span className="sr-only">Likes</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span>{post.comments}</span>
          <span className="sr-only">Comments</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
