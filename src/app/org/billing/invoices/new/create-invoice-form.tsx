"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { createInvoice } from "@/lib/actions/invoices";
import { addDays } from "date-fns";

interface CreateInvoiceFormProps {
  players: any[];
  organizationId: string;
  defaultInvoiceNumber: string;
}

export default function CreateInvoiceForm({
  players,
  organizationId,
  defaultInvoiceNumber,
}: CreateInvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const defaultDueDate = addDays(new Date(), 30).toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    invoiceNumber: defaultInvoiceNumber,
    playerId: "",
    amount: "",
    dueDate: defaultDueDate,
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createInvoice(organizationId, {
        invoiceNumber: formData.invoiceNumber,
        playerId: formData.playerId || undefined,
        amount: parseFloat(formData.amount),
        currency: "NGN",
        dueDate: new Date(formData.dueDate),
        description: formData.description || undefined,
      });

      if (result.success && result.invoice) {
        toast({
          title: "Invoice Created",
          description: "Invoice has been created successfully",
        });
        router.push(`/org/billing/invoices/${result.invoice.id}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create invoice",
        });
      }
    } catch (error) {
      console.error("Create invoice error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/org/billing/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Invoice</h1>
          <p className="text-muted-foreground">Create a new invoice</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Enter the invoice information below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                <Input
                  id="invoiceNumber"
                  placeholder="INV-YYYYMMDD-0001"
                  value={formData.invoiceNumber}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      invoiceNumber: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="playerId">Recipient</Label>
                <Select
                  value={formData.playerId}
                  onValueChange={value =>
                    setFormData({ ...formData, playerId: value })
                  }
                >
                  <SelectTrigger id="playerId">
                    <SelectValue placeholder="Select a player (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General Invoice</SelectItem>
                    {players.map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} - {player.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Optional: Leave empty for general organization invoice
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (₦) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={e =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Invoice description (optional)"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Invoice"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/org/billing/invoices">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
