import { getOrganizationAnnouncements } from "@/lib/actions/announcements";
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
import { Megaphone, Plus, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default async function AnnouncementsPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const announcements = await getOrganizationAnnouncements(
    orgSession.organizationId
  ).catch(() => []);

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    normal: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Share important updates with your teams
          </p>
        </div>
        <Button asChild>
          <Link href="/org/announcements/new">
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Link>
        </Button>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Announcements</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first announcement
            </p>
            <Button asChild>
              <Link href="/org/announcements/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Announcement
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{announcement.title}</CardTitle>
                      <Badge
                        className={priorityColors[announcement.priority as keyof typeof priorityColors]}
                      >
                        {announcement.priority}
                      </Badge>
                      {announcement.team && (
                        <Badge variant="outline">
                          {announcement.team.name}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {format(new Date(announcement.createdAt), "PPp")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {announcement.content}
                </p>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  {announcement.sendEmail && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Email sent
                    </span>
                  )}
                  {announcement.sendPush && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Push notification
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/org/announcements/${announcement.id}`}>
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

