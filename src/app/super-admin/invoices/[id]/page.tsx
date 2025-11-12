import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";

import { getSession } from "@/lib/actions/auth";
import { getInvoiceDetails } from "@/lib/actions/super-admin/financial";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Users, CreditCard } from "lucide-react";

export default async function SuperAdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const invoice = await getInvoiceDetails(id).catch(() => null);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/super-admin/financial/invoices"
        title={`Invoice ${invoice.invoiceNumber}`}
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {invoice.status}
            </Badge>
            <span>&middot;</span>
            <span>Created {format(new Date(invoice.createdAt), "PPP")}</span>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Billing Details</CardTitle>
            <CardDescription>Who this invoice is billed to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Organization</p>
              {invoice.organization ? (
                <Link
                  href={`/super-admin/organizations/${invoice.organization.id}`}
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  {invoice.organization.name}
                </Link>
              ) : (
                <p>None</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Player</p>
              {invoice.player ? (
                <Link
                  href={`/super-admin/players/${invoice.player.id}`}
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Users className="h-3.5 w-3.5" />
                  {invoice.player.name}
                </Link>
              ) : (
                <p>Not associated</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
            <CardDescription>Key financial information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold">
                ₦{Number(invoice.amount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Currency</p>
              <p>{invoice.currency}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Due Date</p>
              <p>
                {invoice.dueDate
                  ? format(new Date(invoice.dueDate), "PPP")
                  : "No due date"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Paid At</p>
              <p>
                {invoice.paidAt
                  ? format(new Date(invoice.paidAt), "PPP")
                  : "Not paid"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>Transactions recorded for this invoice</CardDescription>
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>{payment.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      ₦{Number(payment.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="capitalize">{payment.method}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.paidAt
                        ? format(new Date(payment.paidAt), "PPP")
                        : "Pending"}
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

