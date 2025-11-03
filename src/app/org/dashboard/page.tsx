import { getOrganizationDashboard } from "@/lib/actions/organizations";
import { getExpiringContracts } from "@/lib/actions/contracts";
import {
  getOrganizationInvoices,
  updateOverdueInvoices,
} from "@/lib/actions/invoices";
import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import Link from "next/link";
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
  Users,
  FileText,
  Receipt,
  TrendingUp,
  Building2,
  UserRound,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

export default async function OrgDashboardPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const [dashboardData, expiringContracts, overdueUpdate] = await Promise.all([
    getOrganizationDashboard(orgSession.organizationId),
    getExpiringContracts(orgSession.organizationId, 30).catch(() => []),
    updateOverdueInvoices(orgSession.organizationId).catch(() => 0),
  ]);

  const { organization, kpis } = dashboardData;

  // Get overdue invoices
  const overdueInvoices = await getOrganizationInvoices(
    orgSession.organizationId,
    { status: "overdue" }
  ).catch(() => []);

  const kpiCards = [
    {
      title: "Total Players",
      value: kpis.totalPlayers,
      icon: Users,
      description: "Players in organization",
    },
    {
      title: "Active Contracts",
      value: kpis.activeContracts,
      icon: FileText,
      description: "Currently active",
    },
    {
      title: "Pending Invoices",
      value: kpis.pendingInvoices,
      icon: Receipt,
      description: "Awaiting payment",
    },
    {
      title: "Total Revenue",
      value: `₦${kpis.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      description: "All time",
    },
    {
      title: "Teams",
      value: kpis.totalTeams,
      icon: Building2,
      description: "Active teams",
    },
    {
      title: "Staff Members",
      value: kpis.totalStaff,
      icon: UserRound,
      description: "Organization users",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {organization.name}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map(kpi => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {(expiringContracts.length > 0 || overdueInvoices.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {expiringContracts.length > 0 && (
            <Card className="border-yellow-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Expiring Contracts</CardTitle>
                </div>
                <CardDescription>
                  {expiringContracts.length} contract(s) expiring soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expiringContracts.slice(0, 3).map(contract => (
                    <div
                      key={contract.id}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {contract.player.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires:{" "}
                          {format(new Date(contract.endDate!), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/org/contracts/${contract.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
                {expiringContracts.length > 3 && (
                  <Button variant="link" className="mt-2 w-full" asChild>
                    <Link href="/org/contracts">
                      View all {expiringContracts.length} expiring contracts
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {overdueInvoices.length > 0 && (
            <Card className="border-red-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <CardTitle>Overdue Invoices</CardTitle>
                </div>
                <CardDescription>
                  {overdueInvoices.length} invoice(s) overdue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueInvoices.slice(0, 3).map(invoice => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.currency}{" "}
                          {Number(invoice.amount).toLocaleString()} • Due:{" "}
                          {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/org/billing/invoices/${invoice.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
                {overdueInvoices.length > 3 && (
                  <Button variant="link" className="mt-2 w-full" asChild>
                    <Link href="/org/billing/invoices">
                      View all {overdueInvoices.length} overdue invoices
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Activity & Teams */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>Your organization teams</CardDescription>
          </CardHeader>
          <CardContent>
            {organization.teams.length > 0 ? (
              <div className="space-y-2">
                {organization.teams.map(team => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {team.logo && (
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="h-10 w-10 rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {team.slug}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No teams yet. Create your first team to get started.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/org/players"
              className="block rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              View All Players →
            </Link>
            <Link
              href="/org/teams"
              className="block rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              Manage Teams →
            </Link>
            <Link
              href="/org/contracts/new"
              className="block rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              Create Contract →
            </Link>
            <Link
              href="/org/billing/invoices/new"
              className="block rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              Create Invoice →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
