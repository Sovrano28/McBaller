// Mark all /super-admin routes as dynamic since they use cookies for authentication
export const dynamic = 'force-dynamic';

import { SuperAdminLayoutClient } from "./super-admin-layout-client";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <SuperAdminLayoutClient>{children}</SuperAdminLayoutClient>;
}

