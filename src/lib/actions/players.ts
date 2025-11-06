"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";
import bcrypt from "bcrypt";

export interface CreatePlayerData {
  name: string;
  email: string;
  password: string;
  phone: string;
  username: string;
  position: string;
  teamId?: string;
  dateOfBirth?: string;
  state?: string;
  currentLocation?: string;
  preferredFoot?: string;
  height?: number;
  weight?: number;
  bio?: string;
}

export interface CreatePlayerResult {
  success: boolean;
  player?: any;
  error?: string;
}

export async function createOrganizationPlayer(
  organizationId: string,
  data: CreatePlayerData
): Promise<CreatePlayerResult> {
  try {
    const session = await getSession();
    if (!session || session.role === "player") {
      return { success: false, error: "Unauthorized" };
    }

    const orgSession = session as OrgAuthData;
    if (orgSession.organizationId !== organizationId) {
      return { success: false, error: "Forbidden" };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    // Check if username already exists
    const existingPlayer = await prisma.player.findUnique({
      where: { username: data.username },
    });

    if (existingPlayer) {
      return { success: false, error: "Username already taken" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Verify team belongs to organization if provided
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

    // Create user and player in transaction
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        role: "player",
        organizationId,
      },
    });

    const player = await prisma.player.create({
      data: {
        userId: user.id,
        organizationId,
        teamId: data.teamId || null,
        name: data.name,
        username: data.username,
        phone: data.phone,
        avatar: `https://picsum.photos/seed/${data.name.split(" ")[0]}/100/100`,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        state: data.state,
        currentLocation: data.currentLocation || data.state,
        position: data.position,
        preferredFoot: data.preferredFoot,
        height: data.height,
        weight: data.weight,
        bio:
          data.bio ||
          `Professional footballer${data.state ? ` from ${data.state}` : ""}.`,
        subscriptionTier: "free",
        trainingCompleted: [],
        badges: [],
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, player };
  } catch (error: any) {
    console.error("Create organization player error:", error);
    return {
      success: false,
      error: error.message || "Failed to create player",
    };
  }
}

export async function getPlayerByUsername(username: string) {
  try {
    const player = await prisma.player.findUnique({
      where: { username },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        leagueStats: {
          orderBy: {
            season: "desc",
          },
        },
      },
    });

    if (!player) {
      return null;
    }

    return player;
  } catch (error: any) {
    console.error("Get player by username error:", error);
    return null;
  }
}