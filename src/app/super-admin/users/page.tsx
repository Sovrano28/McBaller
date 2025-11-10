import { Suspense } from "react";
import { UsersClient } from "./users-client";

export default function UsersManagementPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">
          View and manage all users across the platform
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <UsersClient />
      </Suspense>
    </div>
  );
}

