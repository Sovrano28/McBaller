import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { getCalendarSync } from "@/lib/actions/calendar-sync";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, RefreshCw } from "lucide-react";
import Link from "next/link";
import CalendarSyncSettings from "./calendar-sync-settings";

export default async function CalendarSyncPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as any;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  let sync;
  try {
    sync = await getCalendarSync(orgSession.organizationId);
  } catch (error) {
    sync = null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/org/calendar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-4xl font-bold">Calendar Sync</h1>
          <p className="text-muted-foreground">
            Connect your calendar to sync events
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Sync Status */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Current Sync Status</CardTitle>
            <CardDescription>
              View and manage your calendar connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sync && sync.isActive ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Connected</p>
                    <p className="text-sm text-muted-foreground">
                      {sync.provider.charAt(0).toUpperCase() + sync.provider.slice(1)} Calendar
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    Active
                  </Badge>
                </div>
                {sync.lastSyncAt && (
                  <div className="text-sm text-muted-foreground">
                    Last synced: {new Date(sync.lastSyncAt).toLocaleString()}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No calendar connected. Connect a calendar to sync your events.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connect New Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Connect Calendar</CardTitle>
            <CardDescription>
              Sync events with your external calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarSyncSettings />
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h4 className="mb-2 font-medium text-foreground">Two-Way Sync</h4>
            <p>
              When you connect a calendar, events created in McSportng will automatically 
              appear in your external calendar (Google, Outlook, etc.), and vice versa.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-foreground">Privacy & Security</h4>
            <p>
              Your calendar connection uses secure OAuth protocols. We only access calendar 
              events and never share your data with third parties.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-foreground">Supported Providers</h4>
            <p>
              We support Google Calendar, Microsoft Outlook, and Apple Calendar integrations. 
              More providers coming soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

