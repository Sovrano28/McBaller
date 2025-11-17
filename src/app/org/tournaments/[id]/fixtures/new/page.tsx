import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import { getTournament } from "@/lib/actions/tournaments";
import { getOrganizationTeams } from "@/lib/actions/organizations";
import { getOrganizationVenues } from "@/lib/actions/venues";
import CreateFixtureForm from "./create-fixture-form";

export default async function CreateFixturePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const [tournament, teams, venues] = await Promise.all([
    getTournament(orgSession.organizationId, params.id),
    getOrganizationTeams(orgSession.organizationId).catch(() => []),
    getOrganizationVenues(orgSession.organizationId).catch(() => []),
  ]);

  return (
    <CreateFixtureForm
      tournament={tournament}
      teams={teams}
      venues={venues}
      organizationId={orgSession.organizationId}
    />
  );
}

