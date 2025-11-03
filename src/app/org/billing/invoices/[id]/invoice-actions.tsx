"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Send, Check, X, CreditCard } from "lucide-react";
import {
  sendInvoice,
  markInvoiceAsPaid,
  voidInvoice,
} from "@/lib/actions/invoices";

interface InvoiceActionsProps {
  invoice: any;
  organizationId: string;
}

export default function InvoiceActions({
  invoice,
  organizationId,
}: InvoiceActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [sendOpen, setSendOpen] = useState(false);
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    setIsLoading(true);
    try {
      const result = await sendInvoice(organizationId, invoice.id);

      if (result.success) {
        toast({
          title: "Invoice Sent",
          description: "Invoice has been marked as sent",
        });
        setSendOpen(false);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to send invoice",
        });
      }
    } catch (error) {
      console.error("Send invoice error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    setIsLoading(true);
    try {
      const result = await markInvoiceAsPaid(
        organizationId,
        invoice.id,
        new Date()
      );

      if (result.success) {
        toast({
          title: "Invoice Marked as Paid",
          description: "Invoice has been marked as paid",
        });
        setMarkPaidOpen(false);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to mark invoice as paid",
        });
      }
    } catch (error) {
      console.error("Mark invoice as paid error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoid = async () => {
    setIsLoading(true);
    try {
      const result = await voidInvoice(organizationId, invoice.id);

      if (result.success) {
        toast({
          title: "Invoice Voided",
          description: "Invoice has been voided",
        });
        setVoidOpen(false);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to void invoice",
        });
      }
    } catch (error) {
      console.error("Void invoice error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canSend = invoice.status === "draft";
  const canMarkPaid = invoice.status === "sent" || invoice.status === "overdue";
  const canVoid = invoice.status !== "paid" && invoice.status !== "void";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
        <CardDescription>Manage this invoice</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          {canSend && (
            <Dialog open={sendOpen} onOpenChange={setSendOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Send className="mr-2 h-4 w-4" />
                  Send Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Invoice</DialogTitle>
                  <DialogDescription>
                    Mark this invoice as sent to the recipient
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSendOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSend} disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Invoice"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {canMarkPaid && (
            <Dialog open={markPaidOpen} onOpenChange={setMarkPaidOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Paid
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark Invoice as Paid</DialogTitle>
                  <DialogDescription>
                    Manually mark this invoice as paid (for offline payments)
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setMarkPaidOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleMarkPaid} disabled={isLoading}>
                    {isLoading ? "Marking..." : "Mark as Paid"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {canVoid && (
            <Dialog open={voidOpen} onOpenChange={setVoidOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <X className="mr-2 h-4 w-4" />
                  Void Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Void Invoice</DialogTitle>
                  <DialogDescription>
                    This will void the invoice. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setVoidOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleVoid}
                    disabled={isLoading}
                  >
                    {isLoading ? "Voiding..." : "Void Invoice"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Pay Button (Disabled - Coming Soon) */}
          {invoice.status !== "paid" && invoice.status !== "void" && (
            <Button variant="outline" disabled>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay (Coming Soon)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
