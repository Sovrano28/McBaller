import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";

import { getSession } from "@/lib/actions/auth";
import { getPlayerDetails } from "@/lib/actions/super-admin/players";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DetailHeader } from "@/components/super-admin/detail-header";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  FileText,
  Receipt,
  Trophy,
} from "lucide-react";

export default async function SuperAdminPlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const player = await getPlayerDetails(id).catch(() => null);

  if (!player) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/super-admin/players"
        title={player.name}
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <span>@{player.username}</span>
            <span>&middot;</span>
            <span>{player.position ?? "Position not set"}</span>
            {player.organization && (
              <>
                <span>&middot;</span>
                <Link
                  href={`/super-admin/organizations/${player.organization.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {player.organization.name}
                </Link>
              </>
            )}
          </div>
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex w-full flex-wrap gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="capitalize">
                  {player.subscriptionTier}
                </Badge>
                {player.subscriptionExpiry && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Expires {format(new Date(player.subscriptionExpiry), "PPP")}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contracts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {player.contracts.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {player.invoices.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Training</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {player.trainingProgress.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Programs tracked
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contact & Profile</CardTitle>
              <CardDescription>Key profile details for this player</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p>{player.user?.email ?? "Not available"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p>{player.phone ?? "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Preferred Foot</p>
                <p>{player.preferredFoot ?? "Not set"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current Team</p>
                {player.team ? (
                  <Link
                    href={`/super-admin/teams/${player.team.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {player.team.name}
                  </Link>
                ) : (
                  <p>Unassigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>Recent contracts associated with this player</CardDescription>
            </CardHeader>
            <CardContent>
              {player.contracts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contracts found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {player.contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>{contract.organization?.name ?? "—"}</TableCell>
                        <TableCell>{contract.team?.name ?? "—"}</TableCell>
                        <TableCell>
                          {contract.startDate
                            ? format(new Date(contract.startDate), "PPP")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {contract.endDate
                            ? format(new Date(contract.endDate), "PPP")
                            : "Open-ended"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Latest billing records linked to this player</CardDescription>
            </CardHeader>
            <CardContent>
              {player.invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invoices found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {player.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Link
                            href={`/super-admin/invoices/${invoice.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {invoice.invoiceNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>₦{Number(invoice.amount).toLocaleString()}</TableCell>
                        <TableCell>
                          {invoice.dueDate
                            ? format(new Date(invoice.dueDate), "PPP")
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>League Statistics</CardTitle>
              <CardDescription>Recorded seasonal statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {player.leagueStats.length === 0 ? (
                <p className="text-sm text-muted-foreground">No statistics recorded yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Season</TableHead>
                      <TableHead>Club</TableHead>
                      <TableHead>Apps</TableHead>
                      <TableHead>Goals</TableHead>
                      <TableHead>Assists</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {player.leagueStats.map((stat) => (
                      <TableRow key={stat.id}>
                        <TableCell>{stat.season}</TableCell>
                        <TableCell>{stat.club}</TableCell>
                        <TableCell>{stat.appearances}</TableCell>
                        <TableCell>{stat.goals}</TableCell>
                        <TableCell>{stat.assists}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}