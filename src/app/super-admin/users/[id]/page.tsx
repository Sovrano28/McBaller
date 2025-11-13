import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";

import { getSession } from "@/lib/actions/auth";
import { getUserDetails } from "@/lib/actions/super-admin/users";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, UserRound, FileText } from "lucide-react";
import { UserStatusButton } from "@/components/super-admin/user-status-button";

export default async function SuperAdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const user = await getUserDetails(id).catch(() => null);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/super-admin/users"
        title={user.email}
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {user.role}
            </Badge>
            <span>&middot;</span>
            <span>Created {format(new Date(user.createdAt), "PPP")}</span>
            {user.organization && (
              <>
                <span>&middot;</span>
                <Link
                  href={`/super-admin/organizations/${user.organization.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  {user.organization.name}
                </Link>
              </>
            )}
          </div>
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex w-full flex-wrap gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="player">Player Profile</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Details</CardTitle>
                  <CardDescription>Core account information</CardDescription>
                </div>
                <UserStatusButton
                  userId={user.id}
                  isActive={user.isActive ?? true}
                  userEmail={user.email}
                />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={user.isActive === false ? "destructive" : "default"}>
                  {user.isActive === false ? "Inactive" : "Active"}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Last Login</p>
                <p>
                  {user.lastLoginAt
                    ? format(new Date(user.lastLoginAt), "PPp")
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Updated</p>
                <p>{format(new Date(user.updatedAt), "PPP")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Organization</p>
                {user.organization ? (
                  <Link
                    href={`/super-admin/organizations/${user.organization.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {user.organization.name}
                  </Link>
                ) : (
                  <p>None</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="player">
          <Card>
            <CardHeader>
              <CardTitle>Player Profile</CardTitle>
              <CardDescription>
                Details if this user is linked to a player account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!user.player ? (
                <p className="text-sm text-muted-foreground">
                  No player profile associated with this user.
                </p>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <Link
                        href={`/super-admin/players/${user.player.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {user.player.name}
                      </Link>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Username</p>
                      <p>@{user.player.username}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tier</p>
                      <Badge variant="outline">{user.player.subscriptionTier}</Badge>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Contracts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.player.contracts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No contracts found.
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Organization</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Start</TableHead>
                              <TableHead>End</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {user.player.contracts.map((contract) => (
                              <TableRow key={contract.id}>
                                <TableCell>{contract.organization?.name ?? "—"}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">
                                    {contract.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {contract.startDate
                                    ? format(new Date(contract.startDate), "PPP")
                                    : "—"}
                                </TableCell>
                                <TableCell>
                                  {contract.endDate
                                    ? format(new Date(contract.endDate), "PPP")
                                    : "Open-ended"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>User actions recorded in the audit trail</CardDescription>
            </CardHeader>
            <CardContent>
              {user.auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity recorded.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="capitalize">{log.action}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserRound className="h-4 w-4 text-muted-foreground" />
                            <span>{log.entityType}</span>
                            {log.entityId && (
                              <Badge variant="outline" className="uppercase">
                                {log.entityId}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(log.createdAt), "PPp")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

