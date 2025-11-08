import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  type?: "default" | "invoice" | "contract" | "subscription" | "payment" | "check";
}

export function StatusBadge({ status, type = "default" }: StatusBadgeProps) {
  const getStatusColor = () => {
    const statusLower = status.toLowerCase();

    // Invoice statuses
    if (type === "invoice") {
      if (statusLower === "paid") return "bg-green-100 text-green-800 hover:bg-green-100";
      if (statusLower === "sent") return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      if (statusLower === "overdue") return "bg-red-100 text-red-800 hover:bg-red-100";
      if (statusLower === "draft") return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      if (statusLower === "void") return "bg-slate-100 text-slate-800 hover:bg-slate-100";
    }

    // Contract statuses
    if (type === "contract") {
      if (statusLower === "active") return "bg-green-100 text-green-800 hover:bg-green-100";
      if (statusLower === "expired") return "bg-red-100 text-red-800 hover:bg-red-100";
      if (statusLower === "terminated") return "bg-slate-100 text-slate-800 hover:bg-slate-100";
    }

    // Subscription/Payment statuses
    if (type === "subscription" || type === "payment") {
      if (statusLower === "active" || statusLower === "succeeded") return "bg-green-100 text-green-800 hover:bg-green-100";
      if (statusLower === "expired" || statusLower === "failed") return "bg-red-100 text-red-800 hover:bg-red-100";
      if (statusLower === "expiring" || statusLower === "pending") return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      if (statusLower === "refunded") return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    }

    // Background check statuses
    if (type === "check") {
      if (statusLower === "passed") return "bg-green-100 text-green-800 hover:bg-green-100";
      if (statusLower === "failed") return "bg-red-100 text-red-800 hover:bg-red-100";
      if (statusLower === "pending" || statusLower === "in_progress") return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      if (statusLower === "expired") return "bg-orange-100 text-orange-800 hover:bg-orange-100";
    }

    // Default colors
    if (statusLower === "active" || statusLower === "completed" || statusLower === "verified") {
      return "bg-green-100 text-green-800 hover:bg-green-100";
    }
    if (statusLower === "pending" || statusLower === "in_progress") {
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    }
    if (statusLower === "inactive" || statusLower === "cancelled" || statusLower === "rejected") {
      return "bg-red-100 text-red-800 hover:bg-red-100";
    }

    return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  };

  return (
    <Badge className={getStatusColor()}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

