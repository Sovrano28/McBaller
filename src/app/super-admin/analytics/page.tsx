import { getSession } from "@/lib/actions/auth";
import {
  getOrganizationGrowthTrends,
  getUserGrowthTrends,
  getGrowthMetrics,
  getPlatformEngagement,
  getFinancialAnalytics,
  getUserActivityMetrics,
} from "@/lib/actions/super-admin/analytics";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  MessageSquare,
  BookOpen,
  Activity,
  UserRound,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default async function AnalyticsPage() {
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const [
    orgTrends,
    userTrends,
    growthMetrics,
    engagement,
    financial,
    activity,
  ] = await Promise.all([
    getOrganizationGrowthTrends(30).catch(() => []),
    getUserGrowthTrends(30).catch(() => []),
    getGrowthMetrics(30).catch(() => null),
    getPlatformEngagement(30).catch(() => null),
    getFinancialAnalytics(30).catch(() => null),
    getUserActivityMetrics(30).catch(() => null),
  ]);

  const overallGrowthRate = growthMetrics
    ? (growthMetrics.organizationGrowthRate +
        growthMetrics.userGrowthRate +
        growthMetrics.playerGrowthRate) /
      3
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Analytics</h1>
        <p className="text-muted-foreground">
          Growth trends and platform analytics
        </p>
      </div>

      {/* Growth Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgTrends.length}</div>
            <p className="text-xs text-muted-foreground">
              {growthMetrics && (
                <span className={growthMetrics.organizationGrowthRate >= 0 ? "text-green-600" : "text-red-600"}>
                  {growthMetrics.organizationGrowthRate >= 0 ? (
                    <ArrowUp className="inline h-3 w-3" />
                  ) : (
                    <ArrowDown className="inline h-3 w-3" />
                  )}
                  {Math.abs(growthMetrics.organizationGrowthRate).toFixed(1)}%
                </span>
              )}
              {" "}Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTrends.length}</div>
            <p className="text-xs text-muted-foreground">
              {growthMetrics && (
                <span className={growthMetrics.userGrowthRate >= 0 ? "text-green-600" : "text-red-600"}>
                  {growthMetrics.userGrowthRate >= 0 ? (
                    <ArrowUp className="inline h-3 w-3" />
                  ) : (
                    <ArrowDown className="inline h-3 w-3" />
                  )}
                  {Math.abs(growthMetrics.userGrowthRate).toFixed(1)}%
                </span>
              )}
              {" "}Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallGrowthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Month over month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagement?.activeUsers ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Created</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagement?.postsCreated ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Completions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagement?.trainingCompletions ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <UserRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activity?.totalLogins ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {activity?.averageLoginsPerUser.toFixed(1) ?? 0} per user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analytics */}
      {financial && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Analytics
            </CardTitle>
            <CardDescription>
              Revenue and subscription metrics for the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ₦{Number(financial.currentRevenue).toLocaleString()}
                </p>
                {financial.revenueGrowth !== 0 && (
                  <p className={`text-xs ${financial.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {financial.revenueGrowth >= 0 ? (
                      <ArrowUp className="inline h-3 w-3" />
                    ) : (
                      <ArrowDown className="inline h-3 w-3" />
                    )}
                    {Math.abs(financial.revenueGrowth).toFixed(1)}% vs previous period
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{financial.transactionCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subscription Distribution</p>
                <div className="space-y-1 mt-2">
                  {financial.subscriptionDistribution.map((sub: any) => (
                    <div key={sub.subscriptionTier} className="flex justify-between text-sm">
                      <span className="capitalize">{sub.subscriptionTier}</span>
                      <span className="font-medium">{sub._count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {financial.revenueByStatus.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Revenue by Status</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financial.revenueByStatus.map((status: any) => (
                      <TableRow key={status.status}>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {status.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          ₦{Number(status._sum.amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>{status._count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Most Active Users */}
      {activity && activity.mostActiveUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Active Users</CardTitle>
            <CardDescription>
              Users with the most recent login activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.mostActiveUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/super-admin/users/${user.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {user.email}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt
                        ? format(new Date(user.lastLoginAt), "PPp")
                        : "Never"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Growth Trends Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Trends Summary</CardTitle>
          <CardDescription>
            Platform growth over the last 30 days compared to previous period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {growthMetrics ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Organizations</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">
                    {growthMetrics.currentOrganizations}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (was {growthMetrics.previousOrganizations})
                  </p>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    growthMetrics.organizationGrowthRate >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {growthMetrics.organizationGrowthRate >= 0 ? (
                    <ArrowUp className="inline h-3 w-3" />
                  ) : (
                    <ArrowDown className="inline h-3 w-3" />
                  )}
                  {Math.abs(growthMetrics.organizationGrowthRate).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Users</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">
                    {growthMetrics.currentUsers}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (was {growthMetrics.previousUsers})
                  </p>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    growthMetrics.userGrowthRate >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {growthMetrics.userGrowthRate >= 0 ? (
                    <ArrowUp className="inline h-3 w-3" />
                  ) : (
                    <ArrowDown className="inline h-3 w-3" />
                  )}
                  {Math.abs(growthMetrics.userGrowthRate).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Players</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">
                    {growthMetrics.currentPlayers}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (was {growthMetrics.previousPlayers})
                  </p>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    growthMetrics.playerGrowthRate >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {growthMetrics.playerGrowthRate >= 0 ? (
                    <ArrowUp className="inline h-3 w-3" />
                  ) : (
                    <ArrowDown className="inline h-3 w-3" />
                  )}
                  {Math.abs(growthMetrics.playerGrowthRate).toFixed(1)}%
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No growth data available
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

