"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";

// Verify super-admin access
async function verifySuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    throw new Error("Unauthorized: Super-admin access required");
  }
  return session;
}

// Get system-wide KPIs for dashboard
export async function getSystemKPIs() {
  await verifySuperAdmin();

  try {
    const [
      totalOrganizations,
      totalUsers,
      totalPlayers,
      totalContracts,
      totalInvoices,
      totalRevenue,
      activeSubscriptions,
      recentOrganizations,
      recentUsers,
    ] = await Promise.all([
      // Total organizations
      prisma.organization.count(),
      
      // Total users with role breakdown
      prisma.user.findMany({
        select: { role: true },
      }),
      
      // Total players
      prisma.player.count(),
      
      // Total contracts
      prisma.contract.count({ where: { status: "active" } }),
      
      // Total invoices
      prisma.invoice.count(),
      
      // Total revenue from paid invoices
      prisma.invoice.aggregate({
        where: { status: "paid" },
        _sum: { amount: true },
      }),
      
      // Active subscriptions by tier
      prisma.player.groupBy({
        by: ["subscriptionTier"],
        _count: true,
      }),
      
      // Recent organizations (last 30 days)
      prisma.organization.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // Recent users (last 30 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Calculate role breakdown
    const roleBreakdown = totalUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Format subscription tiers
    const subscriptionsByTier = activeSubscriptions.reduce((acc, sub) => {
      acc[sub.subscriptionTier] = sub._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrganizations,
      totalUsers: totalUsers.length,
      totalPlayers,
      totalContracts,
      totalInvoices,
      totalRevenue: totalRevenue._sum.amount || 0,
      recentOrganizations,
      recentUsers,
      roleBreakdown,
      subscriptionsByTier,
    };
  } catch (error) {
    console.error("Error fetching system KPIs:", error);
    throw new Error("Failed to fetch system KPIs");
  }
}

// Get organization growth trends
export async function getOrganizationGrowthTrends(days: number = 30) {
  await verifySuperAdmin();

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const organizations = await prisma.organization.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        type: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return organizations;
  } catch (error) {
    console.error("Error fetching organization growth trends:", error);
    throw new Error("Failed to fetch organization growth trends");
  }
}

// Get user growth trends
export async function getUserGrowthTrends(days: number = 30) {
  await verifySuperAdmin();

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        role: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return users;
  } catch (error) {
    console.error("Error fetching user growth trends:", error);
    throw new Error("Failed to fetch user growth trends");
  }
}

// Get revenue trends
export async function getRevenueTrends(days: number = 30) {
  await verifySuperAdmin();

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const invoices = await prisma.invoice.findMany({
      where: {
        status: "paid",
        paidAt: { gte: startDate },
      },
      select: {
        paidAt: true,
        amount: true,
        currency: true,
      },
      orderBy: { paidAt: "asc" },
    });

    return invoices;
  } catch (error) {
    console.error("Error fetching revenue trends:", error);
    throw new Error("Failed to fetch revenue trends");
  }
}

// Get recent activity across the platform
export async function getRecentActivity(limit: number = 50) {
  await verifySuperAdmin();

  try {
    const auditLogs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    return auditLogs;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw new Error("Failed to fetch recent activity");
  }
}

// Get critical alerts
export async function getCriticalAlerts() {
  await verifySuperAdmin();

  try {
    const [
      overdueInvoices,
      expiredBackgroundChecks,
      expiredDocuments,
      expiringSubscriptions,
    ] = await Promise.all([
      // Overdue invoices
      prisma.invoice.count({
        where: {
          status: "overdue",
        },
      }),
      
      // Expired background checks
      prisma.backgroundCheck.count({
        where: {
          status: "expired",
        },
      }),
      
      // Expired documents
      prisma.document.count({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      }),
      
      // Subscriptions expiring in next 7 days
      prisma.player.count({
        where: {
          subscriptionExpiry: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      overdueInvoices,
      expiredBackgroundChecks,
      expiredDocuments,
      expiringSubscriptions,
    };
  } catch (error) {
    console.error("Error fetching critical alerts:", error);
    throw new Error("Failed to fetch critical alerts");
  }
}

