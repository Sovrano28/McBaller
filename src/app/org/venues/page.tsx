import { getOrganizationVenues, getVenueEvents } from "@/lib/actions/venues";
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
import { MapPin, Plus, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

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

  // Get events for each venue
  const venuesWithEvents = await Promise.all(
    venues.map(async (venue) => {
      const events = await getVenueEvents(
        venue.id,
        orgSession.organizationId
      ).catch(() => []);
      return { ...venue, events };
    })
  );

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
          {venuesWithEvents.map((venue) => (
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
                    <span>•</span>
                    <span>{venue._count.events} events</span>
                  </div>
                </div>
                {venue.events && venue.events.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Upcoming Events:
                    </p>
                    <div className="space-y-2">
                      {venue.events.slice(0, 3).map((event: any) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between text-xs p-2 bg-muted rounded"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{event.title}</p>
                            <div className="flex items-center gap-2 text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(new Date(event.startTime), "MMM d, h:mm a")}
                              </span>
                              {event.team && (
                                <>
                                  <span>•</span>
                                  <span>{event.team.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-2 capitalize text-xs">
                            {event.type}
                          </Badge>
                        </div>
                      ))}
                      {venue.events.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{venue.events.length - 3} more events
                        </p>
                      )}
                    </div>
                  </div>
                )}
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

