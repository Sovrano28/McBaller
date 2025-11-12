"use client";

import { useEffect, useState } from "react";
import { getAllPlayers } from "@/lib/actions/super-admin/players";
import { StatsCard } from "@/components/super-admin/stats-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, UserRound, Shield, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function PlayersClient() {
  const [players, setPlayers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [search, tierFilter, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    
    const result = await getAllPlayers({
      search: search || undefined,
      subscriptionTier: tierFilter !== "all" ? tierFilter : undefined,
      isActive: statusFilter !== "all" ? (statusFilter === "active") : undefined,
      limit: 100,
    });

    if (result) {
      setPlayers(result.players || []);
      setTotal(result.total || 0);
    }
    setLoading(false);
  };

  const tierColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-800",
    pro: "bg-blue-100 text-blue-800",
    elite: "bg-purple-100 text-purple-800",
  };

  const tierIcons: Record<string, any> = {
    free: UserRound,
    pro: Shield,
    elite: Crown,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Players"
          value={total}
          icon={UserRound}
        />
        <StatsCard
          title="Free Tier"
          value={players.filter(p => p.subscriptionTier === "free").length}
          icon={UserRound}
        />
        <StatsCard
          title="Pro Tier"
          value={players.filter(p => p.subscriptionTier === "pro").length}
          icon={Shield}
        />
        <StatsCard
          title="Elite Tier"
          value={players.filter(p => p.subscriptionTier === "elite").length}
          icon={Crown}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Players</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, username, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Subscription Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="elite">Elite</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadData} variant="outline">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Players ({players.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : players.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No players found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={player.profilePicture} />
                            <AvatarFallback>
                              {player.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-xs text-muted-foreground">
                              @{player.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {player.organization ? (
                          <Link
                            href={`/super-admin/organizations/${player.organizationId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {player.organization.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">Independent</span>
                        )}
                      </TableCell>
                      <TableCell>{player.position || "-"}</TableCell>
                      <TableCell>
                        <Badge className={tierColors[player.subscriptionTier] || tierColors.free}>
                          {player.subscriptionTier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={player.isActive ? "default" : "secondary"}>
                          {player.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {player.createdAt
                          ? format(new Date(player.createdAt), "MMM dd, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/super-admin/players/${player.id}`}
                            className="flex items-center gap-2"
                          >
                            <span>View details</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

