import { getOrganizationVenues } from "@/lib/actions/venues";
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
import { MapPin, Plus } from "lucide-react";

export default async function VenuesPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const venues = await getOrganizationVenues(
    orgSession.organizationId
  ).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Venues</h1>
          <p className="text-muted-foreground">
            Manage facilities and venues for events
          </p>
        </div>
        <Button asChild>
          <Link href="/org/venues/new">
            <Plus className="mr-2 h-4 w-4" />
            New Venue
          </Link>
        </Button>
      </div>

      {venues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Venues</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add venues to manage facility bookings and events
            </p>
            <Button asChild>
              <Link href="/org/venues/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Venue
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <Card key={venue.id}>
              <CardHeader>
                <CardTitle>{venue.name}</CardTitle>
                <CardDescription>
                  {venue.address && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{venue.address}</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {venue.capacity && (
                    <div>
                      <span className="text-muted-foreground">Capacity: </span>
                      <span>{venue.capacity}</span>
                    </div>
                  )}
                  {venue.city && venue.state && (
                    <div>
                      <span className="text-muted-foreground">Location: </span>
                      <span>
                        {venue.city}, {venue.state}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{venue._count.bookings} bookings</span>
                    <span>•</span>
                    <span>{venue._count.fixtures} fixtures</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/org/venues/${venue.id}`}>
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

