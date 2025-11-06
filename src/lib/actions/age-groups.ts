"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface CreateAgeGroupData {
  organizationId: string;
  name: string;
  minAge?: number;
  maxAge?: number;
  description?: string;
}

export async function createAgeGroup(data: CreateAgeGroupData) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== data.organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.ageGroup.create({
    data,
  });
}

export async function getOrganizationAgeGroups(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.ageGroup.findMany({
    where: { organizationId },
    orderBy: { minAge: "asc" },
    include: {
      _count: {
        select: {
          teams: true,
        },
      },
    },
  });
}

