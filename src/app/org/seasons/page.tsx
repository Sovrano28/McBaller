import { getOrganizationSeasons } from "@/lib/actions/seasons";
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
import { CalendarDays, Plus } from "lucide-react";
import { format } from "date-fns";

export default async function SeasonsPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const seasons = await getOrganizationSeasons(
    orgSession.organizationId
  ).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seasons</h1>
          <p className="text-muted-foreground">
            Manage seasons and programs for your organization
          </p>
        </div>
        <Button asChild>
          <Link href="/org/seasons/new">
            <Plus className="mr-2 h-4 w-4" />
            New Season
          </Link>
        </Button>
      </div>

      {seasons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Seasons</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first season to organize teams and tournaments
            </p>
            <Button asChild>
              <Link href="/org/seasons/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Season
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {seasons.map((season) => (
            <Card key={season.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{season.name}</CardTitle>
                      {season.isActive && (
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {format(new Date(season.startDate), "MMM d, yyyy")} -{" "}
                      {format(new Date(season.endDate), "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {season.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {season.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{season._count.teams} teams</span>
                  <span>•</span>
                  <span>{season._count.tournaments} tournaments</span>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/org/seasons/${season.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

