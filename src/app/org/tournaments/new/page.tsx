import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import CreateTournamentForm from "./create-tournament-form";
import { getOrganizationSeasons } from "@/lib/actions/teams";

export default async function CreateTournamentPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const seasons = await getOrganizationSeasons(orgSession.organizationId);

  return (
    <CreateTournamentForm
      organizationId={orgSession.organizationId}
      seasons={seasons}
    />
  );
}
