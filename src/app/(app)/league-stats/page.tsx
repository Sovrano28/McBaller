'use client';

import { useState } from 'react';
import { players } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Trophy, Upload, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { npflClubs } from '@/lib/mock-data';

export default function LeagueStatsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('2024');
  const [selectedClub, setSelectedClub] = useState('All Clubs');
  const [selectedPosition, setSelectedPosition] = useState('All Positions');

  // Filter players who have league stats
  const playersWithStats = players.filter(p => p.leagueStats && p.leagueStats.length > 0);

  // Get all stats for selected season
  const statsData = playersWithStats.map(player => {
    const seasonStats = player.leagueStats.find(stat => stat.season === selectedSeason);
    return {
      player,
      stats: seasonStats,
    };
  }).filter(item => item.stats);

  // Apply filters
  const filteredStats = statsData.filter(item => {
    const matchesSearch = item.player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClub = selectedClub === 'All Clubs' || item.stats?.club === selectedClub;
    const matchesPosition = selectedPosition === 'All Positions' || item.player.position === selectedPosition;
    return matchesSearch && matchesClub && matchesPosition;
  });

  // Sort by goals (descending)
  const sortedStats = [...filteredStats].sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0));

  // Top scorers (top 5)
  const topScorers = [...sortedStats].slice(0, 5);

  // Top assists (top 5)
  const topAssists = [...sortedStats].sort((a, b) => (b.stats?.assists || 0) - (a.stats?.assists || 0)).slice(0, 5);

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="mb-3 font-headline text-4xl font-bold">Nigerian League Statistics</h1>
        <p className="text-lg text-muted-foreground">
          Browse and track performance statistics from home-based Nigerian players
        </p>
      </div>

      {/* Stats Overview Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Trophy className="h-4 w-4 text-[#FFB81C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playersWithStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Tracked in {selectedSeason} season
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#008751]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedStats.reduce((sum, item) => sum + (item.stats?.goals || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Scored this season
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assists</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#0066CC]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedStats.reduce((sum, item) => sum + (item.stats?.assists || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Provided this season
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboards */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Top Scorers</CardTitle>
            <CardDescription>Leading goal scorers in {selectedSeason}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topScorers.map((item, index) => (
                <div key={item.player.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFB81C]/20 font-bold text-[#FFB81C]">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.player.avatar} alt={item.player.name} />
                    <AvatarFallback>{item.player.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{item.player.name}</p>
                    <p className="text-sm text-muted-foreground">{item.stats?.club}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{item.stats?.goals}</p>
                    <p className="text-xs text-muted-foreground">goals</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Top Assists</CardTitle>
            <CardDescription>Leading assist providers in {selectedSeason}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topAssists.map((item, index) => (
                <div key={item.player.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0066CC]/20 font-bold text-[#0066CC]">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.player.avatar} alt={item.player.name} />
                    <AvatarFallback>{item.player.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{item.player.name}</p>
                    <p className="text-sm text-muted-foreground">{item.stats?.club}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{item.stats?.assists}</p>
                    <p className="text-xs text-muted-foreground">assists</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger>
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024 Season</SelectItem>
                <SelectItem value="2023">2023 Season</SelectItem>
                <SelectItem value="2022">2022 Season</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger>
                <SelectValue placeholder="Club" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Clubs">All Clubs</SelectItem>
                {npflClubs.map(club => (
                  <SelectItem key={club} value={club}>{club}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Positions">All Positions</SelectItem>
                <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                <SelectItem value="Defender">Defender</SelectItem>
                <SelectItem value="Midfielder">Midfielder</SelectItem>
                <SelectItem value="Forward">Forward</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Player Statistics</CardTitle>
              <CardDescription>Complete stats for {selectedSeason} NPFL season</CardDescription>
            </div>
            <Link href="/stats/upload">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Your Stats
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-center">Apps</TableHead>
                  <TableHead className="text-center">Goals</TableHead>
                  <TableHead className="text-center">Assists</TableHead>
                  <TableHead className="text-center">Yellow</TableHead>
                  <TableHead className="text-center">Red</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      No players found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedStats.map((item) => (
                    <TableRow key={item.player.id}>
                      <TableCell>
                        <Link href={`/profile/${item.player.username}`}>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={item.player.avatar} alt={item.player.name} />
                              <AvatarFallback>{item.player.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium hover:underline">{item.player.name}</span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>{item.stats?.club}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.player.position}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{item.stats?.appearances}</TableCell>
                      <TableCell className="text-center font-bold">{item.stats?.goals}</TableCell>
                      <TableCell className="text-center font-bold">{item.stats?.assists}</TableCell>
                      <TableCell className="text-center">{item.stats?.yellowCards}</TableCell>
                      <TableCell className="text-center">{item.stats?.redCards}</TableCell>
                      <TableCell className="text-center">
                        {item.stats?.verified ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Self-reported</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

