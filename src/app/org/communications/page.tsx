import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions/auth";
import { CommunicationsClient } from "../../super-admin/communications/communications-client";

export default async function OrgCommunicationsPage() {
  const session = await getSession();

  if (!session || session.role === "player" || session.role === "super_admin") {
    redirect("/login");
  }

  return <CommunicationsClient />;
}

