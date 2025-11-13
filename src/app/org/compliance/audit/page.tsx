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
import { AuditClient } from "./audit-client";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          View activity logs and compliance reports
        </p>
      </div>

      <AuditClient logs={logs} />
    </div>
  );
}

