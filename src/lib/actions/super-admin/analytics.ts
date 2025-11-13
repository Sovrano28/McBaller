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

// Get platform engagement metrics
export async function getPlatformEngagement(days: number = 30) {
  await verifySuperAdmin();

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      activeUsers,
      postsCreated,
      trainingCompletions,
      loginFrequency,
    ] = await Promise.all([
      // Active users (logged in within period)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: startDate,
          },
        },
      }),
      // Posts created
      prisma.post.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),
      // Training completions
      prisma.trainingProgress.count({
        where: {
          completedAt: {
            gte: startDate,
          },
        },
      }),
      // Login frequency (total logins)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: startDate,
          },
        },
      }),
    ]);

    return {
      activeUsers,
      postsCreated,
      trainingCompletions,
      loginFrequency,
    };
  } catch (error) {
    console.error("Error fetching platform engagement:", error);
    throw new Error("Failed to fetch platform engagement");
  }
}

// Get financial analytics
export async function getFinancialAnalytics(days: number = 30) {
  await verifySuperAdmin();

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

    const [
      currentRevenue,
      previousRevenue,
      revenueByStatus,
      subscriptionDistribution,
      topOrganizations,
    ] = await Promise.all([
      // Current period revenue
      prisma.invoice.aggregate({
        where: {
          status: "paid",
          paidAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
      // Previous period revenue
      prisma.invoice.aggregate({
        where: {
          status: "paid",
          paidAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
        _sum: { amount: true },
        _count: true,
      }),
      // Revenue by status
      prisma.invoice.groupBy({
        by: ["status"],
        where: { createdAt: { gte: startDate } },
        _sum: { amount: true },
        _count: true,
      }),
      // Subscription distribution
      prisma.player.groupBy({
        by: ["subscriptionTier"],
        _count: true,
      }),
      // Top organizations by revenue
      prisma.invoice.groupBy({
        by: ["organizationId"],
        where: {
          status: "paid",
          paidAt: { gte: startDate },
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 10,
      }),
    ]);

    const revenueGrowth = previousRevenue._sum.amount && previousRevenue._sum.amount > 0
      ? ((currentRevenue._sum.amount || 0) - previousRevenue._sum.amount) / previousRevenue._sum.amount * 100
      : 0;

    return {
      currentRevenue: currentRevenue._sum.amount || 0,
      previousRevenue: previousRevenue._sum.amount || 0,
      revenueGrowth,
      transactionCount: currentRevenue._count,
      revenueByStatus,
      subscriptionDistribution,
      topOrganizations,
    };
  } catch (error) {
    console.error("Error fetching financial analytics:", error);
    throw new Error("Failed to fetch financial analytics");
  }
}

// Get user activity metrics
export async function getUserActivityMetrics(days: number = 30) {
  await verifySuperAdmin();

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalLogins,
      uniqueLogins,
      averageLoginsPerUser,
      mostActiveUsers,
    ] = await Promise.all([
      // Total login count (users who logged in)
      prisma.user.count({
        where: {
          lastLoginAt: { gte: startDate },
        },
      }),
      // Unique users who logged in
      prisma.user.count({
        where: {
          lastLoginAt: { gte: startDate },
        },
        distinct: ["id"],
      }),
      // Average logins (simplified - count of users with logins)
      prisma.user.count({
        where: {
          lastLoginAt: { gte: startDate },
        },
      }),
      // Most active users (by last login)
      prisma.user.findMany({
        where: {
          lastLoginAt: { gte: startDate },
        },
        select: {
          id: true,
          email: true,
          lastLoginAt: true,
          role: true,
        },
        orderBy: { lastLoginAt: "desc" },
        take: 10,
      }),
    ]);

    return {
      totalLogins,
      uniqueLogins,
      averageLoginsPerUser: uniqueLogins > 0 ? totalLogins / uniqueLogins : 0,
      mostActiveUsers,
    };
  } catch (error) {
    console.error("Error fetching user activity metrics:", error);
    throw new Error("Failed to fetch user activity metrics");
  }
}

// Calculate growth rate
export async function getGrowthMetrics(days: number = 30) {
  await verifySuperAdmin();

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

    const [
      currentOrgs,
      previousOrgs,
      currentUsers,
      previousUsers,
      currentPlayers,
      previousPlayers,
    ] = await Promise.all([
      prisma.organization.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.organization.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
      prisma.player.count({
        where: { joinedAt: { gte: startDate } },
      }),
      prisma.player.count({
        where: {
          joinedAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
    ]);

    const orgGrowthRate = previousOrgs > 0
      ? ((currentOrgs - previousOrgs) / previousOrgs) * 100
      : currentOrgs > 0 ? 100 : 0;

    const userGrowthRate = previousUsers > 0
      ? ((currentUsers - previousUsers) / previousUsers) * 100
      : currentUsers > 0 ? 100 : 0;

    const playerGrowthRate = previousPlayers > 0
      ? ((currentPlayers - previousPlayers) / previousPlayers) * 100
      : currentPlayers > 0 ? 100 : 0;

    return {
      organizationGrowthRate: orgGrowthRate,
      userGrowthRate,
      playerGrowthRate,
      currentOrganizations: currentOrgs,
      previousOrganizations: previousOrgs,
      currentUsers,
      previousUsers,
      currentPlayers,
      previousPlayers,
    };
  } catch (error) {
    console.error("Error fetching growth metrics:", error);
    throw new Error("Failed to fetch growth metrics");
  }
}

