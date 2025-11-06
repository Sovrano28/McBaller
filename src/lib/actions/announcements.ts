"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface CreateAnnouncementData {
  organizationId: string;
  teamId?: string;
  title: string;
  content: string;
  priority?: "low" | "normal" | "high" | "urgent";
  sendEmail?: boolean;
  sendPush?: boolean;
  targetAudience?: string[];
  attachments?: string[];
  expiresAt?: Date;
}

export async function createAnnouncement(data: CreateAnnouncementData) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== data.organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.announcement.create({
    data: {
      ...data,
      createdById: orgSession.id,
      priority: data.priority || "normal",
      sendEmail: data.sendEmail || false,
      sendPush: data.sendPush || false,
    },
  });
}

export async function getOrganizationAnnouncements(
  organizationId: string,
  filters?: {
    teamId?: string;
    priority?: string;
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

  return prisma.announcement.findMany({
    where: {
      organizationId,
      ...(filters?.teamId && { teamId: filters.teamId }),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.expiresAt && {
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      }),
    },
    orderBy: { createdAt: "desc" },
    take: filters?.limit || 50,
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getAnnouncement(id: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!announcement) {
    throw new Error("Announcement not found");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== announcement.organizationId) {
    throw new Error("Forbidden");
  }

  return announcement;
}

export async function deleteAnnouncement(id: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const announcement = await getAnnouncement(id);
  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== announcement.organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.announcement.delete({
    where: { id },
  });
}

