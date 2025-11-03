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
          email: true,
          role: true,
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
          email: true,
          role: true,
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
