"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import { logAction } from "@/lib/audit-logger";

export async function getAllTeams(filters?: {
  search?: string;
  organizationId?: string;
  status?: string;
}) {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters?.status) {
      where.isActive = filters.status === "active";
    }

    const teams = await prisma.team.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        _count: {
          select: {
            players: true,
            coaches: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    await logAction({
      organizationId: null,
      action: "view",
      entityType: "teams",
      metadata: { count: teams.length, filters },
    });

    return { success: true, data: teams };
  } catch (error) {
    console.error("Error fetching teams:", error);
    return { success: false, error: "Failed to fetch teams" };
  }
}

export async function getTeamById(id: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
            primaryColor: true,
          },
        },
        players: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
          take: 50,
        },
        coaches: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return { success: false, error: "Team not found" };
    }

    await logAction({
      organizationId: null,
      action: "view",
      entityType: "team",
      entityId: id,
    });

    return { success: true, data: team };
  } catch (error) {
    console.error("Error fetching team:", error);
    return { success: false, error: "Failed to fetch team" };
  }
}

export async function updateTeam(
  id: string,
  data: {
    name?: string;
    isActive?: boolean;
    logo?: string;
  }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    const team = await prisma.team.update({
      where: { id },
      data,
    });

    await logAction({
      organizationId: null,
      action: "update",
      entityType: "team",
      entityId: id,
      metadata: { updates: Object.keys(data) },
    });

    return { success: true, data: team };
  } catch (error) {
    console.error("Error updating team:", error);
    return { success: false, error: "Failed to update team" };
  }
}

export async function deleteTeam(id: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.team.delete({
      where: { id },
    });

    await logAction({
      organizationId: null,
      action: "delete",
      entityType: "team",
      entityId: id,
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting team:", error);
    return { success: false, error: "Failed to delete team" };
  }
}

export async function getTeamStats() {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    const [total, active, withPlayers] = await Promise.all([
      prisma.team.count(),
      prisma.team.count({ where: { isActive: true } }),
      prisma.team.count({
        where: {
          players: {
            some: {},
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        withPlayers,
      },
    };
  } catch (error) {
    console.error("Error fetching team stats:", error);
    return { success: false, error: "Failed to fetch team stats" };
  }
}

