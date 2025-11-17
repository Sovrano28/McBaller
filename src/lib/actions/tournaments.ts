"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface CreateTournamentData {
  name: string;
  description?: string;
  type?: "knockout" | "round_robin" | "group_stage" | "bracket";
  startDate: Date;
  endDate?: Date;
  seasonId?: string;
  bracketData?: any;
  pools?: any;
  settings?: any;
}

export interface CreateFixtureData {
  tournamentId: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  scheduledAt: Date;
  venueId?: string;
  round?: string;
  metadata?: any;
}

export interface UpdateTournamentData extends Partial<CreateTournamentData> {
  status?: "upcoming" | "in_progress" | "completed" | "cancelled";
}

export async function getOrganizationTournaments(
  organizationId: string,
  filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }
) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const where: any = {
    organizationId,
  };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.startDate || filters?.endDate) {
    where.startDate = {};
    if (filters.startDate) {
      where.startDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.startDate.lte = filters.endDate;
    }
  }

  const tournaments = await prisma.tournament.findMany({
    where,
    include: {
      season: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      fixtures: {
        include: {
          homeTeam: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          awayTeam: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          venue: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
        orderBy: {
          scheduledAt: "asc",
        },
      },
      _count: {
        select: {
          fixtures: true,
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return tournaments;
}

export async function getTournament(
  organizationId: string,
  tournamentId: string
) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // For players, check if they have access via their teams
  if (session.role === "player") {
    // Get player's teams
    const player = await prisma.player.findUnique({
      where: { userId: session.userId },
      include: {
        contracts: {
          where: { status: "active" },
          select: { teamId: true },
        },
      },
    });

    if (!player) {
      throw new Error("Player not found");
    }

    const teamIds = player.contracts.map((c) => c.teamId);
    const teams = await prisma.team.findMany({
      where: { id: { in: teamIds } },
      select: { organizationId: true },
    });

    const orgIds = [...new Set(teams.map((t) => t.organizationId))];
    if (!orgIds.includes(organizationId)) {
      throw new Error("Forbidden");
    }
  } else {
    const orgSession = session as OrgAuthData;
    if (orgSession.organizationId !== organizationId) {
      throw new Error("Forbidden");
    }
  }

  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      organizationId,
    },
    include: {
      season: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      fixtures: {
        include: {
          homeTeam: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          awayTeam: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          venue: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true,
            },
          },
        },
        orderBy: {
          scheduledAt: "asc",
        },
      },
      _count: {
        select: {
          fixtures: true,
        },
      },
    },
  });

  if (!tournament) {
    throw new Error("Tournament not found");
  }

  return tournament;
}

export async function createTournament(
  organizationId: string,
  data: CreateTournamentData
) {
  const session = await getSession();
  if (!session || session.role === "player") {
    return { success: false, error: "Unauthorized" };
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    return { success: false, error: "Forbidden" };
  }

  try {
    // Validate season belongs to organization if provided
    if (data.seasonId) {
      const season = await prisma.season.findFirst({
        where: {
          id: data.seasonId,
          organizationId,
        },
      });

      if (!season) {
        return { success: false, error: "Invalid season" };
      }
    }

    const tournament = await prisma.tournament.create({
      data: {
        organizationId,
        createdById: orgSession.userId,
        name: data.name,
        description: data.description,
        type: data.type || "knockout",
        startDate: data.startDate,
        endDate: data.endDate,
        seasonId: data.seasonId,
        bracketData: data.bracketData,
        pools: data.pools,
        settings: data.settings,
      },
      include: {
        season: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return { success: true, tournament };
  } catch (error: any) {
    console.error("Create tournament error:", error);
    return {
      success: false,
      error: error.message || "Failed to create tournament",
    };
  }
}

export async function updateTournament(
  organizationId: string,
  tournamentId: string,
  data: UpdateTournamentData
) {
  const session = await getSession();
  if (!session || session.role === "player") {
    return { success: false, error: "Unauthorized" };
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    return { success: false, error: "Forbidden" };
  }

  try {
    // Verify tournament exists and belongs to organization
    const existingTournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        organizationId,
      },
    });

    if (!existingTournament) {
      return { success: false, error: "Tournament not found" };
    }

    // Validate season if provided
    if (data.seasonId) {
      const season = await prisma.season.findFirst({
        where: {
          id: data.seasonId,
          organizationId,
        },
      });

      if (!season) {
        return { success: false, error: "Invalid season" };
      }
    }

    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        seasonId: data.seasonId,
        bracketData: data.bracketData,
        pools: data.pools,
        settings: data.settings,
      },
      include: {
        season: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return { success: true, tournament };
  } catch (error: any) {
    console.error("Update tournament error:", error);
    return {
      success: false,
      error: error.message || "Failed to update tournament",
    };
  }
}

