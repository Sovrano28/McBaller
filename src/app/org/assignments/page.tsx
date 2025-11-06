import { getOrganizationAssignments } from "@/lib/actions/assignments";
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
import { ClipboardList, Plus } from "lucide-react";
import { format } from "date-fns";

export default async function AssignmentsPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const assignments = await getOrganizationAssignments(
    orgSession.organizationId
  ).catch(() => []);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">
            Manage volunteer tasks and assignments
          </p>
        </div>
        <Button asChild>
          <Link href="/org/assignments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Link>
        </Button>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assignments</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create assignments to track volunteer tasks and duties
            </p>
            <Button asChild>
              <Link href="/org/assignments/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{assignment.title}</CardTitle>
                      <Badge
                        className={statusColors[assignment.status as keyof typeof statusColors]}
                      >
                        {assignment.status.replace("_", " ")}
                      </Badge>
                      {assignment.team && (
                        <Badge variant="outline">
                          {assignment.team.name}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      Created {format(new Date(assignment.createdAt), "PPp")}
                      {assignment.dueDate &&
                        ` • Due ${format(new Date(assignment.dueDate), "PPp")}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {assignment.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {assignment.description}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/org/assignments/${assignment.id}`}>
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

