import { getOrganizationPlayers } from "@/lib/actions/organizations";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function OrgPlayersPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const players = await getOrganizationPlayers(orgSession.organizationId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Players</h1>
          <p className="text-muted-foreground">
            Manage all players in your organization
          </p>
        </div>
        <Button asChild>
          <Link href="/org/players/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Player
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search players by name, username, or email..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Players Grid */}
      {players.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map(player => {
            const latestStats = player.leagueStats[0];
            const activeContract = player.contracts[0];

            return (
              <Card
                key={player.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={player.avatar || undefined} />
                      <AvatarFallback>
                        {player.name
                          .split(" ")
                          .map(n => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        <Link
                          href={`/org/players/${player.id}`}
                          className="hover:underline"
                        >
                          {player.name}
                        </Link>
                      </CardTitle>
                      <CardDescription>@{player.username}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Position</span>
                      <Badge variant="secondary">{player.position}</Badge>
                    </div>

                    {player.team && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Team</span>
                        <Badge variant="outline">{player.team.name}</Badge>
                      </div>
                    )}

                    {latestStats && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Season</span>
                        <span className="font-medium">
                          {latestStats.season} ({latestStats.club})
                        </span>
                      </div>
                    )}

                    {activeContract && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Contract</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <Link href={`/org/players/${player.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No players yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by adding players to your organization
            </p>
            <Button asChild>
              <Link href="/org/players/new">
                <Plus className="mr-2 h-4 w-4" />
                Add First Player
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
