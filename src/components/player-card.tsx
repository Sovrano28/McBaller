import Image from 'next/image';
import Link from 'next/link';
import type { Player } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';

type PlayerCardProps = {
  player: Player;
};

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Card className="group overflow-hidden">
      <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarImage src={player.avatar} alt={player.name} data-ai-hint="person portrait" />
          <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-headline text-xl font-semibold">{player.name}</h3>
          <p className="text-sm text-muted-foreground">{player.team}</p>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 p-4 pt-0 text-center">
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-sm text-muted-foreground">PPG</p>
          <p className="font-semibold">{player.stats.points}</p>
        </div>
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-sm text-muted-foreground">RPG</p>
          <p className="font-semibold">{player.stats.rebounds}</p>
        </div>
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-sm text-muted-foreground">APG</p>
          <p className="font-semibold">{player.stats.assists}</p>
        </div>
      </CardContent>
      <CardFooter className="p-0">
        <Link href={`/profile/${player.username}`} className="w-full">
          <Button
            variant="ghost"
            className="w-full justify-center rounded-none rounded-b-lg border-t"
          >
            View Profile <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
