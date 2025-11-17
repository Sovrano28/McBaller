import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import CreateTeamForm from "./create-team-form";
import {
  getOrganizationDivisions,
  getOrganizationAgeGroups,
  getOrganizationSeasons,
} from "@/lib/actions/teams";

export default async function CreateTeamPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const [divisions, ageGroups, seasons] = await Promise.all([
    getOrganizationDivisions(orgSession.organizationId),
    getOrganizationAgeGroups(orgSession.organizationId),
    getOrganizationSeasons(orgSession.organizationId),
  ]);

  return (
    <CreateTeamForm
      organizationId={orgSession.organizationId}
      divisions={divisions}
      ageGroups={ageGroups}
      seasons={seasons}
    />
  );
}

