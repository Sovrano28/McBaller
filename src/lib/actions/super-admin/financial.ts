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

// Get all invoices with filters
export async function getAllInvoices(filters?: {
  status?: string;
  organizationId?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  await verifySuperAdmin();

  try {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters?.minAmount || filters?.maxAmount) {
      where.amount = {};
      if (filters.minAmount) where.amount.gte = filters.minAmount;
      if (filters.maxAmount) where.amount.lte = filters.maxAmount;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.search) {
      where.invoiceNumber = { contains: filters.search, mode: "insensitive" };
    }

    const orderBy: any = {};
    if (filters?.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        include: {
          organization: {
            select: {
              name: true,
              type: true,
            },
          },
          player: {
            select: {
              name: true,
              username: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              paidAt: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { invoices, total };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw new Error("Failed to fetch invoices");
  }
}

// Get invoice details
export async function getInvoiceDetails(invoiceId: string) {
  await verifySuperAdmin();

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        organization: true,
        player: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        payments: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    return invoice;
  } catch (error) {
    console.error("Error fetching invoice details:", error);
    throw new Error("Failed to fetch invoice details");
  }
}

// Update invoice status
export async function updateInvoiceStatus(
  invoiceId: string,
  status: string,
  paidAt?: Date
) {
  await verifySuperAdmin();

  try {
    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status,
        ...(paidAt && { paidAt }),
        updatedAt: new Date(),
      },
    });

    return { success: true, invoice };
  } catch (error) {
    console.error("Error updating invoice status:", error);
    return { success: false, error: "Failed to update invoice status" };
  }
}

// Get all subscriptions
export async function getAllSubscriptions(filters?: {
  tier?: string;
  expiryStatus?: "active" | "expiring" | "expired";
  organizationId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  await verifySuperAdmin();

  try {
    const where: any = {};

    if (filters?.tier) {
      where.subscriptionTier = filters.tier;
    }

    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters?.expiryStatus) {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (filters.expiryStatus === "active") {
        where.subscriptionExpiry = { gt: sevenDaysFromNow };
      } else if (filters.expiryStatus === "expiring") {
        where.subscriptionExpiry = {
          gt: now,
          lte: sevenDaysFromNow,
        };
      } else if (filters.expiryStatus === "expired") {
        where.subscriptionExpiry = { lte: now };
      }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { username: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        orderBy: { subscriptionExpiry: "asc" },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        select: {
          id: true,
          name: true,
          username: true,
          subscriptionTier: true,
          subscriptionExpiry: true,
          trialUsed: true,
          joinedAt: true,
          user: {
            select: {
              email: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.player.count({ where }),
    ]);

    return { subscriptions: players, total };
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw new Error("Failed to fetch subscriptions");
  }
}

// Get financial analytics
export async function getFinancialAnalytics(days: number = 30) {
  await verifySuperAdmin();

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalRevenue,
      revenueByStatus,
      revenueByOrganization,
      recentTransactions,
      subscriptionRevenue,
    ] = await Promise.all([
      // Total revenue
      prisma.invoice.aggregate({
        where: {
          status: "paid",
          paidAt: { gte: startDate },
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

      // Recent transactions
      prisma.payment.findMany({
        where: {
          status: "succeeded",
          paidAt: { gte: startDate },
        },
        orderBy: { paidAt: "desc" },
        take: 20,
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
              organization: {
                select: { name: true },
              },
            },
          },
        },
      }),

      // Subscription distribution
      prisma.player.groupBy({
        by: ["subscriptionTier"],
        _count: true,
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalTransactions: totalRevenue._count,
      revenueByStatus,
      revenueByOrganization,
      recentTransactions,
      subscriptionRevenue,
    };
  } catch (error) {
    console.error("Error fetching financial analytics:", error);
    throw new Error("Failed to fetch financial analytics");
  }
}

// Process refund
export async function processRefund(
  paymentId: string,
  amount: number,
  reason: string
) {
  await verifySuperAdmin();

  try {
    // Create refund transaction
    const transaction = await prisma.transaction.create({
      data: {
        paymentId,
        type: "refund",
        amount: -amount,
        status: "completed",
        metadata: { reason },
      },
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "refunded" },
    });

    return { success: true, transaction };
  } catch (error) {
    console.error("Error processing refund:", error);
    return { success: false, error: "Failed to process refund" };
  }
}

// Export financial data
export async function exportFinancialData(
  startDate: Date,
  endDate: Date
) {
  await verifySuperAdmin();

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        organization: {
          select: { name: true },
        },
        player: {
          select: { name: true },
        },
        payments: true,
      },
    });

    return invoices;
  } catch (error) {
    console.error("Error exporting financial data:", error);
    throw new Error("Failed to export financial data");
  }
}

