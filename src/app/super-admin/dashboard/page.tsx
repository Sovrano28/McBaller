import { getSession } from "@/lib/actions/auth";
import { getSystemKPIs, getCriticalAlerts, getRecentActivity } from "@/lib/actions/super-admin/analytics";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/super-admin/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  UserRound,
  DollarSign,
  AlertTriangle,
  FileText,
  Receipt,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function SuperAdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const [kpis, alerts, recentActivity] = await Promise.all([
    getSystemKPIs().catch(() => null),
    getCriticalAlerts().catch(() => null),
    getRecentActivity(20).catch(() => []),
  ]);

  if (!kpis || !alerts) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">System Overview & Management</p>
        </div>
        <p>Error loading dashboard data</p>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Total Organizations",
      value: kpis.totalOrganizations,
      description: `+${kpis.recentOrganizations} this month`,
      icon: Building2,
    },
    {
      title: "Total Users",
      value: kpis.totalUsers,
      description: `+${kpis.recentUsers} this month`,
      icon: Users,
    },
    {
      title: "Total Players",
      value: kpis.totalPlayers,
      description: `${kpis.subscriptionsByTier.pro || 0} Pro, ${kpis.subscriptionsByTier.elite || 0} Elite`,
      icon: UserRound,
    },
    {
      title: "Active Contracts",
      value: kpis.totalContracts,
      description: "Currently active",
      icon: FileText,
    },
    {
      title: "Total Invoices",
      value: kpis.totalInvoices,
      description: "All time",
      icon: Receipt,
    },
    {
      title: "Total Revenue",
      value: `₦${kpis.totalRevenue.toLocaleString()}`,
      description: "From paid invoices",
      icon: DollarSign,
    },
  ];

  const hasAlerts = 
    alerts.overdueInvoices > 0 ||
    alerts.expiredBackgroundChecks > 0 ||
    alerts.expiredDocuments > 0 ||
    alerts.expiringSubscriptions > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">System Overview & Management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((kpi) => (
          <StatsCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            description={kpi.description}
            icon={kpi.icon}
          />
        ))}
      </div>

      {/* Critical Alerts */}
      {hasAlerts && (
        <Card className="border-red-500 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-900 dark:text-red-100">
                Critical Alerts
              </CardTitle>
            </div>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {alerts.overdueInvoices > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-white dark:bg-slate-900 p-3">
                  <div>
                    <p className="font-medium text-sm">Overdue Invoices</p>
                    <p className="text-xs text-muted-foreground">
                      {alerts.overdueInvoices} invoices overdue
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/super-admin/financial/invoices?status=overdue">
                      View
                    </Link>
                  </Button>
                </div>
              )}

              {alerts.expiredBackgroundChecks > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-white dark:bg-slate-900 p-3">
                  <div>
                    <p className="font-medium text-sm">Expired Background Checks</p>
                    <p className="text-xs text-muted-foreground">
                      {alerts.expiredBackgroundChecks} checks expired
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/super-admin/compliance">View</Link>
                  </Button>
                </div>
              )}

              {alerts.expiredDocuments > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-white dark:bg-slate-900 p-3">
                  <div>
                    <p className="font-medium text-sm">Expired Documents</p>
                    <p className="text-xs text-muted-foreground">
                      {alerts.expiredDocuments} documents expired
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/super-admin/compliance">View</Link>
                  </Button>
                </div>
              )}

              {alerts.expiringSubscriptions > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-white dark:bg-slate-900 p-3">
                  <div>
                    <p className="font-medium text-sm">Expiring Subscriptions</p>
                    <p className="text-xs text-muted-foreground">
                      {alerts.expiringSubscriptions} expiring in 7 days
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/super-admin/financial/subscriptions?status=expiring">
                      View
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Role Breakdown & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Breakdown</CardTitle>
            <CardDescription>By role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(kpis.roleBreakdown).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {role.replace(/_/g, " ")}
                  </span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {log.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {log.entityType}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {log.user?.email || "System"} •{" "}
                      {format(new Date(log.createdAt), "MMM dd, HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="link" className="mt-3 w-full" asChild>
              <Link href="/super-admin/audit">View All Activity</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button variant="outline" asChild className="justify-start">
              <Link href="/super-admin/organizations">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Organizations
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/super-admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/super-admin/players">
                <UserRound className="mr-2 h-4 w-4" />
                Manage Players
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/super-admin/financial/invoices">
                <Receipt className="mr-2 h-4 w-4" />
                View Invoices
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

