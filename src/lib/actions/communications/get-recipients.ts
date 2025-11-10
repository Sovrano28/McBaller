"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";

export interface Recipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: "user" | "player" | "organization" | "team";
  avatar?: string;
  metadata?: any;
}

/**
 * Get available recipient groups based on user role
 */
export async function getRecipientGroups() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const groups = [];

    if (session.role === "super_admin") {
      groups.push(
        { value: "organizations", label: "Organizations", icon: "Building2" },
        { value: "teams", label: "Teams", icon: "Users" },
        { value: "agents", label: "Agents", icon: "UserCheck" },
        { value: "players", label: "Players", icon: "User" }
      );
    } else {
      // Organization users
      groups.push(
        { value: "teams", label: "Teams", icon: "Users" },
        { value: "agents", label: "Agents", icon: "UserCheck" },
        { value: "players", label: "Players", icon: "User" }
      );
    }

    return { success: true, data: groups };
  } catch (error) {
    console.error("Error fetching recipient groups:", error);
    return { success: false, error: "Failed to fetch recipient groups" };
  }
}

/**
 * Get recipients by group type
 */
export async function getRecipientsByGroup(
  groupType: string,
  searchQuery?: string
): Promise<{ success: boolean; data?: Recipient[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    let recipients: Recipient[] = [];

    switch (groupType) {
      case "organizations":
        if (session.role === "super_admin") {
          const orgs = await prisma.organization.findMany({
            where: searchQuery
              ? {
                  OR: [
                    { name: { contains: searchQuery, mode: "insensitive" } },
                    { email: { contains: searchQuery, mode: "insensitive" } },
                  ],
                }
              : undefined,
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              logo: true,
              type: true,
            },
            take: 50,
          });

          recipients = orgs.map((org) => ({
            id: org.id,
            name: org.name,
            email: org.email,
            phone: org.phone || undefined,
            type: "organization" as const,
            avatar: org.logo || undefined,
            metadata: { orgType: org.type },
          }));
        }
        break;

      case "teams":
        const teamWhere: any = {};
        if (session.role !== "super_admin") {
          teamWhere.organizationId = session.organizationId;
        }
        if (searchQuery) {
          teamWhere.name = { contains: searchQuery, mode: "insensitive" };
        }

        const teams = await prisma.team.findMany({
          where: teamWhere,
          select: {
            id: true,
            name: true,
            logo: true,
            organization: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          take: 50,
        });

        recipients = teams.map((team) => ({
          id: team.id,
          name: team.name,
          email: team.organization.email,
          type: "team" as const,
          avatar: team.logo || undefined,
          metadata: { organizationName: team.organization.name },
        }));
        break;

      case "agents":
        const agentWhere: any = {
          role: { in: ["org_admin", "coach", "finance", "analyst"] },
        };
        if (session.role !== "super_admin") {
          agentWhere.organizationId = session.organizationId;
        }
        if (searchQuery) {
          agentWhere.OR = [
            { fullName: { contains: searchQuery, mode: "insensitive" } },
            { email: { contains: searchQuery, mode: "insensitive" } },
          ];
        }

        const agents = await prisma.user.findMany({
          where: agentWhere,
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            avatar: true,
            role: true,
            organization: {
              select: {
                name: true,
              },
            },
          },
          take: 50,
        });

        recipients = agents.map((agent) => ({
          id: agent.id,
          name: agent.fullName,
          email: agent.email,
          phone: agent.phoneNumber || undefined,
          type: "user" as const,
          avatar: agent.avatar || undefined,
          metadata: {
            role: agent.role,
            organizationName: agent.organization?.name,
          },
        }));
        break;

      case "players":
        const playerWhere: any = {};
        if (session.role !== "super_admin") {
          playerWhere.organizationId = session.organizationId;
        }
        if (searchQuery) {
          playerWhere.OR = [
            { fullName: { contains: searchQuery, mode: "insensitive" } },
            { email: { contains: searchQuery, mode: "insensitive" } },
          ];
        }

        const players = await prisma.player.findMany({
          where: playerWhere,
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            avatar: true,
            position: true,
            team: {
              select: {
                name: true,
              },
            },
            organization: {
              select: {
                name: true,
              },
            },
          },
          take: 50,
        });

        recipients = players.map((player) => ({
          id: player.id,
          name: player.fullName,
          email: player.email || undefined,
          phone: player.phoneNumber || undefined,
          type: "player" as const,
          avatar: player.avatar || undefined,
          metadata: {
            position: player.position,
            teamName: player.team?.name,
            organizationName: player.organization.name,
          },
        }));
        break;

      default:
        return { success: false, error: "Invalid group type" };
    }

    return { success: true, data: recipients };
  } catch (error) {
    console.error("Error fetching recipients:", error);
    return { success: false, error: "Failed to fetch recipients" };
  }
}

