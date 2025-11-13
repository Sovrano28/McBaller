import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import {
  getComplianceStats,
  getExpiredDocuments,
  getComplianceByOrganization,
  getRecentComplianceIssues,
} from "@/lib/actions/super-admin/compliance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, FileCheck, UserCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default async function CompliancePage() {
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const [stats, expiredDocs, complianceByOrg, recentIssues] = await Promise.all([
    getComplianceStats().catch(() => null),
    getExpiredDocuments(10).catch(() => []),
    getComplianceByOrganization().catch(() => []),
    getRecentComplianceIssues(10).catch(() => ({ expiredDocuments: [], pendingBackgroundChecks: [] })),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance Review</h1>
        <p className="text-muted-foreground">
          Monitor compliance, background checks, and document expiry across the platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Background Checks</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.backgroundChecks.pending ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending review • {stats?.backgroundChecks.approved ?? 0} approved • {stats?.backgroundChecks.rejected ?? 0} rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Documents</CardTitle>
            <FileCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.documents.expired ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention • {stats?.documents.expiring ?? 0} expiring soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waivers</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.waivers.signed ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Signed waivers • {stats?.waivers.pending ?? 0} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {expiredDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Expired Documents
            </CardTitle>
            <CardDescription>
              Documents that have passed their expiry date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Expired Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiredDocs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.category || doc.title}</TableCell>
                    <TableCell>{doc.user?.email ?? "—"}</TableCell>
                    <TableCell>{doc.organization?.name ?? "—"}</TableCell>
                    <TableCell className="text-red-600">
                      {doc.expiresAt ? format(new Date(doc.expiresAt), "PPP") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {recentIssues.pendingBackgroundChecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-yellow-600" />
              Pending Background Checks
            </CardTitle>
            <CardDescription>
              Background checks awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentIssues.pendingBackgroundChecks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell className="font-medium">
                      {check.user?.email ?? "—"}
                    </TableCell>
                    <TableCell>
                      {check.user?.organization?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {check.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(check.createdAt), "PPP")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Compliance Status by Organization</CardTitle>
          <CardDescription>
            Overview of compliance across all organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {complianceByOrg.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No compliance data available
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Expired Docs</TableHead>
                  <TableHead>Pending Checks</TableHead>
                  <TableHead>Compliance Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceByOrg.map((org) => (
                  <TableRow key={org.organizationId}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/super-admin/organizations/${org.organizationId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {org.organizationName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {org.organizationType}
                      </Badge>
                    </TableCell>
                    <TableCell>{org.totalUsers}</TableCell>
                    <TableCell>
                      {org.expiredDocuments > 0 ? (
                        <span className="text-red-600 font-medium">
                          {org.expiredDocuments}
                        </span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </TableCell>
                    <TableCell>{org.pendingBackgroundChecks}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {org.complianceScore >= 80 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : org.complianceScore >= 60 ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={org.complianceScore >= 80 ? "text-green-600" : org.complianceScore >= 60 ? "text-yellow-600" : "text-red-600"}>
                          {org.complianceScore}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

