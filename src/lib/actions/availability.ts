"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface UpdateAvailabilityData {
  eventId: string;
  playerId: string;
  status: "available" | "unavailable" | "maybe" | "pending";
  notes?: string;
}

export async function updateAvailability(data: UpdateAvailabilityData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Check if player belongs to organization or is the player themselves
  const player = await prisma.player.findUnique({
    where: { id: data.playerId },
    include: {
      organization: true,
    },
  });

  if (!player) {
    throw new Error("Player not found");
  }

  // Allow if player is updating their own availability or org admin
  if (session.role === "player") {
    const playerSession = session;
    if (player.userId !== playerSession.id) {
      throw new Error("Forbidden");
    }
  } else {
    const orgSession = session as OrgAuthData;
    if (player.organizationId !== orgSession.organizationId) {
      throw new Error("Forbidden");
    }
  }

  return prisma.availability.upsert({
    where: {
      eventId_playerId: {
        eventId: data.eventId,
        playerId: data.playerId,
      },
    },
    update: {
      status: data.status,
      notes: data.notes,
      respondedAt: new Date(),
    },
    create: {
      ...data,
      respondedAt: new Date(),
    },
  });
}

export async function getEventAvailabilities(eventId: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organization: true,
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // Check permissions
  if (session.role === "player") {
    throw new Error("Players cannot view all availabilities");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== event.organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.availability.findMany({
    where: { eventId },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
    },
    orderBy: { respondedAt: "desc" },
  });
}

