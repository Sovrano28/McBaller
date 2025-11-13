import { getOrganizationPlayers, getOrganizationTeams } from "@/lib/actions/organizations";
import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PlayersClient } from "./players-client";

export default async function OrgPlayersPage() {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Players</h1>
          <p className="text-muted-foreground">
            Manage all players in your organization
          </p>
        </div>
        <Button asChild>
          <Link href="/org/players/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Player
          </Link>
        </Button>
      </div>

      <PlayersClient
        players={players}
        teams={teams.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
