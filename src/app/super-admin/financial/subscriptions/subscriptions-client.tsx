"use client";

import { useEffect, useState } from "react";
import { getAllSubscriptions } from "@/lib/actions/super-admin/financial";
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
import { Search, Shield, AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isPast, isAfter, addDays } from "date-fns";

export function SubscriptionsClient() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
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
    
    const result = await getAllSubscriptions({
      search: search || undefined,
      tier: tierFilter !== "all" ? tierFilter : undefined,
      limit: 100,
    });

    if (result) {
      let filteredSubs = result.subscriptions || [];
      
      // Apply status filter client-side
      if (statusFilter === "active") {
        filteredSubs = filteredSubs.filter(s => 
          s.subscriptionExpiry && isAfter(new Date(s.subscriptionExpiry), new Date())
        );
      } else if (statusFilter === "expiring") {
        filteredSubs = filteredSubs.filter(s => 
          s.subscriptionExpiry && 
          isAfter(new Date(s.subscriptionExpiry), new Date()) &&
          !isAfter(new Date(s.subscriptionExpiry), addDays(new Date(), 7))
        );
      } else if (statusFilter === "expired") {
        filteredSubs = filteredSubs.filter(s => 
          s.subscriptionExpiry && isPast(new Date(s.subscriptionExpiry))
        );
      }

      setSubscriptions(filteredSubs);
      setTotal(result.total || 0);
    }
    setLoading(false);
  };

  const tierColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-800",
    pro: "bg-blue-100 text-blue-800",
    elite: "bg-purple-100 text-purple-800",
  };

  // Calculate stats
  const allSubs = subscriptions;
  const activeSubscriptions = allSubs.filter(s => 
    s.subscriptionExpiry && isAfter(new Date(s.subscriptionExpiry), new Date())
  );
  
  const expiringSubscriptions = allSubs.filter(s => 
    s.subscriptionExpiry && 
    isAfter(new Date(s.subscriptionExpiry), new Date()) &&
    !isAfter(new Date(s.subscriptionExpiry), addDays(new Date(), 7))
  );

  const expiredSubscriptions = allSubs.filter(s => 
    s.subscriptionExpiry && isPast(new Date(s.subscriptionExpiry))
  );

  const getSubscriptionStatus = (expiry: Date | null | undefined) => {
    if (!expiry) return "none";
    try {
      const expiryDate = new Date(expiry);
      if (isNaN(expiryDate.getTime())) return "none";
      if (isPast(expiryDate)) return "expired";
      if (!isAfter(expiryDate, addDays(new Date(), 7))) return "expiring";
      return "active";
    } catch {
      return "none";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Active Subscriptions"
          value={activeSubscriptions.length}
          icon={CheckCircle}
        />
        <StatsCard
          title="Expiring Soon"
          value={expiringSubscriptions.length}
          icon={AlertTriangle}
        />
        <StatsCard
          title="Expired"
          value={expiredSubscriptions.length}
          icon={XCircle}
        />
        <StatsCard
          title="Total Players"
          value={total}
          icon={Shield}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by player name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tier" />
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
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadData} variant="outline">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions ({subscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subscriptions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((player) => {
                    const status = getSubscriptionStatus(player.subscriptionExpiry);
                    return (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">
                          {player.name}
                        </TableCell>
                        <TableCell>{player.user?.email || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={tierColors[player.subscriptionTier]}>
                            {player.subscriptionTier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status === "active"
                                ? "default"
                                : status === "expiring"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {status === "none" ? "No Expiry" : status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {player.subscriptionExpiry ? (
                            (() => {
                              try {
                                const date = new Date(player.subscriptionExpiry);
                                return isNaN(date.getTime())
                                  ? "Invalid Date"
                                  : format(date, "MMM dd, yyyy");
                              } catch {
                                return "Invalid Date";
                              }
                            })()
                          ) : (
                            "Never"
                          )}
                        </TableCell>
                        <TableCell>
                          <Link href={`/super-admin/players/${player.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

