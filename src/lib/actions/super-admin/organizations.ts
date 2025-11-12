"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";

async function verifySuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    throw new Error("Unauthorized: Super-admin access required");
  }
  return session;
}

// Get all organizations with filters
export async function getAllOrganizations(filters?: {
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  await verifySuperAdmin();

  try {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { slug: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (filters?.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        orderBy,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        include: {
          _count: {
            select: {
              teams: true,
              users: true,
              players: true,
              contracts: true,
              invoices: true,
            },
          },
        },
      }),
      prisma.organization.count({ where }),
    ]);

    return { organizations, total };
  } catch (error) {
    console.error("Error fetching organizations:", error);
    throw new Error("Failed to fetch organizations");
  }
}

// Get single organization with full details
export async function getOrganizationDetails(organizationId: string) {
  await verifySuperAdmin();

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        teams: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: { players: true },
            },
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            lastLoginAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        players: {
          select: {
            id: true,
            name: true,
            username: true,
            subscriptionTier: true,
            joinedAt: true,
            teamId: true,
          },
          orderBy: { joinedAt: "desc" },
        },
        contracts: {
          where: { status: "active" },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            salary: true,
            player: {
              select: {
                name: true,
                id: true,
              },
            },
          },
          orderBy: { startDate: "desc" },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            invoiceNumber: true,
            amount: true,
            status: true,
            dueDate: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            teams: true,
            users: true,
            players: true,
            contracts: true,
            invoices: true,
            events: true,
            announcements: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            action: true,
            entityType: true,
            entityId: true,
            metadata: true,
            createdAt: true,
            user: {
              select: { email: true },
            },
          },
        },
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    return organization;
  } catch (error) {
    console.error("Error fetching organization details:", error);
    throw new Error("Failed to fetch organization details");
  }
}

// Update organization
export async function updateOrganization(
  organizationId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    description?: string;
    logo?: string;
  }
) {
  await verifySuperAdmin();

  try {
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return { success: true, organization };
  } catch (error) {
    console.error("Error updating organization:", error);
    return { success: false, error: "Failed to update organization" };
  }
}

// Delete organization (with cascade warning)
export async function deleteOrganization(organizationId: string) {
  await verifySuperAdmin();

  try {
    // This will cascade delete all related entities
    await prisma.organization.delete({
      where: { id: organizationId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting organization:", error);
    return { success: false, error: "Failed to delete organization" };
  }
}

// Get organization statistics
export async function getOrganizationStats(organizationId: string) {
  await verifySuperAdmin();

  try {
    const [
      totalRevenue,
      pendingInvoices,
      activeContracts,
      recentActivity,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: "paid",
        },
        _sum: { amount: true },
      }),
      prisma.invoice.count({
        where: {
          organizationId,
          status: { in: ["sent", "draft"] },
        },
      }),
      prisma.contract.count({
        where: {
          organizationId,
          status: "active",
        },
      }),
      prisma.auditLog.findMany({
        where: { organizationId },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { email: true },
          },
        },
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingInvoices,
      activeContracts,
      recentActivity,
    };
  } catch (error) {
    console.error("Error fetching organization stats:", error);
    throw new Error("Failed to fetch organization stats");
  }
}

// Export organization data
export async function exportOrganizationData(organizationId: string) {
  await verifySuperAdmin();

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        teams: true,
        users: true,
        players: true,
        contracts: true,
        invoices: true,
        events: true,
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    // Return data as JSON (can be converted to CSV/Excel on frontend)
    return organization;
  } catch (error) {
    console.error("Error exporting organization data:", error);
    throw new Error("Failed to export organization data");
  }
}

