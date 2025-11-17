import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import type { PlayerAuthData } from "@/lib/auth-types";
import { getPlayerTournaments } from "@/lib/actions/tournaments";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users } from "lucide-react";
import { format } from "date-fns";

export default async function PlayerTournamentsPage() {
  const session = await getSession();

  if (!session || session.role !== "player") {
    redirect("/login");
  }

  const playerSession = session as PlayerAuthData;
  if (!playerSession.playerId) {
    redirect("/login");
  }

  const tournaments = await getPlayerTournaments(playerSession.playerId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <p className="text-muted-foreground">
          View tournaments your teams are participating in
        </p>
      </div>

      {tournaments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{tournament.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {tournament.description || "No description"}
                    </CardDescription>
                  </div>
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {format(new Date(tournament.startDate), "MMM d, yyyy")}
                      {tournament.endDate &&
                        ` - ${format(new Date(tournament.endDate), "MMM d, yyyy")}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {tournament.fixtures.length} match{tournament.fixtures.length !== 1 ? "es" : ""} for your teams
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
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
                  {tournament.season && (
                    <div className="text-sm text-muted-foreground">
                      Season: {tournament.season.name}
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <Link
                      href={`/tournaments/${tournament.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tournaments</h3>
            <p className="text-muted-foreground text-center">
              You're not participating in any tournaments yet
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

