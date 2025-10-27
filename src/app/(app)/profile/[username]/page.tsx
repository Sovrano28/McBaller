'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { players } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user: loggedInUser } = useAuth();
  const player = players.find((p) => p.username === params.username);

  if (!player) {
    notFound();
  }

  const isOwnProfile = loggedInUser?.username === player.username;


  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full md:h-64">
          <Image
            src="https://picsum.photos/seed/phero/1200/400"
            alt={`${player.name} in action`}
            fill
            className="object-cover"
            data-ai-hint="soccer action"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
        <div className="relative -mt-16 flex flex-col items-center p-6 text-center md:-mt-20 md:flex-row md:items-end md:text-left">
          <Avatar className="h-32 w-32 border-4 border-background md:h-40 md:w-40">
            <AvatarImage src={player.avatar} alt={player.name} data-ai-hint="person portrait" />
            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="mt-4 md:ml-6">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">{player.name}</h1>
            <p className="text-muted-foreground">@{player.username}</p>
          </div>
          <div className="mt-4 flex gap-2 md:ml-auto">
            {!isOwnProfile && (
               <>
                <Button asChild>
                  <Link href={loggedInUser ? '#' : '/signup'}>
                    <UserPlus className="mr-2 h-4 w-4" /> Follow
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href={loggedInUser ? '#' : '/signup'}>
                    <Star className="mr-2 h-4 w-4" /> Sponsor
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="font-headline">Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{player.bio}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Position:</strong> {player.position}</p>
                <p><strong>Club:</strong> {player.team}</p>
                <p><strong>Height:</strong> {player.height} cm</p>
                <p><strong>Weight:</strong> {player.weight} kg</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="media" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Media Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={`https://picsum.photos/seed/gallery${i}/300/300`}
                      alt={`Gallery image ${i + 1}`}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                      data-ai-hint="soccer player"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Career Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Season</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead className="text-right">Goals</TableHead>
                    <TableHead className="text-right">Assists</TableHead>
                    <TableHead className="text-right">Tackles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2023-2024</TableCell>
                    <TableCell>{player.team}</TableCell>
                    <TableCell className="text-right">{player.stats.goals}</TableCell>
                    <TableCell className="text-right">{player.stats.assists}</TableCell>
                    <TableCell className="text-right">{player.stats.tackles}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2022-2023</TableCell>
                    <TableCell>Youth Academy</TableCell>
                    <TableCell className="text-right">22</TableCell>
                    <TableCell className="text-right">15</TableCell>
                    <TableCell className="text-right">41</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
