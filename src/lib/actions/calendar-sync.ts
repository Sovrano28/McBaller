"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface CalendarSyncConfig {
  provider: "google" | "outlook" | "apple";
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  calendarId?: string;
}

export async function getCalendarSync(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const sync = await prisma.calendarSync.findUnique({
    where: { organizationId },
  });

  return sync;
}

export async function createCalendarSync(
  organizationId: string,
  config: CalendarSyncConfig
) {
  const session = await getSession();
  if (!session || session.role === "player") {
    return { success: false, error: "Unauthorized" };
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    return { success: false, error: "Forbidden" };
  }

  try {
    // Upsert calendar sync
    const sync = await prisma.calendarSync.upsert({
      where: { organizationId },
      update: {
        provider: config.provider,
        accessToken: config.accessToken,
        refreshToken: config.refreshToken,
        expiresAt: config.expiresAt,
        calendarId: config.calendarId,
        isActive: true,
        lastSyncAt: new Date(),
      },
      create: {
        organizationId,
        provider: config.provider,
        accessToken: config.accessToken,
        refreshToken: config.refreshToken,
        expiresAt: config.expiresAt,
        calendarId: config.calendarId,
        isActive: true,
        lastSyncAt: new Date(),
      },
    });

    return { success: true, sync };
  } catch (error: any) {
    console.error("Create calendar sync error:", error);
    return {
      success: false,
      error: error.message || "Failed to create calendar sync",
    };
  }
}

export async function deleteCalendarSync(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    return { success: false, error: "Unauthorized" };
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    return { success: false, error: "Forbidden" };
  }

  try {
    await prisma.calendarSync.delete({
      where: { organizationId },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete calendar sync error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete calendar sync",
    };
  }
}

export async function triggerCalendarSync(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    return { success: false, error: "Unauthorized" };
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    return { success: false, error: "Forbidden" };
  }

  try {
    const sync = await prisma.calendarSync.findUnique({
      where: { organizationId },
    });

    if (!sync || !sync.isActive) {
      return { success: false, error: "No active calendar sync found" };
    }

    // Update lastSyncAt
    await prisma.calendarSync.update({
      where: { organizationId },
      data: {
        lastSyncAt: new Date(),
      },
    });

    return { success: true, sync };
  } catch (error: any) {
    console.error("Trigger calendar sync error:", error);
    return {
      success: false,
      error: error.message || "Failed to trigger calendar sync",
    };
  }
}

