"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface CreateSeasonData {
  organizationId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  isActive?: boolean;
}

export async function createSeason(data: CreateSeasonData) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== data.organizationId) {
    throw new Error("Forbidden");
  }

  // If setting as active, deactivate other seasons
  if (data.isActive) {
    await prisma.season.updateMany({
      where: {
        organizationId: data.organizationId,
        isActive: true,
      },
      data: { isActive: false },
    });
  }

  return prisma.season.create({
    data,
  });
}

export async function getOrganizationSeasons(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.season.findMany({
    where: { organizationId },
    orderBy: { startDate: "desc" },
    include: {
      _count: {
        select: {
          teams: true,
          tournaments: true,
        },
      },
    },
  });
}

export async function getActiveSeason(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.season.findFirst({
    where: {
      organizationId,
      isActive: true,
    },
  });
}

