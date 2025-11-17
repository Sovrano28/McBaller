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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { createTournament } from "@/lib/actions/tournaments";

interface CreateTournamentFormProps {
  organizationId: string;
  seasons: any[];
}

export default function CreateTournamentForm({
  organizationId,
  seasons,
}: CreateTournamentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "knockout",
    startDate: "",
    endDate: "",
    seasonId: "none",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createTournament(organizationId, {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type as any,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        seasonId:
          formData.seasonId && formData.seasonId !== "none"
            ? formData.seasonId
            : undefined,
      });

      if (result.success && result.tournament) {
        toast({
          title: "Tournament Created",
          description: "Tournament has been created successfully",
        });
        router.push(`/org/tournaments/${result.tournament.id}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create tournament",
        });
      }
    } catch (error) {
      console.error("Create tournament error:", error);
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
          <Link href="/org/tournaments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Tournament</h1>
          <p className="text-muted-foreground">
            Create a new tournament for your organization
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tournament Details</CardTitle>
          <CardDescription>
            Enter the tournament information below. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Tournament Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Summer Championship 2024"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Tournament Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                  required
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="knockout">Knockout</SelectItem>
                    <SelectItem value="round_robin">Round Robin</SelectItem>
                    <SelectItem value="group_stage">Group Stage</SelectItem>
                    <SelectItem value="bracket">Bracket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tournament description, rules, or notes..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  min={formData.startDate || undefined}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Leave empty for open-ended tournament
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="seasonId">Season</Label>
              <Select
                value={formData.seasonId}
                onValueChange={(value) =>
                  setFormData({ ...formData, seasonId: value })
                }
              >
                <SelectTrigger id="seasonId">
                  <SelectValue placeholder="Select season (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Season</SelectItem>
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.name}
                      {season.isActive && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (Active)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Tournament"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/org/tournaments">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

