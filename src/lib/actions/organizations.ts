"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export async function getOrganizationDashboard(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  // Get organization with stats
  const [organization, stats] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        teams: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        _count: {
          select: {
            players: true,
            users: true,
            contracts: true,
          },
        },
      },
    }),
    prisma.$transaction([
      // Total players
      prisma.player.count({
        where: { organizationId },
      }),
      // Active contracts
      prisma.contract.count({
        where: {
          organizationId,
          status: "active",
        },
      }),
      // Pending invoices
      prisma.invoice.count({
        where: {
          organizationId,
          status: { in: ["draft", "sent"] },
        },
      }),
      // Total revenue (sum of paid invoices)
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: "paid",
        },
        _sum: {
          amount: true,
        },
      }),
    ]),
  ]);

  if (!organization) {
    throw new Error("Organization not found");
  }

  const [totalPlayers, activeContracts, pendingInvoices, revenueSum] = stats;
  const totalRevenue = revenueSum._sum.amount || 0;

  return {
    organization,
    kpis: {
      totalPlayers,
      activeContracts,
      pendingInvoices,
      totalRevenue: Number(totalRevenue),
      totalTeams: organization.teams.length,
      totalStaff: organization._count.users,
    },
  };
}

export async function getOrganizationPlayers(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const players = await prisma.player.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      leagueStats: {
        orderBy: {
          season: "desc",
        },
        take: 1,
      },
      contracts: {
        where: {
          status: "active",
        },
        take: 1,
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return players;
}

export async function getOrganizationPlayer(
  organizationId: string,
  playerId: string
) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const player = await prisma.player.findFirst({
    where: {
      id: playerId,
      organizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      leagueStats: {
        orderBy: {
          season: "desc",
        },
      },
      contracts: {
        include: {
          team: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
      },
      invoices: {
        include: {
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paidAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!player) {
    throw new Error("Player not found");
  }

  return player;
}

export async function getOrganizationTeams(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const teams = await prisma.team.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: {
          players: true,
          contracts: true,
        },
      },
      players: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          position: true,
        },
        take: 5,
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return teams;
}

export async function getOrganizationTeam(
  organizationId: string,
  teamId: string
) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      organizationId,
    },
    include: {
      organization: {
        select: {
          name: true,
          slug: true,
        },
      },
      players: {
        include: {
          leagueStats: {
            orderBy: {
              season: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          name: "asc",
        },
      },
      contracts: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              position: true,
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
      },
    },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  return team;
}

export async function togglePlayerStatus(playerId: string, suspend: boolean) {
  const session = await getSession();
  if (!session || session.role === "player") {
    return { success: false, error: "Unauthorized" };
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Verify player belongs to organization
    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        organizationId: orgSession.organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!player) {
      return { success: false, error: "Player not found or doesn't belong to organization" };
    }

    // Update user's isActive status
    const user = await prisma.user.update({
      where: { id: player.user.id },
      data: {
        isActive: !suspend, // suspend=true means isActive=false
        updatedAt: new Date(),
      },
    });

    // Log action (if audit logger exists)
    try {
      const { logAction } = await import("@/lib/audit-logger");
      await logAction({
        organizationId: orgSession.organizationId,
        action: suspend ? "deactivate" : "activate",
        entityType: "player",
        entityId: playerId,
        metadata: {
          playerName: player.name,
          playerEmail: user.email,
          previousStatus: suspend ? "active" : "inactive",
          newStatus: suspend ? "inactive" : "active",
        },
      });
    } catch (error) {
      // Audit logging is optional, continue even if it fails
      console.warn("Failed to log action:", error);
    }

    return { success: true, suspended: suspend, user };
  } catch (error: any) {
    console.error("Error toggling player status:", error);
    return { success: false, error: "Failed to toggle player status" };
  }
}

export async function updateOrganizationLogo(
  organizationId: string,
  logoUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.role === "player") {
      return { success: false, error: "Unauthorized" };
    }

    const orgSession = session as OrgAuthData;
    if (orgSession.organizationId !== organizationId) {
      return { success: false, error: "Forbidden" };
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: { logo: logoUrl || null },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update organization logo error:", error);
    return {
      success: false,
      error: error.message || "Failed to update logo",
    };
  }
}