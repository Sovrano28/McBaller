import { getSession } from "@/lib/actions/auth";
import { getEvent } from "@/lib/actions/events";
import { getOrganizationTeams } from "@/lib/actions/organizations";
import { redirect, notFound } from "next/navigation";
import EditEventForm from "./edit-event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as any;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  let event;
  try {
    event = await getEvent(orgSession.organizationId, id);
  } catch (error) {
    notFound();
  }

  const teams = await getOrganizationTeams(orgSession.organizationId).catch(
    () => []
  );

  return (
    <EditEventForm
      event={event}
      teams={teams}
      organizationId={orgSession.organizationId}
    />
  );
}
