import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";

import { getSession } from "@/lib/actions/auth";
import { getTeamById } from "@/lib/actions/super-admin/teams";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DetailHeader } from "@/components/super-admin/detail-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Building2,
  Users,
  CalendarDays,
  Megaphone,
  FileText,
} from "lucide-react";

export default async function SuperAdminTeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const { success, data: team } = await getTeamById(id);

  if (!success || !team) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/super-admin/teams"
        title={team.name}
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/super-admin/organizations/${team.organization?.id ?? ""}`}
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <Building2 className="h-3.5 w-3.5" />
              {team.organization?.name ?? "Unknown organization"}
            </Link>
            <span>&middot;</span>
            <span>Created {format(new Date(team.createdAt), "PP")}</span>
          </div>
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex w-full flex-wrap gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Players
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {team._count?.players ?? team.players.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Contracts
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {team._count?.contracts ?? team.contracts.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Events
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {team._count?.events ?? team.events.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Announcements
                </CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {team._count?.announcements ?? team.announcements.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
              <CardDescription>Essential information about this team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={team.players.length > 0 ? "default" : "secondary"}>
                    {team.players.length > 0 ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Division</p>
                  <p>{team.divisionId ?? "Not set"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Age Group</p>
                  <p>{team.ageGroupId ?? "Not set"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Season</p>
                  <p>{team.seasonId ?? "Not set"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <Card>
            <CardHeader>
              <CardTitle>Players</CardTitle>
              <CardDescription>Roster assigned to this team</CardDescription>
            </CardHeader>
            <CardContent>
              {team.players.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No players assigned yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Contracts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.players.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/super-admin/players/${player.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {player.name}
                          </Link>
                        </TableCell>
                        <TableCell>{player.user?.email ?? "—"}</TableCell>
                        <TableCell>{player.position ?? "—"}</TableCell>
                        <TableCell>{player.contracts?.length ?? 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>Latest player contracts for this team</CardDescription>
            </CardHeader>
            <CardContent>
              {team.contracts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No contracts on record.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>
                          <Link
                            href={`/super-admin/players/${contract.player?.id ?? ""}`}
                            className="text-blue-600 hover:underline"
                          >
                            {contract.player?.name ?? "Unknown player"}
                          </Link>
                        </TableCell>
                        <TableCell>{contract.organization?.name ?? "—"}</TableCell>
                        <TableCell>
                          {contract.startDate
                            ? format(new Date(contract.startDate), "PP")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {contract.endDate
                            ? format(new Date(contract.endDate), "PP")
                            : "No end date"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>Recent and upcoming events</CardDescription>
            </CardHeader>
            <CardContent>
              {team.events.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No events scheduled.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>{event.type}</TableCell>
                        <TableCell>
                          {event.startTime
                            ? format(new Date(event.startTime), "PPp")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>Team-specific communications</CardDescription>
            </CardHeader>
            <CardContent>
              {team.announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No announcements have been sent yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {team.announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{announcement.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {announcement.messageType}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(announcement.createdAt), "PPp")}
                        </span>
                      </div>
                      {announcement.content && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {announcement.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

