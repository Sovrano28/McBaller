'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { Calendar, MapPin, Footprints, Shield, Crown, Activity, Trophy, Sparkles } from 'lucide-react';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user: loggedInUser } = useAuth();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayer() {
      try {
        const response = await fetch(`/api/players/${params.username}`);
        if (response.ok) {
          const data = await response.json();
          setPlayer(data);
        } else {
          // Try mock data fallback
          const { players: mockPlayers } = await import('@/lib/mock-data');
          const storedUsers: any[] = JSON.parse(localStorage.getItem('mcsportng-users') || '[]');
          const all = [...mockPlayers, ...storedUsers];
          const found = all.find(p => p.username === params.username);
          if (found) {
            setPlayer(found);
          }
        }
      } catch (error) {
        console.error('Failed to fetch player:', error);
        // Try mock data fallback
        const { players: mockPlayers } = await import('@/lib/mock-data');
        const storedUsers: any[] = JSON.parse(localStorage.getItem('mcsportng-users') || '[]');
        const all = [...mockPlayers, ...storedUsers];
        const found = all.find(p => p.username === params.username);
        if (found) {
          setPlayer(found);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchPlayer();
  }, [params.username]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <div className="text-muted-foreground">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!player) return notFound();

  const isOwnProfile = loggedInUser?.username === player.username;
  const currentSeason = player.leagueStats?.[0]?.season || '2024';
  const seasonTotals = player.leagueStats?.find(s => s.season === currentSeason);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full md:h-64">
          <Image
            src="https://picsum.photos/seed/profilehero/1200/400"
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
            <div className="flex items-center gap-3">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">{player.name}</h1>
              <Badge variant="secondary">@{player.username}</Badge>
              {player.subscriptionTier !== 'free' && (
                <Badge className="gap-1">
                  {player.subscriptionTier.toUpperCase()}
                  {player.subscriptionTier === 'elite' && <Crown className="ml-1 h-3 w-3" />}
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Shield className="h-4 w-4" /> {player.position}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {player.currentClub}</span>
              <span className="inline-flex items-center gap-1"><Footprints className="h-4 w-4" /> {player.preferredFoot || 'Right'} foot</span>
              <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {new Date(player.joinedAt).getFullYear()}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2 md:ml-auto">
            {isOwnProfile ? (
              <Button asChild variant="outline">
                <Link href="/stats/upload">Update My Stats</Link>
              </Button>
            ) : (
              <>
                <Button>Follow</Button>
                <Button variant="outline">Share</Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Overview Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="career">Career</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Quick Stats ({currentSeason})</CardTitle>
                <CardDescription>Season snapshot</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-headline text-2xl font-bold text-[#008751]">{seasonTotals?.goals ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Goals</div>
                </div>
                <div>
                  <div className="font-headline text-2xl font-bold text-[#0066CC]">{seasonTotals?.assists ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Assists</div>
                </div>
                <div>
                  <div className="font-headline text-2xl font-bold text-[#FFB81C]">{seasonTotals?.appearances ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Apps</div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Badges</CardTitle>
                <CardDescription>Milestones and achievements</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {(player.badges?.length ? player.badges : ['complete_profile']).map((b) => (
                  <Badge key={b} variant="outline" className="gap-1">
                    <Sparkles className="h-3 w-3" /> {b.replaceAll('_', ' ')}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            {/* Subscription */}
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Subscription</CardTitle>
                <CardDescription>Your current plan</CardDescription>
            </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="gap-1">
                    {player.subscriptionTier.toUpperCase()}
                    {player.subscriptionTier === 'elite' && <Crown className="ml-1 h-3 w-3" />}
                  </Badge>
                  {player.subscriptionExpiry && (
                    <span className="text-xs text-muted-foreground">Expires {new Date(player.subscriptionExpiry).toLocaleDateString()}</span>
                  )}
                  </div>
                {player.subscriptionTier === 'free' && (
                  <Button asChild className="w-full">
                    <Link href="/pricing">Upgrade to Pro</Link>
                  </Button>
                )}
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        {/* Stats */}
        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">League Statistics</CardTitle>
              <CardDescription>Verified and self-reported</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Season</TableHead>
                    <TableHead>Club</TableHead>
                      <TableHead className="text-center">Apps</TableHead>
                      <TableHead className="text-center">Goals</TableHead>
                      <TableHead className="text-center">Assists</TableHead>
                      <TableHead className="text-center">Yellow</TableHead>
                      <TableHead className="text-center">Red</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {(player.leagueStats || []).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.season}</TableCell>
                        <TableCell>{row.club}</TableCell>
                        <TableCell className="text-center">{row.appearances}</TableCell>
                        <TableCell className="text-center font-semibold">{row.goals}</TableCell>
                        <TableCell className="text-center font-semibold">{row.assists}</TableCell>
                        <TableCell className="text-center">{row.yellowCards}</TableCell>
                        <TableCell className="text-center">{row.redCards}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={row.verified ? 'default' : 'secondary'}>
                            {row.verified ? 'Verified' : 'Self-reported'}
                          </Badge>
                        </TableCell>
                  </TableRow>
                    ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career */}
        <TabsContent value="career" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Career Overview</CardTitle>
              <CardDescription>Clubs and milestones</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Current Club</p>
                <p className="text-lg font-semibold">{player.currentClub}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Preferred Foot</p>
                <p className="text-lg font-semibold">{player.preferredFoot || 'Right'}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">State</p>
                <p className="text-lg font-semibold">{player.state}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Height / Weight</p>
                <p className="text-lg font-semibold">{player.height || '-'} cm • {player.weight || '-'} kg</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">About</CardTitle>
              <CardDescription>Bio and story</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{player.bio}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
