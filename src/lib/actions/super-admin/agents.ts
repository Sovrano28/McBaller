"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import { logAction } from "@/lib/audit-logger";

export async function getAllAgents(filters?: {
  search?: string;
  organizationId?: string;
  teamId?: string;
  role?: string;
}) {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    const where: any = {
      role: {
        in: ["coach", "analyst", "finance"],
      },
    };

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters?.role) {
      where.role = filters.role;
    }

    const agents = await prisma.user.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        coachProfile: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                players: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    await logAction({
      organizationId: null,
      action: "view",
      entityType: "agents",
      metadata: { count: agents.length, filters },
    });

    return { success: true, data: agents };
  } catch (error) {
    console.error("Error fetching agents:", error);
    return { success: false, error: "Failed to fetch agents" };
  }
}

export async function getAgentById(id: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    const agent = await prisma.user.findUnique({
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
        coachProfile: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
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
                team: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              take: 20,
            },
          },
        },
      },
    });

    if (!agent) {
      return { success: false, error: "Agent not found" };
    }

    await logAction({
      organizationId: null,
      action: "view",
      entityType: "agent",
      entityId: id,
    });

    return { success: true, data: agent };
  } catch (error) {
    console.error("Error fetching agent:", error);
    return { success: false, error: "Failed to fetch agent" };
  }
}

export async function updateAgent(
  id: string,
  data: {
    email?: string;
    role?: string;
  }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    const agent = await prisma.user.update({
      where: { id },
      data,
    });

    await logAction({
      organizationId: null,
      action: "update",
      entityType: "agent",
      entityId: id,
      metadata: { updates: Object.keys(data) },
    });

    return { success: true, data: agent };
  } catch (error) {
    console.error("Error updating agent:", error);
    return { success: false, error: "Failed to update agent" };
  }
}

export async function deleteAgent(id: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.user.delete({
      where: { id },
    });

    await logAction({
      organizationId: null,
      action: "delete",
      entityType: "agent",
      entityId: id,
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting agent:", error);
    return { success: false, error: "Failed to delete agent" };
  }
}

export async function getAgentStats() {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    const [coaches, analysts, finance] = await Promise.all([
      prisma.user.count({ where: { role: "coach" } }),
      prisma.user.count({ where: { role: "analyst" } }),
      prisma.user.count({ where: { role: "finance" } }),
    ]);

    return {
      success: true,
      data: {
        total: coaches + analysts + finance,
        coaches,
        analysts,
        finance,
      },
    };
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    return { success: false, error: "Failed to fetch agent stats" };
  }
}

