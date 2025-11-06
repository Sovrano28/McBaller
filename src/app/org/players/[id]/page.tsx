import { getOrganizationPlayer } from "@/lib/actions/organizations";
import { getSession } from "@/lib/actions/auth";
import { redirect, notFound } from "next/navigation";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

export default async function OrgPlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  let player;
  try {
    player = await getOrganizationPlayer(orgSession.organizationId, id);
  } catch (error) {
    notFound();
  }

  const latestStats = player.leagueStats[0];
  const activeContract = player.contracts.find(c => c.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/org/players">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{player.name}</h1>
            <p className="text-muted-foreground">@{player.username}</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/org/players/${player.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Player
          </Link>
        </Button>
      </div>

      {/* Player Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={player.avatar || undefined} />
              <AvatarFallback className="text-2xl">
                {player.name
                  .split(" ")
                  .map(n => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{player.position}</Badge>
                {player.subscriptionTier !== "free" && (
                  <Badge variant="default">
                    {player.subscriptionTier.toUpperCase()}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {player.user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{player.user.email}</span>
                  </div>
                )}
                {player.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{player.phone}</span>
                  </div>
                )}
                {player.state && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{player.state}</span>
                  </div>
                )}
                {player.dateOfBirth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(player.dateOfBirth), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
              </div>
              {player.bio && (
                <p className="text-sm text-muted-foreground">{player.bio}</p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contracts">
            Contracts ({player.contracts.length})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices ({player.invoices.length})
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>League Statistics</CardTitle>
                <CardDescription>Latest season performance</CardDescription>
              </CardHeader>
              <CardContent>
                {latestStats ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Season
                      </span>
                      <span className="font-medium">
                        {latestStats.season} - {latestStats.club}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Appearances
                      </span>
                      <span className="font-medium">
                        {latestStats.appearances}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Goals
                      </span>
                      <span className="font-medium">{latestStats.goals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Assists
                      </span>
                      <span className="font-medium">{latestStats.assists}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Yellow Cards
                      </span>
                      <span className="font-medium">
                        {latestStats.yellowCards}
                      </span>
                    </div>
                    {latestStats.verified && (
                      <Badge variant="default" className="mt-2">
                        Verified ✓
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No league statistics available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Physical Attributes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {player.height && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Height
                      </span>
                      <span className="font-medium">{player.height} cm</span>
                    </div>
                  )}
                  {player.weight && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Weight
                      </span>
                      <span className="font-medium">{player.weight} kg</span>
                    </div>
                  )}
                  {player.preferredFoot && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Preferred Foot
                      </span>
                      <span className="font-medium">
                        {player.preferredFoot}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {activeContract && (
            <Card>
              <CardHeader>
                <CardTitle>Active Contract</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {format(
                        new Date(activeContract.startDate),
                        "MMM dd, yyyy"
                      )}
                      {" - "}
                      {activeContract.endDate
                        ? format(
                            new Date(activeContract.endDate),
                            "MMM dd, yyyy"
                          )
                        : "Ongoing"}
                    </p>
                    {activeContract.salary && (
                      <p className="text-sm text-muted-foreground">
                        Salary: ₦
                        {Number(activeContract.salary).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          {player.contracts.length > 0 ? (
            <div className="space-y-4">
              {player.contracts.map(contract => (
                <Card key={contract.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Contract</CardTitle>
                      <Badge
                        variant={
                          contract.status === "active"
                            ? "default"
                            : contract.status === "expired"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Start Date
                        </span>
                        <span>
                          {format(new Date(contract.startDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                      {contract.endDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            End Date
                          </span>
                          <span>
                            {format(new Date(contract.endDate), "MMM dd, yyyy")}
                          </span>
                        </div>
                      )}
                      {contract.salary && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Salary</span>
                          <span className="font-medium">
                            ₦{Number(contract.salary).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {contract.team && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Team</span>
                          <span>{contract.team.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/org/contracts/${contract.id}`}>
                          View Contract
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No contracts found</p>
                <Button className="mt-4" asChild>
                  <Link href="/org/contracts/new">Create Contract</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          {player.invoices.length > 0 ? (
            <div className="space-y-4">
              {player.invoices.map(invoice => (
                <Card key={invoice.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{invoice.invoiceNumber}</CardTitle>
                      <Badge
                        variant={
                          invoice.status === "paid"
                            ? "default"
                            : invoice.status === "draft"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">
                          {invoice.currency}{" "}
                          {Number(invoice.amount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due Date</span>
                        <span>
                          {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                      {invoice.paidAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Paid At</span>
                          <span>
                            {format(new Date(invoice.paidAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/org/billing/invoices/${invoice.id}`}>
                          View Invoice
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No invoices found</p>
                <Button className="mt-4" asChild>
                  <Link href="/org/billing/invoices/new">Create Invoice</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Season-by-season performance breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {player.leagueStats.length > 0 ? (
                <div className="space-y-4">
                  {player.leagueStats.map(stat => (
                    <div
                      key={`${stat.season}-${stat.club}`}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">
                            {stat.season} - {stat.club}
                          </p>
                          {stat.verified && (
                            <Badge variant="default" className="mt-1">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Apps</p>
                          <p className="font-medium">{stat.appearances}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Goals</p>
                          <p className="font-medium">{stat.goals}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Assists</p>
                          <p className="font-medium">{stat.assists}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cards</p>
                          <p className="font-medium">
                            {stat.yellowCards}Y / {stat.redCards}R
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No performance data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
