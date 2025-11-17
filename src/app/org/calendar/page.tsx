import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { getOrganizationEvents } from "@/lib/actions/events";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon, MapPin, Clock, Users, RefreshCw, Building2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function CalendarPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as any;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  // Get events for current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);

  const events: any[] = await getOrganizationEvents(orgSession.organizationId, {
    startDate: startOfMonth,
    endDate: endOfMonth,
  }).catch(() => []);

  // Group events by date for calendar display
  const eventsByDate = events.reduce(
    (acc: Record<string, any[]>, event: any) => {
      const dateKey = event.startTime.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="mb-3 font-headline text-4xl font-bold">Calendar</h1>
          <p className="text-lg text-muted-foreground">
            Manage practices, games, tournaments, and meetings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/org/calendar/sync">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Calendar
            </Link>
          </Button>
          <Button asChild>
            <Link href="/org/calendar/new">
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Event Calendar</CardTitle>
            <CardDescription>
              View and manage all upcoming events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              className="rounded-md border"
              modifiers={{
                hasEvents: Object.keys(eventsByDate).map(
                  date => new Date(date)
                ),
              }}
              modifiersClassNames={{
                hasEvents: "bg-primary/20 border-primary",
              }}
            />
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Events</CardTitle>
            <CardDescription>Next 10 scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No upcoming events. Create your first event to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {(events as any[]).slice(0, 10).map((event: any) => (
                  <Link
                    key={event.id}
                    href={`/org/calendar/${event.id}`}
                    className="block rounded-md border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge variant={getEventTypeVariant(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(event.startTime)}
                      </div>
                      {event.venue ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.venue.name}
                          {event.venue.address && ` - ${event.venue.address}`}
                        </div>
                      ) : (
                        event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )
                      )}
                      {event.team ? (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.team.name}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Organization-wide
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Practices</p>
                <p className="text-2xl font-bold">
                  {
                    (events as any[]).filter((e: any) => e.type === "practice")
                      .length
                  }
                </p>
              </div>
              <Badge variant="outline">Practice</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Games</p>
                <p className="text-2xl font-bold">
                  {
                    (events as any[]).filter((e: any) => e.type === "game")
                      .length
                  }
                </p>
              </div>
              <Badge variant="default">Game</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tournaments</p>
                <p className="text-2xl font-bold">
                  {
                    (events as any[]).filter(
                      (e: any) => e.type === "tournament"
                    ).length
                  }
                </p>
              </div>
              <Badge variant="secondary">Tournament</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getEventTypeVariant(type: string): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case "game":
      return "default";
    case "tournament":
      return "secondary";
    case "meeting":
      return "destructive";
    default:
      return "outline";
  }
}

function formatDateTime(date: Date): string {
  const now = new Date();
  const eventDate = new Date(date);
  const isToday = eventDate.toDateString() === now.toDateString();
  
  if (isToday) {
    return `Today at ${eventDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })}`;
  }
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();
  
  if (isTomorrow) {
    return `Tomorrow at ${eventDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })}`;
  }
  
  return eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

