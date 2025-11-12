import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";

import { getSession } from "@/lib/actions/auth";
import { getAgentById } from "@/lib/actions/super-admin/agents";

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
import { Building2, Users } from "lucide-react";

export default async function SuperAdminAgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const { success, data: agent } = await getAgentById(id);

  if (!success || !agent) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/super-admin/agents"
        title={agent.email}
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {agent.role}
            </Badge>
            <span>&middot;</span>
            <span>Created {format(new Date(agent.createdAt), "PPP")}</span>
            {agent.organization && (
              <>
                <span>&middot;</span>
                <Link
                  href={`/super-admin/organizations/${agent.organization.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  {agent.organization.name}
                </Link>
              </>
            )}
          </div>
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex w-full flex-wrap gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="players">Assigned Players</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Agent Profile</CardTitle>
              <CardDescription>Details about this staff member</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p>{agent.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Organization</p>
                {agent.organization ? (
                  <Link
                    href={`/super-admin/organizations/${agent.organization.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {agent.organization.name}
                  </Link>
                ) : (
                  <p>Unaffiliated</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Coach Profile</p>
                <p>
                  {agent.coachProfile ? "Available" : "Not created"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Team</p>
                {agent.coachProfile?.team ? (
                  <Link
                    href={`/super-admin/teams/${agent.coachProfile.team.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {agent.coachProfile.team.name}
                  </Link>
                ) : (
                  <p>Not assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <Card>
            <CardHeader>
              <CardTitle>Players</CardTitle>
              <CardDescription>Players currently linked to this agent</CardDescription>
            </CardHeader>
            <CardContent>
              {agent.coachProfile?.players?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Team</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agent.coachProfile.players.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>
                          <Link
                            href={`/super-admin/players/${player.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {player.name}
                          </Link>
                        </TableCell>
                        <TableCell>{player.user?.email ?? "—"}</TableCell>
                        <TableCell>
                          {player.teamId ? (
                            <Link
                              href={`/super-admin/teams/${player.teamId}`}
                              className="flex items-center gap-2 text-blue-600 hover:underline"
                            >
                              <Users className="h-3.5 w-3.5" />
                              {player.team?.name ?? "Team"}
                            </Link>
                          ) : (
                            "Unassigned"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No players assigned to this agent.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

