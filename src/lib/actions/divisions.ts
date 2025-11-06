"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface CreateDivisionData {
  organizationId: string;
  name: string;
  description?: string;
  level?: number;
}

export async function createDivision(data: CreateDivisionData) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== data.organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.division.create({
    data,
  });
}

export async function getOrganizationDivisions(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.division.findMany({
    where: { organizationId },
    orderBy: { level: "asc" },
    include: {
      _count: {
        select: {
          teams: true,
        },
      },
    },
  });
}

