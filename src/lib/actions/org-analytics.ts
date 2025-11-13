"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

async function verifyOrgAccess(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }
  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }
  return orgSession;
}

export async function getOrganizationStats(organizationId: string) {
  await verifyOrgAccess(organizationId);

  const [
    totalPlayers,
    totalTeams,
    totalEvents,
    totalContracts,
    activeContracts,
    totalInvoices,
    paidInvoices,
  ] = await Promise.all([
    prisma.player.count({ where: { organizationId } }),
    prisma.team.count({ where: { organizationId } }),
    prisma.event.count({ where: { organizationId } }),
    prisma.contract.count({ where: { organizationId } }),
    prisma.contract.count({
      where: { organizationId, status: "active" },
    }),
    prisma.invoice.count({ where: { organizationId } }),
    prisma.invoice.count({
      where: { organizationId, status: "paid" },
    }),
  ]);

  return {
    totalPlayers,
    totalTeams,
    totalEvents,
    totalContracts,
    activeContracts,
    totalInvoices,
    paidInvoices,
  };
}

export async function getPlayerGrowthMetrics(
  organizationId: string,
  days: number = 30
) {
  await verifyOrgAccess(organizationId);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [newPlayers, totalPlayers] = await Promise.all([
    prisma.player.count({
      where: {
        organizationId,
        joinedAt: { gte: startDate },
      },
    }),
    prisma.player.count({ where: { organizationId } }),
  ]);

  const growthRate =
    totalPlayers > 0 ? ((newPlayers / totalPlayers) * 100).toFixed(1) : "0";

  return {
    newPlayers,
    totalPlayers,
    growthRate: parseFloat(growthRate),
    period: days,
  };
}

export async function getEventStatistics(
  organizationId: string,
  days: number = 30
) {
  await verifyOrgAccess(organizationId);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [eventsByType, upcomingEvents, totalEvents] = await Promise.all([
    prisma.event.groupBy({
      by: ["type"],
      where: {
        organizationId,
        startTime: { gte: startDate },
      },
      _count: true,
    }),
    prisma.event.count({
      where: {
        organizationId,
        startTime: { gte: new Date() },
        status: "scheduled",
      },
    }),
    prisma.event.count({
      where: {
        organizationId,
        startTime: { gte: startDate },
      },
    }),
  ]);

  return {
    eventsByType: eventsByType.reduce(
      (acc, item) => ({ ...acc, [item.type]: item._count }),
      {} as Record<string, number>
    ),
    upcomingEvents,
    totalEvents,
    period: days,
  };
}

export async function getFinancialMetrics(
  organizationId: string,
  days: number = 30
) {
  await verifyOrgAccess(organizationId);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [totalRevenue, outstandingInvoices, paidInvoices, revenueByStatus] =
    await Promise.all([
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: "paid",
          paidAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: { in: ["sent", "overdue"] },
        },
        _sum: { amount: true },
      }),
      prisma.invoice.count({
        where: {
          organizationId,
          status: "paid",
          paidAt: { gte: startDate },
        },
      }),
      prisma.invoice.groupBy({
        by: ["status"],
        where: {
          organizationId,
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

  return {
    totalRevenue: Number(totalRevenue._sum.amount || 0),
    outstandingInvoices: Number(outstandingInvoices._sum.amount || 0),
    paidInvoicesCount: paidInvoices,
    revenueByStatus: revenueByStatus.reduce(
      (acc, item) => ({
        ...acc,
        [item.status]: {
          amount: Number(item._sum.amount || 0),
          count: item._count,
        },
      }),
      {} as Record<string, { amount: number; count: number }>
    ),
    period: days,
  };
}

export async function getTeamPerformance(organizationId: string) {
  await verifyOrgAccess(organizationId);

  const teams = await prisma.team.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: {
          players: true,
          contracts: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    playerCount: team._count.players,
    contractCount: team._count.contracts,
  }));
}

export async function getEngagementMetrics(
  organizationId: string,
  days: number = 30
) {
  await verifyOrgAccess(organizationId);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [activePlayers, totalPosts, totalLikes] = await Promise.all([
    prisma.player.count({
      where: {
        organizationId,
        user: {
          isActive: true,
        },
      },
    }),
    prisma.post.count({
      where: {
        player: {
          organizationId,
        },
        createdAt: { gte: startDate },
      },
    }),
    prisma.post.aggregate({
      where: {
        player: {
          organizationId,
        },
        createdAt: { gte: startDate },
      },
      _sum: { likes: true },
    }),
  ]);

  return {
    activePlayers,
    totalPosts,
    totalLikes: totalLikes._sum.likes || 0,
    period: days,
  };
}

