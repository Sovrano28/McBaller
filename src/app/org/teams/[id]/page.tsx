import { getOrganizationTeam } from "@/lib/actions/organizations";
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
import { ArrowLeft, Users, FileText } from "lucide-react";

export default async function OrgTeamDetailPage({
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

  let team;
  try {
    team = await getOrganizationTeam(orgSession.organizationId, id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/org/teams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            {team.logo && (
              <img
                src={team.logo}
                alt={team.name}
                className="h-16 w-16 rounded"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <p className="text-muted-foreground">{team.slug}</p>
            </div>
          </div>
        </div>
      </div>

      {team.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{team.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.players.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Active Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {team.contracts.filter(c => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{team.organization.name}</div>
          </CardContent>
        </Card>
      </div>

      {/* Players Roster */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Players Roster</CardTitle>
              <CardDescription>
                {team.players.length} players in this team
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {team.players.length > 0 ? (
            <div className="space-y-4">
              {team.players.map(player => {
                const latestStats = player.leagueStats[0];
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={player.avatar || undefined} />
                        <AvatarFallback>
                          {player.name
                            .split(" ")
                            .map(n => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          <Link
                            href={`/org/players/${player.id}`}
                            className="hover:underline"
                          >
                            {player.name}
                          </Link>
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {player.position}
                          </Badge>
                          {latestStats && (
                            <>
                              <span>•</span>
                              <span>
                                {latestStats.goals}G {latestStats.assists}A
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/org/players/${player.id}`}>View</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No players in this team</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contracts */}
      {team.contracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Contracts</CardTitle>
            <CardDescription>Contracts linked to this team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {team.contracts
                .filter(c => c.status === "active")
                .map(contract => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={contract.player.avatar || undefined}
                        />
                        <AvatarFallback>
                          {contract.player.name
                            .split(" ")
                            .map(n => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contract.player.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {contract.player.position}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
