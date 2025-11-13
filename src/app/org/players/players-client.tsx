"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { Users, Plus } from "lucide-react";

interface Player {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar?: string | null;
  position: string;
  subscriptionTier?: string;
  team?: {
    id: string;
    name: string;
  } | null;
  leagueStats: any[];
  contracts: any[];
  user?: {
    isActive?: boolean;
  };
}

interface PlayersClientProps {
  players: Player[];
  teams: Array<{ id: string; name: string }>;
}

export function PlayersClient({ players, teams }: PlayersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedContractStatus, setSelectedContractStatus] = useState<string>("all");

  const positions = Array.from(new Set(players.map((p) => p.position).filter(Boolean)));

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

      // Team filter
      const matchesTeam =
        selectedTeam === "all" ||
        (selectedTeam === "no-team" && !player.team) ||
        player.team?.id === selectedTeam;

      // Position filter
      const matchesPosition =
        selectedPosition === "all" || player.position === selectedPosition;

      // Subscription tier filter
      const matchesTier =
        selectedTier === "all" ||
        (selectedTier === "free" && (!player.subscriptionTier || player.subscriptionTier === "free")) ||
        player.subscriptionTier === selectedTier;

      // Contract status filter
      const hasActiveContract = player.contracts.some((c) => c.status === "active");
      const matchesContractStatus =
        selectedContractStatus === "all" ||
        (selectedContractStatus === "active" && hasActiveContract) ||
        (selectedContractStatus === "none" && !hasActiveContract);

      return (
        matchesSearch &&
        matchesTeam &&
        matchesPosition &&
        matchesTier &&
        matchesContractStatus
      );
    });
  }, [
    players,
    searchQuery,
    selectedTeam,
    selectedPosition,
    selectedTier,
    selectedContractStatus,
  ]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedTeam !== "all" ||
    selectedPosition !== "all" ||
    selectedTier !== "all" ||
    selectedContractStatus !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTeam("all");
    setSelectedPosition("all");
    setSelectedTier("all");
    setSelectedContractStatus("all");
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search players by name, username, or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              <SelectItem value="no-team">No Team</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPosition} onValueChange={setSelectedPosition}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map((position) => (
                <SelectItem key={position} value={position}>
                  {position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="elite">Elite</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedContractStatus}
            onValueChange={setSelectedContractStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by contract" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contracts</SelectItem>
              <SelectItem value="active">Active Contract</SelectItem>
              <SelectItem value="none">No Contract</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredPlayers.length} of {players.length} players
          </div>
        )}
      </div>

      {/* Players Grid */}
      {filteredPlayers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlayers.map((player) => {
            const latestStats = player.leagueStats[0];
            const activeContract = player.contracts.find(
              (c) => c.status === "active"
            );

            return (
              <Card
                key={player.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={player.avatar || undefined} />
                      <AvatarFallback>
                        {player.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        <Link
                          href={`/org/players/${player.id}`}
                          className="hover:underline"
                        >
                          {player.name}
                        </Link>
                      </CardTitle>
                      <CardDescription>@{player.username}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Position</span>
                      <Badge variant="secondary">{player.position}</Badge>
                    </div>

                    {player.team && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Team</span>
                        <Badge variant="outline">{player.team.name}</Badge>
                      </div>
                    )}

                    {latestStats && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Season</span>
                        <span className="font-medium">
                          {latestStats.season} ({latestStats.club})
                        </span>
                      </div>
                    )}

                    {activeContract && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Contract</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <Link href={`/org/players/${player.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters ? "No players match your filters" : "No players yet"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters to see more results"
                : "Start by adding players to your organization"}
            </p>
            {!hasActiveFilters && (
              <Button asChild>
                <Link href="/org/players/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Player
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

