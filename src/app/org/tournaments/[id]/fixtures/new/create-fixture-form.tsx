"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { createTournamentFixture } from "@/lib/actions/tournaments";

interface CreateFixtureFormProps {
  tournament: any;
  teams: any[];
  venues: any[];
  organizationId: string;
}

export default function CreateFixtureForm({
  tournament,
  teams,
  venues,
  organizationId,
}: CreateFixtureFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    homeTeamId: "none",
    awayTeamId: "none",
    homeTeamName: "",
    awayTeamName: "",
    scheduledAt: "",
    venueId: "none",
    round: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createTournamentFixture(organizationId, {
        tournamentId: tournament.id,
        homeTeamId:
          formData.homeTeamId && formData.homeTeamId !== "none"
            ? formData.homeTeamId
            : undefined,
        awayTeamId:
          formData.awayTeamId && formData.awayTeamId !== "none"
            ? formData.awayTeamId
            : undefined,
        homeTeamName: formData.homeTeamName || undefined,
        awayTeamName: formData.awayTeamName || undefined,
        scheduledAt: new Date(formData.scheduledAt),
        venueId:
          formData.venueId && formData.venueId !== "none"
            ? formData.venueId
            : undefined,
        round: formData.round || undefined,
      });

      if (result.success && result.fixture) {
        toast({
          title: "Fixture Created",
          description: "Fixture has been created successfully. A corresponding event has been added to the calendar.",
        });
        router.push(`/org/tournaments/${tournament.id}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create fixture",
        });
      }
    } catch (error) {
      console.error("Create fixture error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/org/tournaments/${tournament.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Fixture</h1>
          <p className="text-muted-foreground">
            Add a new match to {tournament.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fixture Details</CardTitle>
          <CardDescription>
            Enter the match information below. Either select teams or enter team names manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="homeTeamId">Home Team</Label>
                <Select
                  value={formData.homeTeamId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, homeTeamId: value, homeTeamName: "" })
                  }
                >
                  <SelectTrigger id="homeTeamId">
                    <SelectValue placeholder="Select home team (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Team Selected</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.homeTeamId === "none" && (
                  <Input
                    placeholder="Or enter home team name"
                    value={formData.homeTeamName}
                    onChange={(e) =>
                      setFormData({ ...formData, homeTeamName: e.target.value })
                    }
                  />
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="awayTeamId">Away Team</Label>
                <Select
                  value={formData.awayTeamId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, awayTeamId: value, awayTeamName: "" })
                  }
                >
                  <SelectTrigger id="awayTeamId">
                    <SelectValue placeholder="Select away team (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Team Selected</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.awayTeamId === "none" && (
                  <Input
                    placeholder="Or enter away team name"
                    value={formData.awayTeamName}
                    onChange={(e) =>
                      setFormData({ ...formData, awayTeamName: e.target.value })
                    }
                  />
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="scheduledAt">Scheduled Date & Time *</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledAt: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="venueId">Venue</Label>
                <Select
                  value={formData.venueId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, venueId: value })
                  }
                >
                  <SelectTrigger id="venueId">
                    <SelectValue placeholder="Select venue (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Venue</SelectItem>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name} - {venue.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="round">Round/Stage</Label>
              <Input
                id="round"
                placeholder="e.g., Group A, Quarterfinal, Semifinal, Final"
                value={formData.round}
                onChange={(e) =>
                  setFormData({ ...formData, round: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Optional: Specify the round or stage of the tournament
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Fixture"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/org/tournaments/${tournament.id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

