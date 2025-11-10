import { Suspense } from "react";
import { InvoicesClient } from "./invoices-client";

export default function InvoicesManagementPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Invoices Management</h1>
        <p className="text-muted-foreground">
          View and manage all invoices across the platform
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <InvoicesClient />
      </Suspense>
    </div>
  );
}
