// Mark all /org routes as dynamic since they use cookies for authentication
export const dynamic = 'force-dynamic';

import { OrgLayoutClient } from "./org-layout-client";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return <OrgLayoutClient>{children}</OrgLayoutClient>;
}
