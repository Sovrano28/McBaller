import { getSession } from "@/lib/actions/auth";
import { getEvent } from "@/lib/actions/events";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar as CalendarIcon, MapPin, Clock, Users, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import EventActions from "./event-actions";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as any;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  let event;
  try {
    event = await getEvent(orgSession.organizationId, id);
  } catch (error) {
    notFound();
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "cancelled":
        return "destructive";
      case "completed":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/org/calendar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-headline text-4xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground">
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(event.status)}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
          <EventActions event={event} organizationId={orgSession.organizationId} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.description && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    Description
                  </h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              )}

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Schedule
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Start:</strong> {format(event.startTime, "PPP 'at' p")}
                  </p>
                  <p>
                    <strong>End:</strong> {format(event.endTime, "PPP 'at' p")}
                  </p>
                  {event.isAllDay && (
                    <Badge variant="outline" className="mt-2">
                      All Day Event
                    </Badge>
                  )}
                </div>
              </div>

              {event.location && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4" />
                    Location
                  </h3>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              )}

              {event.team && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4" />
                    Team
                  </h3>
                  <p className="text-sm text-muted-foreground">{event.team.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recurring Info */}
          {event.recurringType && event.recurringType !== "none" && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Recurring Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This event repeats{" "}
                  <strong>
                    {event.recurringType === "daily"
                      ? "daily"
                      : event.recurringType === "weekly"
                      ? "weekly"
                      : "monthly"}
                  </strong>
                  {event.recurringEnd && (
                    <> until {format(event.recurringEnd, "PPP")}</>
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/org/calendar/${event.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Event
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Sync to Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className="ml-2">
                  {event.type}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={getStatusVariant(event.status)} className="ml-2">
                  {event.status}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2">{format(event.createdAt, "PPP")}</span>
              </div>
              {event.updatedAt && (
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="ml-2">{format(event.updatedAt, "PPP")}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

