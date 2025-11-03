"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface InvoiceFilters {
  status?: "draft" | "sent" | "paid" | "overdue" | "void";
  playerId?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getOrganizationInvoices(
  organizationId: string,
  filters?: InvoiceFilters
) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const where: any = {
    organizationId,
  };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.playerId) {
    where.playerId = filters.playerId;
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

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      player: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
      payments: {
        select: {
          id: true,
          amount: true,
          status: true,
          method: true,
          paidAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return invoices;
}

export async function getInvoice(organizationId: string, invoiceId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      organizationId,
    },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          email: true,
          phone: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
      payments: {
        include: {
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
      },
    },
  });

  return invoice;
}

export async function generateInvoiceNumber(
  organizationId: string
): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  // Get count of invoices created today for this org
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await prisma.invoice.count({
    where: {
      organizationId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const sequence = String(count + 1).padStart(4, "0");
  return `INV-${dateStr}-${sequence}`;
}

export interface CreateInvoiceData {
  invoiceNumber: string;
  playerId?: string;
  amount: number;
  currency?: string;
  dueDate: Date;
  description?: string;
}

export async function createInvoice(
  organizationId: string,
  data: CreateInvoiceData
): Promise<{ success: boolean; invoice?: any; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.role === "player") {
      return { success: false, error: "Unauthorized" };
    }

    const orgSession = session as OrgAuthData;
    if (orgSession.organizationId !== organizationId) {
      return { success: false, error: "Forbidden" };
    }

    // Verify invoice number is unique
    const existing = await prisma.invoice.findUnique({
      where: { invoiceNumber: data.invoiceNumber },
    });

    if (existing) {
      return { success: false, error: "Invoice number already exists" };
    }

    // Verify player belongs to organization if provided
    if (data.playerId) {
      const player = await prisma.player.findFirst({
        where: {
          id: data.playerId,
          organizationId,
        },
      });

      if (!player) {
        return {
          success: false,
          error: "Player not found or doesn't belong to organization",
        };
      }
    }

    // Validate amount
    if (data.amount <= 0) {
      return { success: false, error: "Amount must be positive" };
    }

    const invoice = await prisma.invoice.create({
      data: {
        organizationId,
        playerId: data.playerId || null,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        currency: data.currency || "NGN",
        dueDate: data.dueDate,
        status: "draft",
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return { success: true, invoice };
  } catch (error: any) {
    console.error("Create invoice error:", error);
    return {
      success: false,
      error: error.message || "Failed to create invoice",
    };
  }
}

export interface UpdateInvoiceData {
  playerId?: string;
  amount?: number;
  dueDate?: Date;
  description?: string;
}

export async function updateInvoice(
  organizationId: string,
  invoiceId: string,
  data: UpdateInvoiceData
): Promise<{ success: boolean; invoice?: any; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.role === "player") {
      return { success: false, error: "Unauthorized" };
    }

    const orgSession = session as OrgAuthData;
    if (orgSession.organizationId !== organizationId) {
      return { success: false, error: "Forbidden" };
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    // Can only update draft invoices
    if (invoice.status !== "draft") {
      return { success: false, error: "Can only update draft invoices" };
    }

    // Validate amount
    if (data.amount !== undefined && data.amount <= 0) {
      return { success: false, error: "Amount must be positive" };
    }

    // Verify player if provided
    if (data.playerId) {
      const player = await prisma.player.findFirst({
        where: {
          id: data.playerId,
          organizationId,
        },
      });

      if (!player) {
        return {
          success: false,
          error: "Player not found or doesn't belong to organization",
        };
      }
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        playerId: data.playerId !== undefined ? data.playerId : undefined,
        amount: data.amount,
        dueDate: data.dueDate,
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return { success: true, invoice: updated };
  } catch (error: any) {
    console.error("Update invoice error:", error);
    return {
      success: false,
      error: error.message || "Failed to update invoice",
    };
  }
}

export async function sendInvoice(
  organizationId: string,
  invoiceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.role === "player") {
      return { success: false, error: "Unauthorized" };
    }

    const orgSession = session as OrgAuthData;
    if (orgSession.organizationId !== organizationId) {
      return { success: false, error: "Forbidden" };
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.status !== "draft") {
      return { success: false, error: "Only draft invoices can be sent" };
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "sent" },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Send invoice error:", error);
    return { success: false, error: error.message || "Failed to send invoice" };
  }
}

export async function markInvoiceAsPaid(
  organizationId: string,
  invoiceId: string,
  paidAt: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.role === "player") {
      return { success: false, error: "Unauthorized" };
    }

    const orgSession = session as OrgAuthData;
    if (orgSession.organizationId !== organizationId) {
      return { success: false, error: "Forbidden" };
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.status === "paid") {
      return { success: false, error: "Invoice is already marked as paid" };
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "paid",
        paidAt,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Mark invoice as paid error:", error);
    return {
      success: false,
      error: error.message || "Failed to mark invoice as paid",
    };
  }
}

export async function voidInvoice(
  organizationId: string,
  invoiceId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.role === "player") {
      return { success: false, error: "Unauthorized" };
    }

    const orgSession = session as OrgAuthData;
    if (orgSession.organizationId !== organizationId) {
      return { success: false, error: "Forbidden" };
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.status === "paid") {
      return { success: false, error: "Cannot void paid invoices" };
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "void" },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Void invoice error:", error);
    return { success: false, error: error.message || "Failed to void invoice" };
  }
}

export async function updateOverdueInvoices(
  organizationId: string
): Promise<number> {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const now = new Date();

  const result = await prisma.invoice.updateMany({
    where: {
      organizationId,
      status: "sent",
      dueDate: {
        lt: now,
      },
    },
    data: {
      status: "overdue",
    },
  });

  return result.count;
}
