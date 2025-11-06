import { getOrganizationBackgroundChecks } from "@/lib/actions/compliance";
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
import { UserCheck, Plus } from "lucide-react";
import { format } from "date-fns";

export default async function BackgroundChecksPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const checks = await getOrganizationBackgroundChecks(
    orgSession.organizationId
  ).catch(() => []);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    passed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Background Checks</h1>
          <p className="text-muted-foreground">
            Manage background checks for coaches, staff, and players
          </p>
        </div>
        <Button asChild>
          <Link href="/org/compliance/background-checks/new">
            <Plus className="mr-2 h-4 w-4" />
            New Check
          </Link>
        </Button>
      </div>

      {checks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Background Checks</h3>
            <p className="text-muted-foreground text-center mb-4">
              Track background checks for coaches, volunteers, and players
            </p>
            <Button asChild>
              <Link href="/org/compliance/background-checks/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Background Check
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {checks.map((check) => (
            <Card key={check.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>
                        {check.player?.name || check.user?.email || "Unknown"}
                      </CardTitle>
                      <Badge
                        className={statusColors[check.status as keyof typeof statusColors]}
                      >
                        {check.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">{check.type}</Badge>
                    </div>
                    <CardDescription>
                      Created {format(new Date(check.createdAt), "PPp")}
                      {check.expiresAt &&
                        ` • Expires ${format(new Date(check.expiresAt), "PPp")}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {check.provider && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Provider: {check.provider}
                  </p>
                )}
                {check.notes && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {check.notes}
                  </p>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/org/compliance/background-checks/${check.id}`}>
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

