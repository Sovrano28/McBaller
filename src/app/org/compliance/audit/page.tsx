import { getOrganizationAuditLogs } from "@/lib/actions/compliance";
import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSearch } from "lucide-react";
import { format } from "date-fns";

export default async function AuditLogsPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const logs = await getOrganizationAuditLogs(
    orgSession.organizationId
  ).catch(() => []);

  const actionColors = {
    create: "bg-green-100 text-green-800",
    update: "bg-blue-100 text-blue-800",
    delete: "bg-red-100 text-red-800",
    view: "bg-gray-100 text-gray-800",
    export: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          View activity logs and compliance reports
        </p>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileSearch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Audit Logs</h3>
            <p className="text-muted-foreground text-center">
              Activity logs will appear here as actions are performed
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Last {logs.length} actions in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={actionColors[log.action as keyof typeof actionColors] || "bg-gray-100"}
                      >
                        {log.action}
                      </Badge>
                      <span className="font-medium">{log.entityType}</span>
                      {log.entityId && (
                        <span className="text-sm text-muted-foreground">
                          (ID: {log.entityId})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {log.user?.email || "System"} •{" "}
                      {format(new Date(log.createdAt), "PPp")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

