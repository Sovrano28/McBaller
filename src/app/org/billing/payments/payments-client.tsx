"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  status: string;
  method: string;
  transactionId?: string | null;
  paidAt?: Date | string | null;
  createdAt: Date | string;
  invoice: {
    id: string;
    invoiceNumber: string;
    currency: string;
    player?: {
      name: string;
    } | null;
  };
}

interface PaymentsClientProps {
  payments: Payment[];
}

export function PaymentsClient({ payments }: PaymentsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        payment.invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.invoice.player?.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;

      // Method filter
      const matchesMethod = methodFilter === "all" || payment.method === methodFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRangeFilter !== "all") {
        const paymentDate = payment.paidAt ? new Date(payment.paidAt) : new Date(payment.createdAt);
        const now = new Date();
        const daysAgo = (days: number) => {
          const date = new Date();
          date.setDate(date.getDate() - days);
          return date;
        };

        switch (dateRangeFilter) {
          case "today":
            matchesDateRange = paymentDate.toDateString() === now.toDateString();
            break;
          case "week":
            matchesDateRange = paymentDate >= daysAgo(7);
            break;
          case "month":
            matchesDateRange = paymentDate >= daysAgo(30);
            break;
          case "year":
            matchesDateRange = paymentDate >= daysAgo(365);
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesMethod && matchesDateRange;
    });
  }, [payments, searchQuery, statusFilter, methodFilter, dateRangeFilter]);

  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    methodFilter !== "all" ||
    dateRangeFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setMethodFilter("all");
    setDateRangeFilter("all");
  };

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

  const methods = Array.from(new Set(payments.map((p) => p.method).filter(Boolean)));

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search payments by invoice number or transaction ID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {methods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
        )}
      </div>

      {/* Payments List */}
      {filteredPayments.length > 0 ? (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
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
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters ? "No payments match your filters" : "No payments yet"}
            </h3>
            <p className="text-muted-foreground text-center">
              {hasActiveFilters
                ? "Try adjusting your filters to see more results"
                : "Payment history will appear here when invoices are paid"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

