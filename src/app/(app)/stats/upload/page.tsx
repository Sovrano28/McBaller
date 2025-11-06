'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Trophy, Upload, TrendingUp, Target } from 'lucide-react';
import { npflClubs } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StatsUploadPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    const stats = {
      matchDate: formData.get('match-date'),
      opposition: formData.get('opposition'),
      competition: formData.get('competition'),
      minutesPlayed: formData.get('minutes-played'),
      goals: formData.get('goals'),
      assists: formData.get('assists'),
      yellowCards: formData.get('yellow-cards'),
      redCards: formData.get('red-cards'),
      matchRating: formData.get('match-rating'),
    };

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Stats Uploaded Successfully!',
        description: 'Your match statistics have been recorded.',
      });
      setIsSubmitting(false);
      // Reset form
      (event.target as HTMLFormElement).reset();
    }, 1000);
  };

  if (!user) {
    return (
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to upload your stats</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Calculate season totals (mock data from user's leagueStats)
  const currentSeasonStats = (user as any).leagueStats?.find((stat: any) => stat.season === '2024');
  const totalGoals = currentSeasonStats?.goals || 0;
  const totalAssists = currentSeasonStats?.assists || 0;
  const totalAppearances = currentSeasonStats?.appearances || 0;

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="mb-3 font-headline text-4xl font-bold">Upload Match Statistics</h1>
        <p className="text-lg text-muted-foreground">
          Track your performance and build your football resume
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stats Summary Cards */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Season Summary 2024</CardTitle>
              <CardDescription>Your performance this season</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#FFB81C]" />
                  <span className="text-sm">Appearances</span>
                </div>
                <span className="text-2xl font-bold">{totalAppearances}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#008751]" />
                  <span className="text-sm">Goals</span>
                </div>
                <span className="text-2xl font-bold">{totalGoals}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#0066CC]" />
                  <span className="text-sm">Assists</span>
                </div>
                <span className="text-2xl font-bold">{totalAssists}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-sm">Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={currentSeasonStats?.verified ? 'default' : 'secondary'}>
                {currentSeasonStats?.verified ? 'Club Verified' : 'Self-Reported'}
              </Badge>
              <p className="mt-3 text-xs text-muted-foreground">
                {currentSeasonStats?.verified 
                  ? 'Your stats have been verified by your club'
                  : 'Upload photo/video evidence to get your stats verified'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Record Match Statistics</CardTitle>
              <CardDescription>
                Enter your performance data from your latest match
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="match-stats" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="match-stats">Match Stats</TabsTrigger>
                  <TabsTrigger value="evidence">Evidence (Optional)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="match-stats">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Match Details */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="match-date">Match Date *</Label>
                        <Input
                          id="match-date"
                          name="match-date"
                          type="date"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="opposition">Opposition *</Label>
                        <Select name="opposition" required>
                          <SelectTrigger id="opposition">
                            <SelectValue placeholder="Select opponent" />
                          </SelectTrigger>
                          <SelectContent>
                            {npflClubs.filter(club => club !== user.currentClub).map(club => (
                              <SelectItem key={club} value={club}>{club}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="competition">Competition *</Label>
                        <Select name="competition" required>
                          <SelectTrigger id="competition">
                            <SelectValue placeholder="Select competition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NPFL">NPFL League</SelectItem>
                            <SelectItem value="AITEO Cup">AITEO Cup</SelectItem>
                            <SelectItem value="CAF Champions League">CAF Champions League</SelectItem>
                            <SelectItem value="CAF Confederation Cup">CAF Confederation Cup</SelectItem>
                            <SelectItem value="Friendly">Friendly Match</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minutes-played">Minutes Played *</Label>
                        <Input
                          id="minutes-played"
                          name="minutes-played"
                          type="number"
                          min="0"
                          max="120"
                          placeholder="90"
                          required
                        />
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="goals">Goals</Label>
                        <Input
                          id="goals"
                          name="goals"
                          type="number"
                          min="0"
                          defaultValue="0"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="assists">Assists</Label>
                        <Input
                          id="assists"
                          name="assists"
                          type="number"
                          min="0"
                          defaultValue="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="yellow-cards">Yellow Cards</Label>
                        <Input
                          id="yellow-cards"
                          name="yellow-cards"
                          type="number"
                          min="0"
                          max="2"
                          defaultValue="0"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="red-cards">Red Cards</Label>
                        <Input
                          id="red-cards"
                          name="red-cards"
                          type="number"
                          min="0"
                          max="1"
                          defaultValue="0"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="match-rating">Match Rating (1-10)</Label>
                        <Input
                          id="match-rating"
                          name="match-rating"
                          type="number"
                          min="1"
                          max="10"
                          placeholder="7"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      <Upload className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Uploading...' : 'Submit Match Stats'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="evidence">
                  <div className="space-y-4 py-4">
                    <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                      <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="mb-2 text-sm font-medium">Upload Photo or Video Evidence</p>
                      <p className="mb-4 text-xs text-muted-foreground">
                        Match photos, highlight videos, or screenshots to verify your stats
                      </p>
                      <Button variant="outline">Choose Files</Button>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Max file size: 50MB. Supported: JPG, PNG, MP4
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> Uploading evidence increases the credibility of your stats 
                      and may lead to club verification. This feature is available for Pro and Elite members.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="font-headline text-sm">Tips for Accurate Stats</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-inside list-disc space-y-1">
                <li>Record stats immediately after the match for accuracy</li>
                <li>Include all competitive matches (league, cup, continental)</li>
                <li>Upload photo/video evidence to get club verification</li>
                <li>Be honest - scouts value integrity over inflated numbers</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

