"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import { logAction } from "@/lib/audit-logger";

async function verifySuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    throw new Error("Unauthorized: Super-admin access required");
  }
  return session;
}

// Get all posts for content moderation
export async function getAllPosts(filters?: {
  playerId?: string;
  search?: string;
  hasMedia?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  await verifySuperAdmin();

  try {
    const where: any = {};

    if (filters?.playerId) {
      where.playerId = filters.playerId;
    }

    if (filters?.hasMedia !== undefined) {
      if (filters.hasMedia) {
        where.mediaUrl = { not: null };
      } else {
        where.mediaUrl = null;
      }
    }

    if (filters?.search) {
      where.content = { contains: filters.search, mode: "insensitive" };
    }

    const orderBy: any = {};
    if (filters?.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        include: {
          player: {
            select: {
              name: true,
              username: true,
              avatar: true,
              organization: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return { posts, total };
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Failed to fetch posts");
  }
}

// Delete post
export async function deletePost(postId: string, reason: string) {
  await verifySuperAdmin();

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        player: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    // Log deletion
    await logAction({
      action: "delete",
      entityType: "post",
      entityId: postId,
      metadata: {
        reason,
        playerName: post.player.name,
        content: post.content.substring(0, 100),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

// Get unverified stats for verification
export async function getUnverifiedStats(filters?: {
  playerId?: string;
  season?: string;
  limit?: number;
  offset?: number;
}) {
  await verifySuperAdmin();

  try {
    const where: any = { verified: false };

    if (filters?.playerId) {
      where.playerId = filters.playerId;
    }

    if (filters?.season) {
      where.season = filters.season;
    }

    const [stats, total] = await Promise.all([
      prisma.leagueStat.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        include: {
          player: {
            select: {
              name: true,
              username: true,
              avatar: true,
              organization: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.leagueStat.count({ where }),
    ]);

    return { stats, total };
  } catch (error) {
    console.error("Error fetching unverified stats:", error);
    throw new Error("Failed to fetch unverified stats");
  }
}

// Verify/reject player stat
export async function verifyPlayerStat(
  statId: string,
  verified: boolean,
  notes?: string
) {
  await verifySuperAdmin();

  try {
    const stat = await prisma.leagueStat.update({
      where: { id: statId },
      data: { verified },
    });

    // Log verification action
    await logAction({
      action: "update",
      entityType: "league_stat",
      entityId: statId,
      metadata: {
        verified,
        notes,
        season: stat.season,
        club: stat.club,
      },
    });

    return { success: true, stat };
  } catch (error) {
    console.error("Error verifying stat:", error);
    return { success: false, error: "Failed to verify stat" };
  }
}

// Bulk verify stats
export async function bulkVerifyStats(
  statIds: string[],
  verified: boolean
) {
  await verifySuperAdmin();

  try {
    await prisma.leagueStat.updateMany({
      where: {
        id: { in: statIds },
      },
      data: { verified },
    });

    // Log bulk verification
    await logAction({
      action: "update",
      entityType: "league_stat_bulk",
      metadata: {
        verified,
        count: statIds.length,
        statIds,
      },
    });

    return { success: true, count: statIds.length };
  } catch (error) {
    console.error("Error bulk verifying stats:", error);
    return { success: false, error: "Failed to bulk verify stats" };
  }
}

// Get media files for moderation
export async function getAllMediaFiles(filters?: {
  organizationId?: string;
  fileType?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  await verifySuperAdmin();

  try {
    const where: any = {};

    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters?.fileType) {
      where.fileType = filters.fileType;
    }

    if (filters?.search) {
      where.title = { contains: filters.search, mode: "insensitive" };
    }

    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        include: {
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
        },
      }),
      prisma.mediaFile.count({ where }),
    ]);

    return { files, total };
  } catch (error) {
    console.error("Error fetching media files:", error);
    throw new Error("Failed to fetch media files");
  }
}

// Delete media file
export async function deleteMediaFile(fileId: string, reason: string) {
  await verifySuperAdmin();

  try {
    const file = await prisma.mediaFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return { success: false, error: "File not found" };
    }

    await prisma.mediaFile.delete({
      where: { id: fileId },
    });

    // Log deletion
    await logAction({
      action: "delete",
      entityType: "media_file",
      entityId: fileId,
      metadata: {
        reason,
        fileName: file.fileName,
        fileType: file.fileType,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting media file:", error);
    return { success: false, error: "Failed to delete media file" };
  }
}

// Get content moderation statistics
export async function getContentModerationStats(days: number = 30) {
  await verifySuperAdmin();

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalPosts,
      totalMediaFiles,
      unverifiedStats,
      recentPosts,
      postsWithMedia,
    ] = await Promise.all([
      prisma.post.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.mediaFile.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.leagueStat.count({
        where: { verified: false },
      }),
      prisma.post.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.post.count({
        where: {
          mediaUrl: { not: null },
          createdAt: { gte: startDate },
        },
      }),
    ]);

    return {
      totalPosts,
      totalMediaFiles,
      unverifiedStats,
      recentPosts,
      postsWithMedia,
    };
  } catch (error) {
    console.error("Error fetching content moderation stats:", error);
    throw new Error("Failed to fetch content moderation stats");
  }
}

