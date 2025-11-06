"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface CreateAssignmentData {
  organizationId: string;
  teamId?: string;
  title: string;
  description?: string;
  type?: "volunteer" | "task" | "duty";
  assignedToId?: string;
  assignedToType?: "player" | "user";
  dueDate?: Date;
}

export async function createAssignment(data: CreateAssignmentData) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== data.organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.assignment.create({
    data: {
      ...data,
      createdById: orgSession.id,
      type: data.type || "volunteer",
      status: "pending",
    },
  });
}

export async function getOrganizationAssignments(
  organizationId: string,
  filters?: {
    teamId?: string;
    status?: string;
    assignedToId?: string;
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

  return prisma.assignment.findMany({
    where: {
      organizationId,
      ...(filters?.teamId && { teamId: filters.teamId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.assignedToId && { assignedToId: filters.assignedToId }),
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

export async function updateAssignmentStatus(
  id: string,
  status: "pending" | "in_progress" | "completed" | "cancelled"
) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== assignment.organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.assignment.update({
    where: { id },
    data: {
      status,
      ...(status === "completed" && { completedAt: new Date() }),
    },
  });
}

