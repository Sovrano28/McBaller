"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface CreateMediaFileData {
  organizationId: string;
  teamId?: string;
  title: string;
  description?: string;
  fileType: "image" | "video" | "document" | "other";
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  category?: string;
  isPublic?: boolean;
  tags?: string[];
}

export async function createMediaFile(data: CreateMediaFileData) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== data.organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.mediaFile.create({
    data: {
      ...data,
      uploadedById: orgSession.id,
      tags: data.tags || [],
    },
  });
}

export async function getOrganizationMedia(
  organizationId: string,
  filters?: {
    teamId?: string;
    fileType?: string;
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

  return prisma.mediaFile.findMany({
    where: {
      organizationId,
      ...(filters?.teamId && { teamId: filters.teamId }),
      ...(filters?.fileType && { fileType: filters.fileType }),
      ...(filters?.category && { category: filters.category }),
    },
    orderBy: { createdAt: "desc" },
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

