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
import { createContract } from "@/lib/actions/contracts";

interface CreateContractFormProps {
  players: any[];
  teams: any[];
  organizationId: string;
}

export default function CreateContractForm({
  players,
  teams,
  organizationId,
}: CreateContractFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    playerId: "",
    teamId: "none",
    startDate: "",
    endDate: "",
    salary: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createContract(organizationId, {
        playerId: formData.playerId,
        teamId: formData.teamId && formData.teamId !== "none" ? formData.teamId : undefined,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
      });

      if (result.success && result.contract) {
        toast({
          title: "Contract Created",
          description: "Contract has been created successfully",
        });
        router.push(`/org/contracts/${result.contract.id}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create contract",
        });
      }
    } catch (error) {
      console.error("Create contract error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter players without active contracts for default selection
  const availablePlayers = players.filter(player => {
    const hasActiveContract = player.contracts?.some(
      (c: any) => c.status === "active"
    );
    return !hasActiveContract;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/org/contracts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Contract</h1>
          <p className="text-muted-foreground">Create a new player contract</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Details</CardTitle>
          <CardDescription>
            Enter the contract information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="playerId">Player *</Label>
                <Select
                  value={formData.playerId}
                  onValueChange={value =>
                    setFormData({ ...formData, playerId: value })
                  }
                  required
                >
                  <SelectTrigger id="playerId">
                    <SelectValue placeholder="Select a player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} - {player.position}
                        {player.contracts?.some(
                          (c: any) => c.status === "active"
                        ) && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Has Active Contract)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="teamId">Team</Label>
                <Select
                  value={formData.teamId}
                  onValueChange={value =>
                    setFormData({ ...formData, teamId: value })
                  }
                >
                  <SelectTrigger id="teamId">
                    <SelectValue placeholder="Select a team (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Team</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Optional: Assign to a specific team
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={e =>
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
                  onChange={e =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  min={formData.startDate || undefined}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Leave empty for open-ended contract
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="salary">Salary (₦)</Label>
              <Input
                id="salary"
                type="number"
                placeholder="0.00"
                value={formData.salary}
                onChange={e =>
                  setFormData({ ...formData, salary: e.target.value })
                }
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Monthly or annual salary amount
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Contract"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/org/contracts">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
