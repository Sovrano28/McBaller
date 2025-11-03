import { getSession } from "@/lib/actions/auth";
import {
  getOrganizationPlayers,
  getOrganizationTeams,
} from "@/lib/actions/organizations";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import CreateContractForm from "./create-contract-form";

export default async function CreateContractPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const [players, teams] = await Promise.all([
    getOrganizationPlayers(orgSession.organizationId),
    getOrganizationTeams(orgSession.organizationId),
  ]);

  return (
    <CreateContractForm
      players={players}
      teams={teams}
      organizationId={orgSession.organizationId}
    />
  );
}
