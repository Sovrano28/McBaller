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

// Get all audit logs across the platform
export async function getAllAuditLogs(filters?: {
  action?: string;
  entityType?: string;
  organizationId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  await verifySuperAdmin();

  try {
    const where: any = {};

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.search) {
      where.entityId = { contains: filters.search, mode: "insensitive" };
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit || 100,
        skip: filters?.offset || 0,
        include: {
          user: {
            select: {
              email: true,
              role: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw new Error("Failed to fetch audit logs");
  }
}

// Get audit logs for a specific entity
export async function getAuditLogsByEntity(
  entityType: string,
  entityId: string
) {
  await verifySuperAdmin();

  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    return logs;
  } catch (error) {
    console.error("Error fetching entity audit logs:", error);
    throw new Error("Failed to fetch entity audit logs");
  }
}

// Get audit logs for a specific user
export async function getAuditLogsByUser(
  userId: string,
  limit: number = 100
) {
  await verifySuperAdmin();

  try {
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    return logs;
  } catch (error) {
    console.error("Error fetching user audit logs:", error);
    throw new Error("Failed to fetch user audit logs");
  }
}

// Get audit log statistics
export async function getAuditLogStats(days: number = 30) {
  await verifySuperAdmin();

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalLogs,
      logsByAction,
      logsByEntityType,
      topUsers,
      topOrganizations,
    ] = await Promise.all([
      // Total logs
      prisma.auditLog.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Logs by action
      prisma.auditLog.groupBy({
        by: ["action"],
        where: { createdAt: { gte: startDate } },
        _count: true,
      }),

      // Logs by entity type
      prisma.auditLog.groupBy({
        by: ["entityType"],
        where: { createdAt: { gte: startDate } },
        _count: true,
        orderBy: { _count: { entityType: "desc" } },
        take: 10,
      }),

      // Most active users
      prisma.auditLog.groupBy({
        by: ["userId"],
        where: {
          createdAt: { gte: startDate },
          userId: { not: null },
        },
        _count: true,
        orderBy: { _count: { userId: "desc" } },
        take: 10,
      }),

      // Most active organizations
      prisma.auditLog.groupBy({
        by: ["organizationId"],
        where: {
          createdAt: { gte: startDate },
          organizationId: { not: null },
        },
        _count: true,
        orderBy: { _count: { organizationId: "desc" } },
        take: 10,
      }),
    ]);

    return {
      totalLogs,
      logsByAction,
      logsByEntityType,
      topUsers,
      topOrganizations,
    };
  } catch (error) {
    console.error("Error fetching audit log stats:", error);
    throw new Error("Failed to fetch audit log stats");
  }
}

// Export audit logs
export async function exportAuditLogs(
  startDate: Date,
  endDate: Date,
  filters?: {
    action?: string;
    entityType?: string;
    organizationId?: string;
  }
) {
  await verifySuperAdmin();

  try {
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (filters?.action) where.action = filters.action;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.organizationId) where.organizationId = filters.organizationId;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    return logs;
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    throw new Error("Failed to export audit logs");
  }
}

