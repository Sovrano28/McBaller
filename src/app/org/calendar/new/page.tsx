import { getSession } from "@/lib/actions/auth";
import { getOrganizationTeams } from "@/lib/actions/organizations";
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

  let teams;
  try {
    teams = await getOrganizationTeams(orgSession.organizationId);
  } catch (error) {
    teams = [];
  }

  return <CreateEventForm teams={teams} organizationId={orgSession.organizationId} />;
}
