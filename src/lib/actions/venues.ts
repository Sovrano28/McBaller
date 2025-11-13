"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface CreateVenueData {
  organizationId: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  capacity?: number;
  facilities?: string[];
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
}

export async function createVenue(data: CreateVenueData) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== data.organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.venue.create({
    data: {
      ...data,
      facilities: data.facilities || [],
    },
  });
}

export async function getOrganizationVenues(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  return prisma.venue.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          bookings: true,
          fixtures: true,
          events: true,
        },
      },
    },
  });
}

export async function getVenue(id: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const venue = await prisma.venue.findUnique({
    where: { id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      bookings: {
        where: {
          status: { in: ["pending", "confirmed"] },
        },
        orderBy: { startTime: "asc" },
        take: 10,
      },
    },
  });

  if (!venue) {
    throw new Error("Venue not found");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== venue.organizationId) {
    throw new Error("Forbidden");
  }

  return venue;
}

export async function getVenueEvents(venueId: string, organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  // Verify venue belongs to organization
  const venue = await prisma.venue.findFirst({
    where: {
      id: venueId,
      organizationId,
    },
  });

  if (!venue) {
    throw new Error("Venue not found");
  }

  return prisma.event.findMany({
    where: {
      venueId,
      organizationId,
      startTime: {
        gte: new Date(), // Only future events
      },
      status: "scheduled",
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
    take: 20,
  });
}

