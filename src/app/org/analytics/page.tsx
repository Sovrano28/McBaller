import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getOrganizationStats,
  getPlayerGrowthMetrics,
  getEventStatistics,
  getFinancialMetrics,
  getTeamPerformance,
  getEngagementMetrics,
} from "@/lib/actions/org-analytics";
import {
  Users,
  UsersRound,
  Calendar,
  FileText,
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function OrgAnalyticsPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const [
    stats,
    growthMetrics,
    eventStats,
    financialMetrics,
    teamPerformance,
    engagementMetrics,
  ] = await Promise.all([
    getOrganizationStats(orgSession.organizationId).catch(() => null),
    getPlayerGrowthMetrics(orgSession.organizationId, 30).catch(() => null),
    getEventStatistics(orgSession.organizationId, 30).catch(() => null),
    getFinancialMetrics(orgSession.organizationId, 30).catch(() => null),
    getTeamPerformance(orgSession.organizationId).catch(() => []),
    getEngagementMetrics(orgSession.organizationId, 30).catch(() => null),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Organization performance and statistics
        </p>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlayers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeContracts} active contracts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams</CardTitle>
              <UsersRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
              <p className="text-xs text-muted-foreground">
                Across organization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                All time events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{financialMetrics?.totalRevenue.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Growth Metrics */}
      {growthMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Player Growth
            </CardTitle>
            <CardDescription>
              New players added in the last {growthMetrics.period} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">New Players</p>
                <p className="text-2xl font-bold">{growthMetrics.newPlayers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Players</p>
                <p className="text-2xl font-bold">{growthMetrics.totalPlayers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <p className="text-2xl font-bold">{growthMetrics.growthRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Statistics */}
      {eventStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Statistics
            </CardTitle>
            <CardDescription>
              Events breakdown for the last {eventStats.period} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{eventStats.totalEvents}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Events</p>
                <p className="text-2xl font-bold">{eventStats.upcomingEvents}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Practices</p>
                <p className="text-2xl font-bold">
                  {eventStats.eventsByType.practice || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Games</p>
                <p className="text-2xl font-bold">
                  {eventStats.eventsByType.game || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Metrics */}
      {financialMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Overview
            </CardTitle>
            <CardDescription>
              Revenue and invoice statistics for the last {financialMetrics.period} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ₦{financialMetrics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ₦{financialMetrics.outstandingInvoices.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Invoices</p>
                <p className="text-2xl font-bold text-green-600">
                  {financialMetrics.paidInvoicesCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Performance */}
      {teamPerformance && teamPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Team Performance
            </CardTitle>
            <CardDescription>
              Player distribution across teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teamPerformance.map((team) => (
                <div
                  key={team.id}
                  className="p-4 border rounded-lg"
                >
                  <h3 className="font-semibold mb-2">{team.name}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Players:</span>
                      <span className="font-medium">{team.playerCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contracts:</span>
                      <span className="font-medium">{team.contractCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engagement Metrics */}
      {engagementMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Engagement Metrics
            </CardTitle>
            <CardDescription>
              Player activity for the last {engagementMetrics.period} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Active Players</p>
                <p className="text-2xl font-bold">{engagementMetrics.activePlayers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{engagementMetrics.totalPosts}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Likes</p>
                <p className="text-2xl font-bold">{engagementMetrics.totalLikes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
