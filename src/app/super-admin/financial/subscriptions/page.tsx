import { Suspense } from "react";
import { SubscriptionsClient } from "./subscriptions-client";

export default function SubscriptionsManagementPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Subscriptions Management</h1>
        <p className="text-muted-foreground">
          View and manage all subscriptions across the platform
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <SubscriptionsClient />
      </Suspense>
    </div>
  );
}
