import { getSession } from "@/lib/actions/auth";
import {
  getOrganizationInvoices,
  updateOverdueInvoices,
} from "@/lib/actions/invoices";
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
import {
  Receipt,
  Plus,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default async function OrgInvoicesPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  // Update overdue invoices
  await updateOverdueInvoices(orgSession.organizationId);

  const invoices = await getOrganizationInvoices(orgSession.organizationId);

  const stats = {
    total: invoices.length,
    outstanding: invoices.filter(
      i => i.status === "sent" || i.status === "overdue"
    ).length,
    paid: invoices.filter(i => i.status === "paid").length,
    overdue: invoices.filter(i => i.status === "overdue").length,
    draft: invoices.filter(i => i.status === "draft").length,
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "sent":
        return "secondary";
      case "overdue":
        return "destructive";
      case "draft":
        return "outline";
      case "void":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return CheckCircle;
      case "overdue":
        return XCircle;
      case "sent":
        return Clock;
      default:
        return Receipt;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage invoices and billing</p>
        </div>
        <Button asChild>
          <Link href="/org/billing/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outstanding}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices by number or player name..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Invoices List */}
      {invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map(invoice => {
            const StatusIcon = getStatusIcon(invoice.status);
            const totalPaid =
              invoice.payments
                ?.filter(p => p.status === "succeeded")
                .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
            const isOverdue =
              invoice.status === "sent" &&
              new Date(invoice.dueDate) < new Date();

            return (
              <Card
                key={invoice.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/org/billing/invoices/${invoice.id}`}
                            className="font-medium hover:underline"
                          >
                            {invoice.invoiceNumber}
                          </Link>
                          <Badge variant={getStatusVariant(invoice.status)}>
                            {invoice.status}
                          </Badge>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.player ? (
                            <span>
                              {invoice.player.name} • Due:{" "}
                              {format(
                                new Date(invoice.dueDate),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          ) : (
                            <span>
                              General Invoice • Due:{" "}
                              {format(
                                new Date(invoice.dueDate),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {invoice.currency}{" "}
                          {Number(invoice.amount).toLocaleString()}
                        </div>
                        {invoice.status === "paid" && totalPaid > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Paid: {invoice.currency}{" "}
                            {totalPaid.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/org/billing/invoices/${invoice.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first invoice to get started
            </p>
            <Button asChild>
              <Link href="/org/billing/invoices/new">
                <Plus className="mr-2 h-4 w-4" />
                Create First Invoice
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
