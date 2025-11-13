import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import CreateVenueForm from "./create-venue-form";

export default async function NewVenuePage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  return <CreateVenueForm organizationId={orgSession.organizationId} />;
}