/**
 * Search for individual recipients across all types
 */
export async function searchRecipients(
  query: string
): Promise<{ success: boolean; data?: Recipient[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const results: Recipient[] = [];

    // Search organizations (super-admin only)
    if (session.role === "super_admin") {
      const orgs = await prisma.organization.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          logo: true,
        },
        take: 10,
      });

      results.push(
        ...orgs.map((org) => ({
          id: org.id,
          name: org.name,
          email: org.email,
          phone: org.phone || undefined,
          type: "organization" as const,
          avatar: org.logo || undefined,
        }))
      );
    }

    // Search teams
    const teamWhere: any = {
      name: { contains: query, mode: "insensitive" },
    };
    if (session.role !== "super_admin") {
      teamWhere.organizationId = session.organizationId;
    }

    const teams = await prisma.team.findMany({
      where: teamWhere,
      select: {
        id: true,
        name: true,
        logo: true,
        organization: {
          select: {
            email: true,
          },
        },
      },
      take: 10,
    });

    results.push(
      ...teams.map((team) => ({
        id: team.id,
        name: team.name,
        email: team.organization.email,
        type: "team" as const,
        avatar: team.logo || undefined,
      }))
    );

    // Search users
    const userWhere: any = {
      OR: [
        { fullName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    };
    if (session.role !== "super_admin") {
      userWhere.organizationId = session.organizationId;
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        role: true,
      },
      take: 10,
    });

    results.push(
      ...users.map((user) => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phoneNumber || undefined,
        type: "user" as const,
        avatar: user.avatar || undefined,
        metadata: { role: user.role },
      }))
    );

    // Search players
    const playerWhere: any = {
      OR: [
        { fullName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    };
    if (session.role !== "super_admin") {
      playerWhere.organizationId = session.organizationId;
    }

    const players = await prisma.player.findMany({
      where: playerWhere,
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        position: true,
      },
      take: 10,
    });

    results.push(
      ...players.map((player) => ({
        id: player.id,
        name: player.fullName,
        email: player.email || undefined,
        phone: player.phoneNumber || undefined,
        type: "player" as const,
        avatar: player.avatar || undefined,
        metadata: { position: player.position },
      }))
    );

    return { success: true, data: results };
  } catch (error) {
    console.error("Error searching recipients:", error);
    return { success: false, error: "Failed to search recipients" };
  }
}

/**
 * Get recipient count for a given configuration
 */
export async function getRecipientCount(
  recipientType: string,
  recipientGroups?: string[],
  recipientIds?: string[]
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    let count = 0;

    if (recipientType === "all") {
      // Count all users and players in the organization
      if (session.role === "super_admin") {
        const [usersCount, playersCount] = await Promise.all([
          prisma.user.count(),
          prisma.player.count(),
        ]);
        count = usersCount + playersCount;
      } else {
        const [usersCount, playersCount] = await Promise.all([
          prisma.user.count({ where: { organizationId: session.organizationId } }),
          prisma.player.count({ where: { organizationId: session.organizationId } }),
        ]);
        count = usersCount + playersCount;
      }
    } else if (recipientType === "selective" && recipientGroups) {
      // Count based on selected groups
      for (const group of recipientGroups) {
        if (group === "organizations" && session.role === "super_admin") {
          count += await prisma.organization.count();
        } else if (group === "teams") {
          const where = session.role === "super_admin" ? {} : { organizationId: session.organizationId };
          count += await prisma.team.count({ where });
        } else if (group === "agents") {
          const where: any = { role: { in: ["org_admin", "coach", "finance", "analyst"] } };
          if (session.role !== "super_admin") {
            where.organizationId = session.organizationId;
          }
          count += await prisma.user.count({ where });
        } else if (group === "players") {
          const where = session.role === "super_admin" ? {} : { organizationId: session.organizationId };
          count += await prisma.player.count({ where });
        }
      }
    } else if (recipientType === "individual" && recipientIds) {
      count = recipientIds.length;
    }

    return { success: true, count };
  } catch (error) {
    console.error("Error calculating recipient count:", error);
    return { success: false, error: "Failed to calculate recipient count" };
  }
}

