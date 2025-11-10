import { Suspense } from "react";
import { AgentsClient } from "./agents-client";

export default function AgentsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Agents Management</h1>
        <p className="text-muted-foreground">
          View and manage all agents (coaches, analysts, finance staff)
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <AgentsClient />
      </Suspense>
    </div>
  );
}