export async function deleteTournament(
  organizationId: string,
  tournamentId: string
) {
  const session = await getSession();
  if (!session || session.role === "player") {
    return { success: false, error: "Unauthorized" };
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    return { success: false, error: "Forbidden" };
  }

  try {
    // Verify tournament exists and belongs to organization
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        organizationId,
      },
    });

    if (!tournament) {
      return { success: false, error: "Tournament not found" };
    }

    await prisma.tournament.delete({
      where: { id: tournamentId },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete tournament error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete tournament",
    };
  }
}

export async function createTournamentFixture(
  organizationId: string,
  data: CreateFixtureData
) {
  const session = await getSession();
  if (!session || session.role === "player") {
    return { success: false, error: "Unauthorized" };
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    return { success: false, error: "Forbidden" };
  }

  try {
    // Verify tournament exists and belongs to organization
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: data.tournamentId,
        organizationId,
      },
      include: {
        fixtures: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!tournament) {
      return { success: false, error: "Tournament not found" };
    }

    // Validate teams belong to organization if provided
    if (data.homeTeamId) {
      const team = await prisma.team.findFirst({
        where: {
          id: data.homeTeamId,
          organizationId,
        },
      });
      if (!team) {
        return { success: false, error: "Home team not found" };
      }
    }

    if (data.awayTeamId) {
      const team = await prisma.team.findFirst({
        where: {
          id: data.awayTeamId,
          organizationId,
        },
      });
      if (!team) {
        return { success: false, error: "Away team not found" };
      }
    }

    // Validate venue belongs to organization if provided
    if (data.venueId) {
      const venue = await prisma.venue.findFirst({
        where: {
          id: data.venueId,
          organizationId,
        },
      });
      if (!venue) {
        return { success: false, error: "Venue not found" };
      }
    }

    // Create fixture
    const fixture = await prisma.fixture.create({
      data: {
        tournamentId: data.tournamentId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        homeTeamName: data.homeTeamName,
        awayTeamName: data.awayTeamName,
        scheduledAt: data.scheduledAt,
        venueId: data.venueId,
        round: data.round,
        metadata: data.metadata,
      },
    });

    // Create corresponding event for the fixture
    const eventTitle = data.homeTeamName && data.awayTeamName
      ? `${data.homeTeamName} vs ${data.awayTeamName}`
      : tournament.name;

    const event = await prisma.event.create({
      data: {
        organizationId,
        createdById: orgSession.userId,
        title: eventTitle,
        description: `Tournament match: ${tournament.name}${data.round ? ` - ${data.round}` : ""}`,
        type: "tournament",
        startTime: data.scheduledAt,
        endTime: new Date(data.scheduledAt.getTime() + 2 * 60 * 60 * 1000), // Default 2 hours
        venueId: data.venueId,
        teamId: data.homeTeamId || null, // Link to home team if available
        attendees: data.homeTeamId && data.awayTeamId
          ? JSON.stringify([data.homeTeamId, data.awayTeamId])
          : null,
      },
    });

    // Link fixture to event
    await prisma.fixture.update({
      where: { id: fixture.id },
      data: { eventId: event.id },
    });

    // Get teams for the event if they exist
    const homeTeam = data.homeTeamId
      ? await prisma.team.findUnique({
          where: { id: data.homeTeamId },
          select: { id: true, name: true, logo: true },
        })
      : null;

    const awayTeam = data.awayTeamId
      ? await prisma.team.findUnique({
          where: { id: data.awayTeamId },
          select: { id: true, name: true, logo: true },
        })
      : null;

    return {
      success: true,
      fixture: {
        ...fixture,
        eventId: event.id,
        homeTeam,
        awayTeam,
      },
      event,
    };
  } catch (error: any) {
    console.error("Create fixture error:", error);
    return {
      success: false,
      error: error.message || "Failed to create fixture",
    };
  }
}

export async function getPlayerTournaments(playerId: string) {
  const session = await getSession();
  if (!session || session.role !== "player") {
    throw new Error("Unauthorized");
  }

  // Get player's contracts to find their teams
  const contracts = await prisma.contract.findMany({
    where: {
      playerId,
      status: "active",
    },
    select: {
      teamId: true,
    },
  });

  const teamIds = contracts.map((c) => c.teamId);

  // Get organization IDs from contracts
  const teams = await prisma.team.findMany({
    where: {
      id: { in: teamIds },
    },
    select: {
      organizationId: true,
    },
  });

  const organizationIds = [...new Set(teams.map((t) => t.organizationId))];

  // Get tournaments where player's teams are participating
  const tournaments = await prisma.tournament.findMany({
    where: {
      organizationId: { in: organizationIds },
      fixtures: {
        some: {
          OR: [
            { homeTeamId: { in: teamIds } },
            { awayTeamId: { in: teamIds } },
          ],
        },
      },
    },
    include: {
      season: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      fixtures: {
        where: {
          OR: [
            { homeTeamId: { in: teamIds } },
            { awayTeamId: { in: teamIds } },
          ],
        },
        include: {
          homeTeam: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          awayTeam: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          venue: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true,
            },
          },
        },
        orderBy: {
          scheduledAt: "asc",
        },
      },
      _count: {
        select: {
          fixtures: true,
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return tournaments;
}

