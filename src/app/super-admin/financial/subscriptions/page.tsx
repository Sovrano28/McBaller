import { getSession } from "@/lib/actions/auth";
import { getAllSubscriptions } from "@/lib/actions/super-admin/financial";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, AlertTriangle } from "lucide-react";
import { format, isPast, isAfter, addDays } from "date-fns";

export default async function SubscriptionsManagementPage() {
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const { subscriptions, total } = await getAllSubscriptions({
    limit: 100,
  }).catch(() => ({ subscriptions: [], total: 0 }));

  const tierColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-800",
    pro: "bg-blue-100 text-blue-800",
    elite: "bg-purple-100 text-purple-800",
  };

  // Calculate subscription stats
  const activeSubscriptions = subscriptions.filter(s => 
    s.subscriptionExpiry && isAfter(new Date(s.subscriptionExpiry), new Date())
  );
  
  const expiringSubscriptions = subscriptions.filter(s => 
    s.subscriptionExpiry && 
    isAfter(new Date(s.subscriptionExpiry), new Date()) &&
    !isAfter(new Date(s.subscriptionExpiry), addDays(new Date(), 7))
  );

  const expiredSubscriptions = subscriptions.filter(s => 
    s.subscriptionExpiry && isPast(new Date(s.subscriptionExpiry))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage player subscriptions across the platform
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Total: {total}
        </Badge>
      </div>

      {/* Subscription Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">Expired subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro + Elite</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.subscriptionTier === "pro" || s.subscriptionTier === "elite").length}
            </div>
            <p className="text-xs text-muted-foreground">Premium subscribers</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            Complete list of player subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((sub) => {
                    const isExpired = sub.subscriptionExpiry && isPast(new Date(sub.subscriptionExpiry));
                    const isExpiring = sub.subscriptionExpiry && 
                      isAfter(new Date(sub.subscriptionExpiry), new Date()) &&
                      !isAfter(new Date(sub.subscriptionExpiry), addDays(new Date(), 7));
                    
                    return (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sub.name}</p>
                            <p className="text-xs text-muted-foreground">
                              @{sub.username}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{sub.user.email}</TableCell>
                        <TableCell>
                          <Badge className={tierColors[sub.subscriptionTier] || "bg-gray-100 text-gray-800"}>
                            {sub.subscriptionTier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sub.organization ? (
                            <span className="text-sm">{sub.organization.name}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Independent</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.subscriptionExpiry
                            ? format(new Date(sub.subscriptionExpiry), "MMM dd, yyyy")
                            : "No expiry"}
                        </TableCell>
                        <TableCell>
                          {isExpired ? (
                            <Badge className="bg-red-100 text-red-800">Expired</Badge>
                          ) : isExpiring ? (
                            <Badge className="bg-yellow-100 text-yellow-800">Expiring</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(sub.joinedAt), "MMM dd, yyyy")}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

