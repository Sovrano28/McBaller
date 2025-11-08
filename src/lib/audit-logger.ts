"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import { headers } from "next/headers";

export interface AuditLogData {
  organizationId?: string | null;
  action: "create" | "update" | "delete" | "view" | "export";
  entityType: string;
  entityId?: string;
  changes?: any;
  metadata?: any;
}

export async function logAction(data: AuditLogData) {
  try {
    const session = await getSession();
    const headersList = await headers();
    
    const ipAddress = headersList.get("x-forwarded-for") || 
                     headersList.get("x-real-ip") || 
                     "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await prisma.auditLog.create({
      data: {
        organizationId: data.organizationId || null,
        userId: session?.id || null,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId || null,
        changes: data.changes || null,
        ipAddress,
        userAgent,
        metadata: data.metadata || null,
      },
    });
  } catch (error) {
    console.error("Error logging audit action:", error);
    // Don't throw error to avoid disrupting main operation
  }
}

// Helper functions for common audit log patterns
export async function logCreate(
  entityType: string,
  entityId: string,
  data: any,
  organizationId?: string
) {
  await logAction({
    organizationId,
    action: "create",
    entityType,
    entityId,
    changes: { after: data },
  });
}

export async function logUpdate(
  entityType: string,
  entityId: string,
  before: any,
  after: any,
  organizationId?: string
) {
  await logAction({
    organizationId,
    action: "update",
    entityType,
    entityId,
    changes: { before, after },
  });
}

export async function logDelete(
  entityType: string,
  entityId: string,
  data: any,
  organizationId?: string
) {
  await logAction({
    organizationId,
    action: "delete",
    entityType,
    entityId,
    changes: { before: data },
  });
}

export async function logView(
  entityType: string,
  entityId: string,
  organizationId?: string
) {
  await logAction({
    organizationId,
    action: "view",
    entityType,
    entityId,
  });
}

export async function logExport(
  entityType: string,
  metadata: any,
  organizationId?: string
) {
  await logAction({
    organizationId,
    action: "export",
    entityType,
    metadata,
  });
}

