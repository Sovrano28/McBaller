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
import { Search, Filter, X, Receipt, Plus } from "lucide-react";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: Date | string;
  createdAt: Date | string;
  player?: {
    name: string;
  } | null;
  payments?: Array<{
    amount: number;
    status: string;
  }>;
}

interface InvoicesClientProps {
  invoices: Invoice[];
}

export function InvoicesClient({ invoices }: InvoicesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [amountRangeFilter, setAmountRangeFilter] = useState<string>("all");

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.player?.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRangeFilter !== "all") {
        const invoiceDate = new Date(invoice.createdAt);
        const now = new Date();
        const daysAgo = (days: number) => {
          const date = new Date();
          date.setDate(date.getDate() - days);
          return date;
        };

        switch (dateRangeFilter) {
          case "today":
            matchesDateRange = invoiceDate.toDateString() === now.toDateString();
            break;
          case "week":
            matchesDateRange = invoiceDate >= daysAgo(7);
            break;
          case "month":
            matchesDateRange = invoiceDate >= daysAgo(30);
            break;
          case "year":
            matchesDateRange = invoiceDate >= daysAgo(365);
            break;
        }
      }

      // Amount range filter
      let matchesAmountRange = true;
      if (amountRangeFilter !== "all") {
        const amount = Number(invoice.amount);
        switch (amountRangeFilter) {
          case "0-10000":
            matchesAmountRange = amount >= 0 && amount <= 10000;
            break;
          case "10000-50000":
            matchesAmountRange = amount > 10000 && amount <= 50000;
            break;
          case "50000-100000":
            matchesAmountRange = amount > 50000 && amount <= 100000;
            break;
          case "100000+":
            matchesAmountRange = amount > 100000;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesDateRange && matchesAmountRange;
    });
  }, [invoices, searchQuery, statusFilter, dateRangeFilter, amountRangeFilter]);

  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    dateRangeFilter !== "all" ||
    amountRangeFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateRangeFilter("all");
    setAmountRangeFilter("all");
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
        return "✓";
      case "overdue":
        return "⚠";
      case "sent":
        return "⏱";
      default:
        return "📄";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices by number or player name..."
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="void">Void</SelectItem>
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

          <Select value={amountRangeFilter} onValueChange={setAmountRangeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by amount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Amounts</SelectItem>
              <SelectItem value="0-10000">₦0 - ₦10,000</SelectItem>
              <SelectItem value="10000-50000">₦10,000 - ₦50,000</SelectItem>
              <SelectItem value="50000-100000">₦50,000 - ₦100,000</SelectItem>
              <SelectItem value="100000+">₦100,000+</SelectItem>
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
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </div>
        )}
      </div>

      {/* Invoices List */}
      {filteredInvoices.length > 0 ? (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => {
            const totalPaid =
              invoice.payments
                ?.filter((p) => p.status === "succeeded")
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
                  <div className="flex items-center justify-between gap-4">
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
                            {getStatusIcon(invoice.status)} {invoice.status}
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
                              {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                            </span>
                          ) : (
                            <span>
                              General Invoice • Due:{" "}
                              {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right min-w-[120px]">
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
                    <Button variant="outline" size="sm" asChild className="ml-4">
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
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters ? "No invoices match your filters" : "No invoices yet"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters to see more results"
                : "Create your first invoice to get started"}
            </p>
            {!hasActiveFilters && (
              <Button asChild>
                <Link href="/org/billing/invoices/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Invoice
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

