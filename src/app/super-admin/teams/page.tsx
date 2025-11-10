import { Suspense } from "react";
import { TeamsClient } from "./teams-client";

export default function TeamsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Teams Management</h1>
        <p className="text-muted-foreground">
          View and manage all teams across organizations
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <TeamsClient />
      </Suspense>
    </div>
  );
}

