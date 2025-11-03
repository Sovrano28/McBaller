import { getSession } from "@/lib/actions/auth";
import {
  getOrganizationPayments,
  getPaymentStats,
} from "@/lib/actions/payments";
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
import { CreditCard, TrendingUp, Clock, XCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default async function OrgPaymentsPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const [payments, stats] = await Promise.all([
    getOrganizationPayments(orgSession.organizationId),
    getPaymentStats(orgSession.organizationId),
  ]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "succeeded":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      case "refunded":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getMethodVariant = (method: string) => {
    switch (method) {
      case "paystack":
        return "default";
      case "bank_transfer":
        return "secondary";
      case "mobile_money":
        return "outline";
      case "cash":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment History</h1>
        <p className="text-muted-foreground">
          View payment history and transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{stats.succeeded.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{stats.pending.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{stats.failed.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{stats.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search payments by invoice number or transaction ID..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Payments List */}
      {payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map(payment => (
            <Card
              key={payment.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/org/billing/invoices/${payment.invoice.id}`}
                          className="font-medium hover:underline"
                        >
                          {payment.invoice.invoiceNumber}
                        </Link>
                        <Badge variant={getStatusVariant(payment.status)}>
                          {payment.status}
                        </Badge>
                        <Badge
                          variant={getMethodVariant(payment.method)}
                          className="text-xs"
                        >
                          {payment.method.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.invoice.player ? (
                          <span>{payment.invoice.player.name} • </span>
                        ) : (
                          <span>General Invoice • </span>
                        )}
                        {payment.paidAt ? (
                          <span>
                            Paid:{" "}
                            {format(new Date(payment.paidAt), "MMM dd, yyyy")}
                          </span>
                        ) : (
                          <span>
                            Created:{" "}
                            {format(
                              new Date(payment.createdAt),
                              "MMM dd, yyyy"
                            )}
                          </span>
                        )}
                      </div>
                      {payment.transactionId && (
                        <div className="text-xs text-muted-foreground">
                          Transaction ID: {payment.transactionId}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {payment.invoice.currency}{" "}
                        {Number(payment.amount).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
            <p className="text-muted-foreground text-center">
              Payment history will appear here when invoices are paid
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
