"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface CreateEventData {
  title: string;
  description?: string;
  type: "practice" | "game" | "tournament" | "meeting";
  startTime: Date;
  endTime: Date;
  location?: string;
  isAllDay?: boolean;
  teamId?: string;
  venueId?: string;
  attendees?: any[];
  reminders?: any[];
}

export interface UpdateEventData extends Partial<CreateEventData> {
  status?: "scheduled" | "cancelled" | "completed";
  recurringType?: "none" | "daily" | "weekly" | "monthly";
  recurringEnd?: Date;
  externalId?: string;
}

export async function getOrganizationEvents(
  organizationId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    teamId?: string;
    status?: string;
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

  const where: any = {
    organizationId,
  };

  if (filters?.startDate || filters?.endDate) {
    where.startTime = {};
    if (filters.startDate) {
      where.startTime.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.startTime.lte = filters.endDate;
    }
  }

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.teamId) {
    where.teamId = filters.teamId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      venue: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return events;
}

export async function getEvent(organizationId: string, eventId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizationId,
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      venue: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  return event;
}

export async function createEvent(
  organizationId: string,
  data: CreateEventData
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
    // Validate team belongs to organization if provided
    if (data.teamId) {
      const team = await prisma.team.findFirst({
        where: {
          id: data.teamId,
          organizationId,
        },
      });

      if (!team) {
        return {
          success: false,
          error: "Team not found or doesn't belong to organization",
        };
      }
    }

    // Validate venue belongs to organization if provided
    if (data.venueId) {
      const venue = await prisma.venue.findFirst({
        where: {
          id: data.venueId,
          organizationId,
        },
      });

      if (!venue) {
        return {
          success: false,
          error: "Venue not found or doesn't belong to organization",
        };
      }
    }

    const event = await prisma.event.create({
      data: {
        organizationId,
        createdById: orgSession.userId,
        title: data.title,
        description: data.description,
        type: data.type,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.venueId ? undefined : data.location, // Use venue address if venue selected
        isAllDay: data.isAllDay || false,
        teamId: data.teamId || null,
        venueId: data.venueId || null,
        attendees: data.attendees || null,
        reminders: data.reminders || null,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return { success: true, event };
  } catch (error: any) {
    console.error("Create event error:", error);
    return { success: false, error: error.message || "Failed to create event" };
  }
}

export async function updateEvent(
  organizationId: string,
  eventId: string,
  data: UpdateEventData
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
    // Verify event exists and belongs to organization
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizationId,
      },
    });

    if (!existingEvent) {
      return { success: false, error: "Event not found" };
    }

    // Validate team if provided
    if (data.teamId) {
      const team = await prisma.team.findFirst({
        where: {
          id: data.teamId,
          organizationId,
        },
      });

      if (!team) {
        return {
          success: false,
          error: "Team not found or doesn't belong to organization",
        };
      }
    }

    // Validate venue if provided
    if (data.venueId) {
      const venue = await prisma.venue.findFirst({
        where: {
          id: data.venueId,
          organizationId,
        },
      });

      if (!venue) {
        return {
          success: false,
          error: "Venue not found or doesn't belong to organization",
        };
      }
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.venueId ? undefined : data.location,
        isAllDay: data.isAllDay,
        status: data.status,
        recurringType: data.recurringType,
        recurringEnd: data.recurringEnd,
        teamId: data.teamId,
        venueId: data.venueId,
        attendees: data.attendees,
        reminders: data.reminders,
        externalId: data.externalId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return { success: true, event };
  } catch (error: any) {
    console.error("Update event error:", error);
    return { success: false, error: error.message || "Failed to update event" };
  }
}

export async function deleteEvent(organizationId: string, eventId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    return { success: false, error: "Unauthorized" };
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    return { success: false, error: "Forbidden" };
  }

  try {
    // Verify event exists and belongs to organization
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizationId,
      },
    });

    if (!existingEvent) {
      return { success: false, error: "Event not found" };
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete event error:", error);
    return { success: false, error: error.message || "Failed to delete event" };
  }
}

export async function getUpcomingEvents(organizationId: string, limit = 10) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const events = await prisma.event.findMany({
    where: {
      organizationId,
      startTime: {
        gte: new Date(),
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
    take: limit,
  });

  return events;
}

export async function getPlayerEvents(playerId: string, filters?: {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  status?: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "player") {
    throw new Error("Unauthorized");
  }

  // Get player's contracts to find their teams
  const contracts = await prisma.contract.findMany({
    where: {
      playerId,
      status: "active",
    },
    select: {
      teamId: true,
    },
  });

  const teamIds = contracts.map((c) => c.teamId);

  // Get organization IDs from contracts
  const teams = await prisma.team.findMany({
    where: {
      id: { in: teamIds },
    },
    select: {
      organizationId: true,
    },
  });

  const organizationIds = [...new Set(teams.map((t) => t.organizationId))];

  const where: any = {
    OR: [
      // Events for teams the player is on
      {
        teamId: { in: teamIds },
        organizationId: { in: organizationIds },
      },
      // Organization-wide events (no teamId)
      {
        teamId: null,
        organizationId: { in: organizationIds },
      },
    ],
    status: filters?.status || { not: "cancelled" },
  };

  // Check for events where player is explicitly added as attendee
  // This will be handled by checking the attendees JSON field
  // We'll include all events and filter in the application layer if needed

  if (filters?.startDate || filters?.endDate) {
    where.startTime = {};
    if (filters.startDate) {
      where.startTime.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.startTime.lte = filters.endDate;
    }
  }

  if (filters?.type) {
    where.type = filters.type;
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      venue: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  // Filter events where player is explicitly added as attendee
  const attendeeEvents = events.filter((event) => {
    if (!event.attendees) return false;
    try {
      const attendees = Array.isArray(event.attendees)
        ? event.attendees
        : JSON.parse(event.attendees as any);
      return attendees.some(
        (attendee: any) =>
          (typeof attendee === "string" && attendee === playerId) ||
          (typeof attendee === "object" && attendee.id === playerId)
      );
    } catch {
      return false;
    }
  });

  // Combine team/organization events with attendee events, removing duplicates
  const eventMap = new Map();
  [...events, ...attendeeEvents].forEach((event) => {
    if (!eventMap.has(event.id)) {
      eventMap.set(event.id, event);
    }
  });

  return Array.from(eventMap.values());
}

