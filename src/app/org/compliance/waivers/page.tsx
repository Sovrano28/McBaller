import { getOrganizationWaivers } from "@/lib/actions/waivers";
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
import { FileCheck, Plus } from "lucide-react";
import { format } from "date-fns";

export default async function WaiversPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const waivers = await getOrganizationWaivers(
    orgSession.organizationId
  ).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Waivers</h1>
          <p className="text-muted-foreground">
            Manage digital waivers and consent forms
          </p>
        </div>
        <Button asChild>
          <Link href="/org/compliance/waivers/new">
            <Plus className="mr-2 h-4 w-4" />
            New Waiver
          </Link>
        </Button>
      </div>

      {waivers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Waivers</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create waivers for players and participants to sign electronically
            </p>
            <Button asChild>
              <Link href="/org/compliance/waivers/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Waiver
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {waivers.map((waiver) => (
            <Card key={waiver.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{waiver.title}</CardTitle>
                      {waiver.isActive && (
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      )}
                      {waiver.requiresParent && (
                        <Badge variant="outline">Requires Parent</Badge>
                      )}
                    </div>
                    <CardDescription>
                      Version {waiver.version} • Created{" "}
                      {format(new Date(waiver.createdAt), "PPp")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>{waiver._count.signatures} signatures</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/org/compliance/waivers/${waiver.id}`}>
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

