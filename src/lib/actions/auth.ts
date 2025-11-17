"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import type {
  AuthSession,
  UserRole,
  PlayerAuthData,
  OrgAuthData,
  SuperAdminAuthData,
} from "@/lib/auth-types";

export interface LoginResult {
  success: boolean;
  user?: AuthSession;
  error?: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        player: true,
        organization: true,
      },
    });

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check if user account is active
    if (user.isActive === false) {
      return { success: false, error: "Account has been deactivated. Please contact support." };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Build auth session based on role
    let authSession: AuthSession;

    if (user.role === "player" && user.player) {
      authSession = {
        id: user.id,
        email: user.email,
        role: "player",
        organizationId: user.organizationId,
        playerId: user.player.id,
        name: user.player.name,
        username: user.player.username,
        avatar: user.player.avatar || undefined,
        subscriptionTier: user.player.subscriptionTier || "free",
        subscriptionExpiry:
          user.player.subscriptionExpiry?.toISOString() || undefined,
        trialUsed: user.player.trialUsed || false,
      };
    } else if (
      user.organizationId &&
      ["org_admin", "coach", "finance", "analyst"].includes(user.role)
    ) {
      authSession = {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
      };
    } else if (user.role === "super_admin") {
      authSession = {
        id: user.id,
        email: user.email,
        role: "super_admin",
        organizationId: null,
      };
    } else {
      return { success: false, error: "Invalid user configuration" };
    }

    // Set session cookie
    (await cookies()).set("auth-session", JSON.stringify(authSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { success: true, user: authSession };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred during login" };
  }
}

export async function logout(): Promise<void> {
  (await cookies()).delete("auth-session");
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const sessionCookie = (await cookies()).get("auth-session");
    if (!sessionCookie?.value) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value) as AuthSession;

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        player: true,
        organization: true,
      },
    });

    if (!user) {
      return null;
    }

    // Verify role matches
    if (user.role !== session.role) {
      return null;
    }

    // For org users, verify organizationId matches
    if (
      session.role !== "player" &&
      user.organizationId !== session.organizationId
    ) {
      return null;
    }

    // For players, enrich session with player data
    if (session.role === "player" && user.player) {
      const enrichedSession: PlayerAuthData = {
        ...session,
        playerId: user.player.id,
        name: user.player.name,
        username: user.player.username,
        avatar: user.player.avatar || undefined,
        banner: user.player.banner || undefined,
        subscriptionTier: user.player.subscriptionTier || "free",
        subscriptionExpiry:
          user.player.subscriptionExpiry?.toISOString() || undefined,
        trialUsed: user.player.trialUsed || false,
      };
      return enrichedSession;
    }

    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

export interface PlayerSignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
  username: string;
  position: string;
  dateOfBirth?: string;
  state?: string;
  currentLocation?: string;
  preferredFoot?: string;
  height?: number;
  weight?: number;
  bio?: string;
}

export interface PlayerSignupResult {
  success: boolean;
  user?: PlayerAuthData;
  error?: string;
}

export async function signupPlayer(
  data: PlayerSignupData
): Promise<PlayerSignupResult> {
  try {
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

    // Calculate trial expiry (14 days from now)
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 14);

    // Create user and player in transaction
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        role: "player",
      },
    });

    const player = await prisma.player.create({
      data: {
        userId: user.id,
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
          `Passionate Nigerian footballer${
            data.state ? ` from ${data.state}` : ""
          }. Ready to take my game to the next level!`,
        subscriptionTier: "pro", // Start with Pro trial
        subscriptionExpiry: trialExpiry,
        trialUsed: false,
        trainingCompleted: [],
        badges: [],
      },
    });

    // Build auth session
    const authSession: PlayerAuthData = {
      id: user.id,
      email: user.email,
      role: "player",
      organizationId: user.organizationId,
      playerId: player.id,
      name: player.name,
      username: player.username,
      avatar: player.avatar || undefined,
      subscriptionTier: player.subscriptionTier || "free",
      subscriptionExpiry: player.subscriptionExpiry?.toISOString() || undefined,
      trialUsed: player.trialUsed || false,
    };

    // Set session cookie
    (await cookies()).set("auth-session", JSON.stringify(authSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { success: true, user: authSession };
  } catch (error) {
    console.error("Player signup error:", error);
    return { success: false, error: "An error occurred during signup" };
  }
}

export interface OrganizationSignupData {
  name: string;
  email: string;
  password: string;
  type: "club" | "team" | "agent";
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
}

export interface OrganizationSignupResult {
  success: boolean;
  user?: OrgAuthData;
  error?: string;
}

export async function signupOrganization(
  data: OrganizationSignupData
): Promise<OrganizationSignupResult> {
  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    // Generate slug from organization name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      return {
        success: false,
        error: "Organization name already taken. Please use a different name.",
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create organization and user in transaction
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug,
        type: data.type,
        email: data.email.toLowerCase(),
        phone: data.phone,
        address: data.address,
        website: data.website,
        description: data.description,
      },
    });

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        role: "org_admin",
        organizationId: organization.id,
      },
    });

    // Build auth session
    const authSession: OrgAuthData = {
      id: user.id,
      email: user.email,
      role: "org_admin",
      organizationId: organization.id,
      organizationName: organization.name,
    };

    // Set session cookie
    (await cookies()).set("auth-session", JSON.stringify(authSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { success: true, user: authSession };
  } catch (error) {
    console.error("Organization signup error:", error);
    return { success: false, error: "An error occurred during signup" };
  }
}

export interface SuperAdminSignupData {
  name: string;
  email: string;
  password: string;
  inviteCode: string;
}

export interface SuperAdminSignupResult {
  success: boolean;
  user?: SuperAdminAuthData;
  error?: string;
}

export async function signupSuperAdmin(
  data: SuperAdminSignupData
): Promise<SuperAdminSignupResult> {
  try {
    // Check if super-admin signup is enabled
    const enableSignup = process.env.ENABLE_SUPER_ADMIN_SIGNUP === "true";
    if (!enableSignup) {
      return { success: false, error: "Super-admin signup is disabled" };
    }

    // Verify invite code
    const validInviteCode = process.env.SUPER_ADMIN_INVITE_CODE;
    if (!validInviteCode || data.inviteCode !== validInviteCode) {
      return { success: false, error: "Invalid invite code" };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create super-admin user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        role: "super_admin",
        organizationId: null,
      },
    });

    // Build auth session
    const authSession: SuperAdminAuthData = {
      id: user.id,
      email: user.email,
      role: "super_admin",
      organizationId: null,
    };

    // Set session cookie
    (await cookies()).set("auth-session", JSON.stringify(authSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { success: true, user: authSession };
  } catch (error) {
    console.error("Super-admin signup error:", error);
    return { success: false, error: "An error occurred during signup" };
  }
}
