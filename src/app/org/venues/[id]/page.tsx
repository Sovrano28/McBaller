import { getVenue } from "@/lib/actions/venues";
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
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";

export default async function VenueDetailPage({
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

  let venue;
  try {
    venue = await getVenue(id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/org/venues">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{venue.name}</h1>
          <p className="text-muted-foreground">
            {venue.address || "Venue details"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {venue.address && (
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">
                  {venue.address}
                </p>
              </div>
            )}
            {(venue.city || venue.state) && (
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {venue.city && venue.state
                    ? `${venue.city}, ${venue.state}`
                    : venue.city || venue.state}
                </p>
              </div>
            )}
            {venue.capacity && (
              <div>
                <p className="text-sm font-medium">Capacity</p>
                <p className="text-sm text-muted-foreground">
                  {venue.capacity} people
                </p>
              </div>
            )}
            {venue.contactName && (
              <div>
                <p className="text-sm font-medium">Contact</p>
                <p className="text-sm text-muted-foreground">
                  {venue.contactName}
                  {venue.contactPhone && ` • ${venue.contactPhone}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {venue.bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming bookings
              </p>
            ) : (
              <div className="space-y-2">
                {venue.bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-2 border rounded text-sm"
                  >
                    <p className="font-medium">
                      {new Date(booking.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(booking.startTime).toLocaleTimeString()} -{" "}
                      {new Date(booking.endTime).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

