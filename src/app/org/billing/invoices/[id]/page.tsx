import { getInvoice } from "@/lib/actions/invoices";
import { getSession } from "@/lib/actions/auth";
import { redirect, notFound } from "next/navigation";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Receipt, Calendar, DollarSign, User } from "lucide-react";
import { format } from "date-fns";
import InvoiceActions from "./invoice-actions";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  let invoice;
  try {
    invoice = await getInvoice(orgSession.organizationId, id);
  } catch (error) {
    notFound();
  }

  if (!invoice) {
    notFound();
  }

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

  const isOverdue =
    invoice.status === "sent" && new Date(invoice.dueDate) < new Date();

  const totalPaid =
    invoice.payments
      ?.filter(p => p.status === "succeeded")
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const remaining = Number(invoice.amount) - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/org/billing/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Invoice Details</h1>
            <p className="text-muted-foreground">
              Invoice Number: {invoice.invoiceNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(invoice.status)} className="text-sm">
            {invoice.status}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-sm">
              Overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Invoice Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recipient</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.player ? (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={invoice.player.avatar || undefined} />
                  <AvatarFallback>
                    {invoice.player.name
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/org/players/${invoice.player.id}`}
                    className="font-medium hover:underline"
                  >
                    {invoice.player.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {invoice.player.email}
                  </p>
                </div>
              </div>
            ) : (
              <p className="font-medium">General Invoice</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{invoice.organization.name}</p>
            <p className="text-sm text-muted-foreground">
              {invoice.organization.email}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Due Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">
                {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
              </p>
            </div>
            {isOverdue && (
              <p className="text-sm text-destructive mt-1">Overdue</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Amount */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Amount</CardTitle>
          <CardDescription>Total amount and payment status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">
                  {invoice.currency} {Number(invoice.amount).toLocaleString()}
                </p>
              </div>
            </div>
            {invoice.status === "paid" && (
              <Badge variant="default" className="text-sm">
                Paid
              </Badge>
            )}
            {totalPaid > 0 && invoice.status !== "paid" && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="font-medium">
                  {invoice.currency} {totalPaid.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="font-medium">
                  {invoice.currency} {remaining.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <InvoiceActions
        invoice={invoice}
        organizationId={orgSession.organizationId}
      />

      {/* Payment History */}
      {invoice.payments && invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              Payment attempts and transactions for this invoice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoice.payments.map(payment => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div>
                      <p className="font-medium">
                        {invoice.currency}{" "}
                        {Number(payment.amount).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {payment.method}
                        </Badge>
                        <Badge
                          variant={
                            payment.status === "succeeded"
                              ? "default"
                              : payment.status === "failed"
                              ? "destructive"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                    {payment.paidAt && (
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.paidAt), "MMM dd, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>
            Created:{" "}
            {format(new Date(invoice.createdAt), "MMM dd, yyyy 'at' h:mm a")}
          </p>
          <p>
            Last Updated:{" "}
            {format(new Date(invoice.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
          </p>
          {invoice.paidAt && (
            <p>
              Paid:{" "}
              {format(new Date(invoice.paidAt), "MMM dd, yyyy 'at' h:mm a")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
