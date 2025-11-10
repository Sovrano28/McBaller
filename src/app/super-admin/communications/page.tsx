import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions/auth";
import { CommunicationsClient } from "./communications-client";

export default async function SuperAdminCommunicationsPage() {
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  return <CommunicationsClient />;
}

