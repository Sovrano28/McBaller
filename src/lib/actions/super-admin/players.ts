"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";

async function verifySuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    throw new Error("Unauthorized: Super-admin access required");
  }
  return session;
}

// Get all players with filters
export async function getAllPlayers(filters?: {
  subscriptionTier?: string;
  organizationId?: string;
  position?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  await verifySuperAdmin();

  try {
    const where: any = {};

    if (filters?.subscriptionTier) {
      where.subscriptionTier = filters.subscriptionTier;
    }

    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters?.position) {
      where.position = filters.position;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { username: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (filters?.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || "desc";
    } else {
      orderBy.joinedAt = "desc";
    }

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        orderBy,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        include: {
          user: {
            select: {
              email: true,
              lastLoginAt: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
          team: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              contracts: true,
              invoices: true,
              leagueStats: true,
              posts: true,
            },
          },
        },
      }),
      prisma.player.count({ where }),
    ]);

    return { players, total };
  } catch (error) {
    console.error("Error fetching players:", error);
    throw new Error("Failed to fetch players");
  }
}

// Get player details
export async function getPlayerDetails(playerId: string) {
  await verifySuperAdmin();

  try {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        organization: true,
        team: true,
        contracts: {
          include: {
            organization: {
              select: { name: true },
            },
            team: {
              select: { name: true },
            },
          },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        leagueStats: {
          orderBy: { season: "desc" },
        },
        posts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        trainingProgress: true,
      },
    });

    if (!player) {
      throw new Error("Player not found");
    }

    return player;
  } catch (error) {
    console.error("Error fetching player details:", error);
    throw new Error("Failed to fetch player details");
  }
}

// Update player
export async function updatePlayer(
  playerId: string,
  data: {
    name?: string;
    phone?: string;
    position?: string;
    subscriptionTier?: string;
    subscriptionExpiry?: Date | null;
    organizationId?: string | null;
    teamId?: string | null;
  }
) {
  await verifySuperAdmin();

  try {
    const player = await prisma.player.update({
      where: { id: playerId },
      data,
    });

    return { success: true, player };
  } catch (error) {
    console.error("Error updating player:", error);
    return { success: false, error: "Failed to update player" };
  }
}

// Manage player subscription
export async function updatePlayerSubscription(
  playerId: string,
  tier: string,
  expiryDate?: Date | null
) {
  await verifySuperAdmin();

  try {
    const player = await prisma.player.update({
      where: { id: playerId },
      data: {
        subscriptionTier: tier,
        subscriptionExpiry: expiryDate,
      },
    });

    return { success: true, player };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return { success: false, error: "Failed to update subscription" };
  }
}

// Verify/unverify player stats
export async function verifyPlayerStats(
  statId: string,
  verified: boolean
) {
  await verifySuperAdmin();

  try {
    const stat = await prisma.leagueStat.update({
      where: { id: statId },
      data: { verified },
    });

    return { success: true, stat };
  } catch (error) {
    console.error("Error verifying stats:", error);
    return { success: false, error: "Failed to verify stats" };
  }
}

// Delete player
export async function deletePlayer(playerId: string) {
  await verifySuperAdmin();

  try {
    await prisma.player.delete({
      where: { id: playerId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting player:", error);
    return { success: false, error: "Failed to delete player" };
  }
}

// Get player activity and usage
export async function getPlayerActivity(playerId: string) {
  await verifySuperAdmin();

  try {
    const [
      trainingProgress,
      recentPosts,
      recentStats,
      availabilities,
    ] = await Promise.all([
      prisma.trainingProgress.findMany({
        where: { playerId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.post.findMany({
        where: { playerId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.leagueStat.findMany({
        where: { playerId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.availability.findMany({
        where: { playerId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          event: {
            select: {
              title: true,
              startTime: true,
            },
          },
        },
      }),
    ]);

    return {
      trainingProgress,
      recentPosts,
      recentStats,
      availabilities,
    };
  } catch (error) {
    console.error("Error fetching player activity:", error);
    throw new Error("Failed to fetch player activity");
  }
}

// Get unverified stats for moderation
export async function getUnverifiedStats(limit: number = 50) {
  await verifySuperAdmin();

  try {
    const stats = await prisma.leagueStat.findMany({
      where: { verified: false },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        player: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    return stats;
  } catch (error) {
    console.error("Error fetching unverified stats:", error);
    throw new Error("Failed to fetch unverified stats");
  }
}

