"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface PaymentFilters {
  status?: "pending" | "succeeded" | "failed" | "refunded";
  method?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getOrganizationPayments(
  organizationId: string,
  filters?: PaymentFilters
) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  // Get payments through invoices
  const where: any = {
    invoice: {
      organizationId,
    },
  };

  if (filters?.status) {
    where.status =
      filters.status === "succeeded" ? "succeeded" : filters.status;
  }

  if (filters?.method) {
    where.method = filters.method;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          amount: true,
          currency: true,
          player: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
      transactions: {
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
}

export async function getPayment(organizationId: string, paymentId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      invoice: {
        organizationId,
      },
    },
    include: {
      invoice: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
        },
      },
      transactions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return payment;
}

export async function getPaymentStats(
  organizationId: string,
  period?: "day" | "week" | "month" | "year"
): Promise<{
  total: number;
  succeeded: number;
  pending: number;
  failed: number;
  byMethod: Record<string, number>;
}> {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  // Calculate date range based on period
  let startDate: Date | undefined;
  if (period) {
    const now = new Date();
    startDate = new Date();

    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
  }

  const where: any = {
    invoice: {
      organizationId,
    },
  };

  if (startDate) {
    where.createdAt = {
      gte: startDate,
    };
  }

  const [total, succeeded, pending, failed, allPayments] = await Promise.all([
    prisma.payment.aggregate({
      where,
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        ...where,
        status: "succeeded",
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        ...where,
        status: "pending",
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        ...where,
        status: "failed",
      },
      _sum: { amount: true },
    }),
    prisma.payment.findMany({
      where,
      select: {
        method: true,
        amount: true,
        status: true,
      },
    }),
  ]);

  // Calculate by method
  const byMethod: Record<string, number> = {};
  allPayments.forEach(payment => {
    if (payment.status === "succeeded") {
      byMethod[payment.method] =
        (byMethod[payment.method] || 0) + Number(payment.amount);
    }
  });

  return {
    total: Number(total._sum.amount || 0),
    succeeded: Number(succeeded._sum.amount || 0),
    pending: Number(pending._sum.amount || 0),
    failed: Number(failed._sum.amount || 0),
    byMethod,
  };
}
