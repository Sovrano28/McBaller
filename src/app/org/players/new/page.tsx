import { getSession } from "@/lib/actions/auth";
import { getOrganizationTeams } from "@/lib/actions/organizations";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import CreatePlayerForm from "./create-player-form";

export default async function CreatePlayerPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const teams = await getOrganizationTeams(orgSession.organizationId);

  return (
    <CreatePlayerForm
      organizationId={orgSession.organizationId}
      teams={teams}
    />
  );
}
