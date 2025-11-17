import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import { getTournament } from "@/lib/actions/tournaments";
import { getOrganizationTeams } from "@/lib/actions/organizations";
import { getOrganizationVenues } from "@/lib/actions/venues";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Trophy, Users, Plus } from "lucide-react";
import { format } from "date-fns";

export default async function TournamentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const [tournament, teams, venues] = await Promise.all([
    getTournament(orgSession.organizationId, params.id),
    getOrganizationTeams(orgSession.organizationId).catch(() => []),
    getOrganizationVenues(orgSession.organizationId).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/org/tournaments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <p className="text-muted-foreground">{tournament.description || "No description"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/org/tournaments/${params.id}/fixtures/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Fixture
            </Link>
          </Button>
          <Badge
            variant={
              tournament.status === "in_progress"
                ? "default"
                : tournament.status === "completed"
                ? "secondary"
                : "outline"
            }
          >
            {tournament.status.replace("_", " ")}
          </Badge>
          <Badge variant="outline">{tournament.type.replace("_", " ")}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fixtures & Matches</CardTitle>
            <CardDescription>
              {tournament.fixtures.length} match{tournament.fixtures.length !== 1 ? "es" : ""} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tournament.fixtures.length > 0 ? (
                tournament.fixtures.map((fixture) => (
                  <div
                    key={fixture.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="font-semibold">
                              {fixture.homeTeam?.name || fixture.homeTeamName || "TBD"} vs{" "}
                              {fixture.awayTeam?.name || fixture.awayTeamName || "TBD"}
                            </div>
                            {fixture.round && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {fixture.round}
                              </div>
                            )}
                          </div>
                          {fixture.homeScore !== null && fixture.awayScore !== null && (
                            <div className="text-lg font-bold">
                              {fixture.homeScore} - {fixture.awayScore}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(fixture.scheduledAt), "MMM d, yyyy h:mm a")}
                          </div>
                          {fixture.venue && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {fixture.venue.address}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">{fixture.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No fixtures scheduled yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tournament Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Start Date</div>
              <div className="mt-1">
                {format(new Date(tournament.startDate), "MMMM d, yyyy")}
              </div>
            </div>
            {tournament.endDate && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">End Date</div>
                <div className="mt-1">
                  {format(new Date(tournament.endDate), "MMMM d, yyyy")}
                </div>
              </div>
            )}
            {tournament.season && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Season</div>
                <div className="mt-1">{tournament.season.name}</div>
              </div>
            )}
            {tournament.createdBy && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Created By</div>
                <div className="mt-1">{tournament.createdBy.email}</div>
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Fixtures</div>
              <div className="mt-1 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {tournament._count.fixtures}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
