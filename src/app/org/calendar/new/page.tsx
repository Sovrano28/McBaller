import { getSession } from "@/lib/actions/auth";
import { getOrganizationTeams } from "@/lib/actions/organizations";
import { getOrganizationVenues } from "@/lib/actions/venues";
import { redirect } from "next/navigation";
import CreateEventForm from "./create-event-form";

export default async function NewEventPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as any;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const [teams, venues] = await Promise.all([
    getOrganizationTeams(orgSession.organizationId).catch(() => []),
    getOrganizationVenues(orgSession.organizationId).catch(() => []),
  ]);

  return (
    <CreateEventForm
      teams={teams}
      venues={venues}
      organizationId={orgSession.organizationId}
    />
  );
}
