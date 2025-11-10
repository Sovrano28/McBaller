"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/actions/super-admin/users";
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
import { Search, Users, UserCog, UserRound, Building2, Eye } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function UsersClient() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [search, roleFilter]);

  const loadData = async () => {
    setLoading(true);
    
    const result = await getAllUsers({
      search: search || undefined,
      role: roleFilter !== "all" ? roleFilter : undefined,
      limit: 100,
    });

    if (result) {
      setUsers(result.users || []);
      setTotal(result.total || 0);
    }
    setLoading(false);
  };

  const roleColors: Record<string, string> = {
    player: "bg-green-100 text-green-800",
    org_admin: "bg-blue-100 text-blue-800",
    coach: "bg-purple-100 text-purple-800",
    finance: "bg-yellow-100 text-yellow-800",
    analyst: "bg-pink-100 text-pink-800",
    super_admin: "bg-red-100 text-red-800",
  };

  const getDetailLink = (user: any) => {
    if (user.role === "player") {
      return `/super-admin/players/${user.player?.id || user.id}`;
    } else if (user.role === "org_admin") {
      return `/super-admin/organizations/${user.organizationId}`;
    } else if (["coach", "analyst", "finance"].includes(user.role)) {
      return `/super-admin/agents/${user.id}`;
    }
    return `/super-admin/users/${user.id}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard
          title="Total Users"
          value={total}
          icon={Users}
        />
        <StatsCard
          title="Players"
          value={users.filter(u => u.role === "player").length}
          icon={UserRound}
        />
        <StatsCard
          title="Org Admins"
          value={users.filter(u => u.role === "org_admin").length}
          icon={Building2}
        />
        <StatsCard
          title="Coaches"
          value={users.filter(u => u.role === "coach").length}
          icon={UserCog}
        />
        <StatsCard
          title="Others"
          value={users.filter(u => ["analyst", "finance"].includes(u.role)).length}
          icon={Users}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Users</CardTitle>
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
                <SelectItem value="player">Players</SelectItem>
                <SelectItem value="org_admin">Org Admins</SelectItem>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.email.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.email}</div>
                            {user.player && (
                              <div className="text-xs text-muted-foreground">
                                {user.player.name} (@{user.player.username})
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role] || "bg-gray-100 text-gray-800"}>
                          {user.role.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.organization ? (
                          <Link
                            href={`/super-admin/organizations/${user.organization.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {user.organization.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt
                          ? format(new Date(user.lastLoginAt), "MMM dd, yyyy")
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        {user.createdAt
                          ? format(new Date(user.createdAt), "MMM dd, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Link href={getDetailLink(user)}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
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

