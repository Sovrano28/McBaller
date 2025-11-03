import { getOrganizationTeams } from "@/lib/actions/organizations";
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
import { UsersRound, Plus } from "lucide-react";

export default async function OrgTeamsPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const teams = await getOrganizationTeams(orgSession.organizationId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            Manage teams under your organization
          </p>
        </div>
        <Button asChild>
          <Link href="/org/teams/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Link>
        </Button>
      </div>

      {teams.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map(team => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  {team.logo && (
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="h-12 w-12 rounded"
                    />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      <Link
                        href={`/org/teams/${team.id}`}
                        className="hover:underline"
                      >
                        {team.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{team.slug}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Players</span>
                    <Badge variant="secondary">{team._count.players}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Contracts</span>
                    <Badge variant="secondary">{team._count.contracts}</Badge>
                  </div>
                  {team.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {team.description}
                    </p>
                  )}
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/org/teams/${team.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UsersRound className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first team to organize your players
            </p>
            <Button asChild>
              <Link href="/org/teams/new">
                <Plus className="mr-2 h-4 w-4" />
                Create First Team
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
