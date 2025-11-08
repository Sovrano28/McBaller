import { getSession } from "@/lib/actions/auth";
import { getRecentActivity } from "@/lib/actions/super-admin/analytics";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { format } from "date-fns";

export default async function MonitoringPage() {
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const recentActivity = await getRecentActivity(50).catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Monitoring</h1>
        <p className="text-muted-foreground">
          Real-time platform activity and monitoring
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
          <CardDescription>
            Latest actions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {log.action}
                      </Badge>
                      <span className="text-sm font-medium">{log.entityType}</span>
                      {log.organization && (
                        <span className="text-xs text-muted-foreground">
                          • {log.organization.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {log.user?.email || "System"} •{" "}
                      {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm:ss")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

