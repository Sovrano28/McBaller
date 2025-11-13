"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, FileSearch } from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  createdAt: Date | string;
  user?: {
    email: string;
  } | null;
  metadata?: any;
}

interface AuditClientProps {
  logs: AuditLog[];
}

export function AuditClient({ logs }: AuditClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(log.metadata || {}).toLowerCase().includes(searchQuery.toLowerCase());

      // Action filter
      const matchesAction = actionFilter === "all" || log.action === actionFilter;

      // Entity type filter
      const matchesEntityType = entityTypeFilter === "all" || log.entityType === entityTypeFilter;

      // User filter
      const matchesUser = userFilter === "all" || log.user?.email === userFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRangeFilter !== "all") {
        const logDate = new Date(log.createdAt);
        const now = new Date();
        const daysAgo = (days: number) => {
          const date = new Date();
          date.setDate(date.getDate() - days);
          return date;
        };

        switch (dateRangeFilter) {
          case "today":
            matchesDateRange = logDate.toDateString() === now.toDateString();
            break;
          case "week":
            matchesDateRange = logDate >= daysAgo(7);
            break;
          case "month":
            matchesDateRange = logDate >= daysAgo(30);
            break;
          case "year":
            matchesDateRange = logDate >= daysAgo(365);
            break;
        }
      }

      return matchesSearch && matchesAction && matchesEntityType && matchesUser && matchesDateRange;
    });
  }, [logs, searchQuery, actionFilter, entityTypeFilter, dateRangeFilter, userFilter]);

  const hasActiveFilters =
    searchQuery !== "" ||
    actionFilter !== "all" ||
    entityTypeFilter !== "all" ||
    dateRangeFilter !== "all" ||
    userFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setActionFilter("all");
    setEntityTypeFilter("all");
    setDateRangeFilter("all");
    setUserFilter("all");
  };

  const actionColors: Record<string, string> = {
    create: "bg-green-100 text-green-800",
    update: "bg-blue-100 text-blue-800",
    delete: "bg-red-100 text-red-800",
    view: "bg-gray-100 text-gray-800",
    export: "bg-purple-100 text-purple-800",
    activate: "bg-green-100 text-green-800",
    deactivate: "bg-red-100 text-red-800",
  };

  const actions = Array.from(new Set(logs.map((l) => l.action).filter(Boolean)));
  const entityTypes = Array.from(new Set(logs.map((l) => l.entityType).filter(Boolean)));
  const users = Array.from(
    new Set(logs.map((l) => l.user?.email).filter(Boolean))
  ) as string[];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search logs by entity ID, type, or description..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((email) => (
                <SelectItem key={email} value={email}>
                  {email}
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
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        )}
      </div>

      {/* Audit Logs List */}
      {filteredLogs.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              {hasActiveFilters
                ? `Showing ${filteredLogs.length} filtered logs`
                : `Last ${filteredLogs.length} actions in your organization`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={
                          actionColors[log.action] || "bg-gray-100 text-gray-800"
                        }
                      >
                        {log.action}
                      </Badge>
                      <span className="font-medium">{log.entityType}</span>
                      {log.entityId && (
                        <span className="text-sm text-muted-foreground">
                          (ID: {log.entityId})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {log.user?.email || "System"} •{" "}
                      {format(new Date(log.createdAt), "PPp")}
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileSearch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters ? "No logs match your filters" : "No Audit Logs"}
            </h3>
            <p className="text-muted-foreground text-center">
              {hasActiveFilters
                ? "Try adjusting your filters to see more results"
                : "Activity logs will appear here as actions are performed"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

