"use server";

import { prisma } from "@/lib/prisma";
import { getSession, logout } from "@/lib/actions/auth";
import { cookies } from "next/headers";
import type { AuthSession, PlayerAuthData, OrgAuthData } from "@/lib/auth-types";
import { logAction } from "@/lib/audit-logger";

async function verifySuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    throw new Error("Unauthorized: Super-admin access required");
  }
  return session;
}

// Start impersonation session
export async function startImpersonation(userId: string) {
  const superAdminSession = await verifySuperAdmin();

  try {
    // Get the user to impersonate
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        player: true,
        organization: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Don't allow impersonating another super-admin
    if (user.role === "super_admin") {
      return { success: false, error: "Cannot impersonate another super-admin" };
    }

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
        role: user.role as any,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
      };
    } else {
      return { success: false, error: "Invalid user configuration" };
    }

    // Store original super-admin session before impersonating
    const cookieStore = await cookies();
    cookieStore.set("original-super-admin-session", JSON.stringify(superAdminSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });

    // Set impersonation flag
    cookieStore.set("is-impersonating", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });

    // Set the impersonated user session
    cookieStore.set("auth-session", JSON.stringify(authSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 2, // 2 hours - shorter for impersonation
      path: "/",
    });

    // Log impersonation action
    await logAction({
      action: "view",
      entityType: "user_impersonation",
      entityId: userId,
      metadata: {
        impersonatedEmail: user.email,
        impersonatedRole: user.role,
        superAdminEmail: superAdminSession.email,
      },
    });

    return { success: true, user: authSession };
  } catch (error) {
    console.error("Error starting impersonation:", error);
    return { success: false, error: "Failed to start impersonation" };
  }
}

// End impersonation and return to super-admin session
export async function endImpersonation() {
  try {
    const cookieStore = await cookies();
    
    // Get original super-admin session
    const originalSessionCookie = cookieStore.get("original-super-admin-session");
    if (!originalSessionCookie?.value) {
      return { success: false, error: "No impersonation session found" };
    }

    const originalSession = JSON.parse(originalSessionCookie.value);

    // Restore super-admin session
    cookieStore.set("auth-session", JSON.stringify(originalSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Remove impersonation cookies
    cookieStore.delete("original-super-admin-session");
    cookieStore.delete("is-impersonating");

    // Log end of impersonation
    await logAction({
      action: "view",
      entityType: "user_impersonation_end",
      metadata: {
        superAdminEmail: originalSession.email,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error ending impersonation:", error);
    return { success: false, error: "Failed to end impersonation" };
  }
}

// Check if currently impersonating
export async function isImpersonating() {
  try {
    const cookieStore = await cookies();
    const impersonatingCookie = cookieStore.get("is-impersonating");
    return impersonatingCookie?.value === "true";
  } catch (error) {
    return false;
  }
}

// Get impersonation info
export async function getImpersonationInfo() {
  try {
    const cookieStore = await cookies();
    const impersonatingCookie = cookieStore.get("is-impersonating");
    const originalSessionCookie = cookieStore.get("original-super-admin-session");
    
    if (impersonatingCookie?.value === "true" && originalSessionCookie?.value) {
      const originalSession = JSON.parse(originalSessionCookie.value);
      const currentSession = await getSession();
      
      return {
        isImpersonating: true,
        superAdminEmail: originalSession.email,
        impersonatedUser: currentSession,
      };
    }
    
    return { isImpersonating: false };
  } catch (error) {
    return { isImpersonating: false };
  }
}

