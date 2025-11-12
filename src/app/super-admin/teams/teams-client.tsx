"use client";

import { useEffect, useState } from "react";
import { getAllTeams, getTeamStats } from "@/lib/actions/super-admin/teams";
import { StatsCard } from "@/components/super-admin/stats-card";
import { StatusBadge } from "@/components/super-admin/status-badge";
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
import { Search, UsersRound, Users, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TeamsClient() {
  const [teams, setTeams] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [search, statusFilter, orgFilter]);

  const loadData = async () => {
    setLoading(true);
    
    const [teamsResult, statsResult] = await Promise.all([
      getAllTeams({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        organizationId: orgFilter !== "all" ? orgFilter : undefined,
      }),
      getTeamStats(),
    ]);

    if (teamsResult.success) {
      setTeams(teamsResult.data || []);
    }
    if (statsResult.success) {
      setStats(statsResult.data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Teams"
            value={stats.total}
            icon={UsersRound}
          />
          <StatsCard
            title="Active Teams"
            value={stats.active}
            icon={Activity}
            trend="up"
          />
          <StatsCard
            title="Inactive Teams"
            value={stats.inactive}
            icon={UsersRound}
          />
          <StatsCard
            title="Teams with Players"
            value={stats.withPlayers}
            icon={Users}
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by team name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
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

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Teams ({teams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No teams found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Coaches</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={team.logo} />
                            <AvatarFallback>
                              {team.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{team.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/super-admin/organizations/${team.organization?.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {team.organization?.name}
                        </Link>
                      </TableCell>
                      <TableCell>{team._count?.players || 0}</TableCell>
                      <TableCell>{team._count?.coaches || 0}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={team.isActive ? "active" : "inactive"}
                        />
                      </TableCell>
                      <TableCell>
                        {team.createdAt
                          ? new Date(team.createdAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/super-admin/teams/${team.id}`}
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

