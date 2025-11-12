"use client";

import { useEffect, useState } from "react";
import { getAllAgents, getAgentStats } from "@/lib/actions/super-admin/agents";
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
import { Search, UserCog, Users, BarChart3, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AgentsClient() {
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [search, roleFilter]);

  const loadData = async () => {
    setLoading(true);
    
    const [agentsResult, statsResult] = await Promise.all([
      getAllAgents({
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      }),
      getAgentStats(),
    ]);

    if (agentsResult.success) {
      setAgents(agentsResult.data || []);
    }
    if (statsResult.success) {
      setStats(statsResult.data);
    }
    setLoading(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "coach":
        return UserCog;
      case "analyst":
        return BarChart3;
      case "finance":
        return DollarSign;
      default:
        return Users;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Agents"
            value={stats.total}
            icon={UserCog}
          />
          <StatsCard
            title="Coaches"
            value={stats.coaches}
            icon={UserCog}
          />
          <StatsCard
            title="Analysts"
            value={stats.analysts}
            icon={BarChart3}
          />
          <StatsCard
            title="Finance Staff"
            value={stats.finance}
            icon={DollarSign}
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="coach">Coaches</SelectItem>
                <SelectItem value="analyst">Analysts</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadData} variant="outline">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Agents ({agents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No agents found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {agent.email.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{agent.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/super-admin/organizations/${agent.organization?.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {agent.organization?.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = getRoleIcon(agent.role);
                            return <Icon className="h-4 w-4" />;
                          })()}
                          <span className="capitalize">{agent.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agent.coachProfile?.team?.name || "-"}
                      </TableCell>
                      <TableCell>
                        {agent.coachProfile?._count?.players || 0}
                      </TableCell>
                      <TableCell>
                        {agent.createdAt
                          ? new Date(agent.createdAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/super-admin/agents/${agent.id}`}
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

