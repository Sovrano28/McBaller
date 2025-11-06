"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

// Background Checks
export interface CreateBackgroundCheckData {
  organizationId: string;
  userId?: string;
  playerId?: string;
  type: "criminal" | "reference" | "education" | "certification";
  provider?: string;
  expiresAt?: Date;
}

export async function createBackgroundCheck(data: CreateBackgroundCheckData) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== data.organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.backgroundCheck.create({
    data: {
      ...data,
      status: "pending",
    },
  });
}

export async function getOrganizationBackgroundChecks(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.backgroundCheck.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      player: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });
}

// Documents
export interface CreateDocumentData {
  organizationId: string;
  playerId?: string;
  userId?: string;
  title: string;
  description?: string;
  category: "medical" | "insurance" | "contract" | "identification" | "certification" | "other";
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  isConfidential?: boolean;
  accessRoles?: string[];
  expiresAt?: Date;
}

export async function createDocument(data: CreateDocumentData) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== data.organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.document.create({
    data: {
      ...data,
      accessRoles: data.accessRoles || [],
    },
  });
}

export async function getOrganizationDocuments(
  organizationId: string,
  filters?: {
    playerId?: string;
    userId?: string;
    category?: string;
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

  return prisma.document.findMany({
    where: {
      organizationId,
      ...(filters?.playerId && { playerId: filters.playerId }),
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.category && { category: filters.category }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
}

// Audit Logs
export async function getOrganizationAuditLogs(
  organizationId: string,
  filters?: {
    action?: string;
    entityType?: string;
    limit?: number;
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

  // Only org_admin can view audit logs
  if (orgSession.role !== "org_admin") {
    throw new Error("Forbidden: Only admins can view audit logs");
  }

  return prisma.auditLog.findMany({
    where: {
      organizationId,
      ...(filters?.action && { action: filters.action }),
      ...(filters?.entityType && { entityType: filters.entityType }),
    },
    orderBy: { createdAt: "desc" },
    take: filters?.limit || 100,
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
}

