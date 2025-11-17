import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import type { PlayerAuthData } from "@/lib/auth-types";
import { getPlayerEvents } from "@/lib/actions/events";
import CalendarClient from "./calendar-client";

export default async function CalendarPage() {
  const session = await getSession();

  if (!session || session.role !== "player") {
    redirect("/login");
  }

  const playerSession = session as PlayerAuthData;
  if (!playerSession.playerId) {
    redirect("/login");
  }

  // Get events for the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const events = await getPlayerEvents(playerSession.playerId, {
    startDate: startOfMonth,
    endDate: endOfMonth,
  });

  return <CalendarClient events={events} />;
}

