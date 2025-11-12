import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";

import { getSession } from "@/lib/actions/auth";
import { getContractDetails } from "@/lib/actions/super-admin/financial";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DetailHeader } from "@/components/super-admin/detail-header";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Users, Building2 } from "lucide-react";

export default async function SuperAdminContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const contract = await getContractDetails(id).catch(() => null);

  if (!contract) {
    notFound();
  }

  const backHref = contract.team
    ? `/super-admin/teams/${contract.team.id}`
    : contract.organization
    ? `/super-admin/organizations/${contract.organization.id}`
    : "/super-admin/teams";

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref={backHref}
        title="Contract Overview"
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <span>Contract ID: {contract.id}</span>
            {contract.status && (
              <>
                <span>&middot;</span>
                <Badge variant="outline" className="capitalize">
                  {contract.status}
                </Badge>
              </>
            )}
          </div>
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex w-full flex-wrap gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="associations">Associations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Contract Summary</CardTitle>
              <CardDescription>Key metrics and status</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Player</p>
                {contract.player ? (
                  <Link
                    href={`/super-admin/players/${contract.player.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contract.player.name}
                  </Link>
                ) : (
                  <p>Unknown player</p>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Status</p>
                <Badge variant="outline" className="capitalize">
                  {contract.status}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Start Date</p>
                <p>
                  {contract.startDate
                    ? format(new Date(contract.startDate), "PPP")
                    : "Not set"}
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">End Date</p>
                <p>
                  {contract.endDate
                    ? format(new Date(contract.endDate), "PPP")
                    : "Open-ended"}
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Salary</p>
                <p>
                  {contract.salary
                    ? `₦${Number(contract.salary).toLocaleString()}`
                    : "Not disclosed"}
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Created</p>
                <p>{format(new Date(contract.createdAt), "PPP")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="associations">
          <Card>
            <CardHeader>
              <CardTitle>Associated Entities</CardTitle>
              <CardDescription>Linked organization and team information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Organization</p>
                {contract.organization ? (
                  <Link
                    href={`/super-admin/organizations/${contract.organization.id}`}
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    {contract.organization.name}
                  </Link>
                ) : (
                  <p>None</p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">Team</p>
                {contract.team ? (
                  <Link
                    href={`/super-admin/teams/${contract.team.id}`}
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Users className="h-3.5 w-3.5" />
                    {contract.team.name}
                  </Link>
                ) : (
                  <p>Not assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

