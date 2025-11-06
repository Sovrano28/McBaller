"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface CreateWaiverData {
  organizationId: string;
  title: string;
  content: string;
  version?: string;
  requiresParent?: boolean;
}

export async function createWaiver(data: CreateWaiverData) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== data.organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.waiver.create({
    data: {
      ...data,
      version: data.version || "1.0",
    },
  });
}

export async function getOrganizationWaivers(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.waiver.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          signatures: true,
        },
      },
    },
  });
}

export async function getWaiver(id: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const waiver = await prisma.waiver.findUnique({
    where: { id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      signatures: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: { signedAt: "desc" },
      },
    },
  });

  if (!waiver) {
    throw new Error("Waiver not found");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== waiver.organizationId) {
    throw new Error("Forbidden");
  }

  return waiver;
}

