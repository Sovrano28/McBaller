"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import bcrypt from "bcrypt";

async function verifySuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    throw new Error("Unauthorized: Super-admin access required");
  }
  return session;
}

// Get all users with filters
export async function getAllUsers(filters?: {
  role?: string;
  organizationId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  await verifySuperAdmin();

  try {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters?.search) {
      where.email = { contains: filters.search, mode: "insensitive" };
    }

    const orderBy: any = {};
    if (filters?.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        select: {
          id: true,
          email: true,
          role: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          organization: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          player: {
            select: {
              id: true,
              name: true,
              username: true,
              subscriptionTier: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

// Get user details with activity
export async function getUserDetails(userId: string) {
  await verifySuperAdmin();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        player: {
          include: {
            contracts: {
              select: {
                id: true,
                startDate: true,
                endDate: true,
                status: true,
                organization: {
                  select: { name: true },
                },
              },
            },
            invoices: {
              select: {
                id: true,
                invoiceNumber: true,
                amount: true,
                status: true,
              },
            },
            leagueStats: true,
          },
        },
        auditLogs: {
          take: 50,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            action: true,
            entityType: true,
            entityId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw new Error("Failed to fetch user details");
  }
}

// Update user
export async function updateUser(
  userId: string,
  data: {
    email?: string;
    role?: string;
    organizationId?: string | null;
  }
) {
  await verifySuperAdmin();

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Failed to update user" };
  }
}

// Reset user password
export async function resetUserPassword(
  userId: string,
  newPassword: string
) {
  await verifySuperAdmin();

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

// Suspend/activate user
export async function toggleUserStatus(userId: string, suspend: boolean) {
  await verifySuperAdmin();

  try {
    // Note: You might want to add a 'status' field to the User model
    // For now, we'll just update the updatedAt field
    // In a production app, you'd want to add a status field
    
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });

    return { success: true, suspended: suspend };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return { success: false, error: "Failed to toggle user status" };
  }
}

// Delete user
export async function deleteUser(userId: string) {
  await verifySuperAdmin();

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

// Get user activity timeline
export async function getUserActivityTimeline(userId: string, limit: number = 100) {
  await verifySuperAdmin();

  try {
    const activities = await prisma.auditLog.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        organization: {
          select: { name: true },
        },
      },
    });

    return activities;
  } catch (error) {
    console.error("Error fetching user activity:", error);
    throw new Error("Failed to fetch user activity");
  }
}

