import { getAnnouncement } from "@/lib/actions/announcements";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default async function AnnouncementDetailPage({
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

  let announcement;
  try {
    announcement = await getAnnouncement(id);
  } catch (error) {
    notFound();
  }

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    normal: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/org/announcements">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{announcement.title}</h1>
          <p className="text-muted-foreground">
            {format(new Date(announcement.createdAt), "PPp")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              className={priorityColors[announcement.priority as keyof typeof priorityColors]}
            >
              {announcement.priority}
            </Badge>
            {announcement.team && (
              <Badge variant="outline">{announcement.team.name}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-sm">
              {announcement.content}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-6 pt-6 border-t text-sm text-muted-foreground">
            {announcement.sendEmail && (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Email sent
              </span>
            )}
            {announcement.sendPush && (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Push notification sent
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

