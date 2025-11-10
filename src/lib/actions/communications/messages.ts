"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit-logger";

export interface MessageInput {
  title: string;
  content: string;
  messageType: "announcement" | "email" | "whatsapp" | "both";
  recipientType: "all" | "selective" | "individual";
  recipientGroups?: string[];
  recipientIds?: string[];
  emailSubject?: string;
  emailBody?: string;
  whatsappMessage?: string;
  whatsappMediaUrl?: string;
  scheduledFor?: Date;
  priority?: string;
  attachments?: string[];
  templateId?: string;
}

/**
 * Get all messages/announcements for the current user's scope
 */
export async function getMessages(filters?: {
  status?: string;
  messageType?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const where: any = {};

    // Scope based on role
    if (session.role === "super_admin") {
      // Super-admins see all messages
      if (filters?.status) {
        where.status = filters.status;
      }
    } else {
      // Org users only see their org's messages
      where.organizationId = session.organizationId;
      if (filters?.status) {
        where.status = filters.status;
      }
    }

    if (filters?.messageType) {
      where.messageType = filters.messageType;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    const messages = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        organization: {
          select: {
            name: true,
            logo: true,
          },
        },
        team: {
          select: {
            name: true,
          },
        },
        template: {
          select: {
            name: true,
          },
        },
      },
      take: 100,
    });

    return { success: true, data: messages };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, error: "Failed to fetch messages" };
  }
}

/**
 * Get a single message by ID
 */
export async function getMessage(id: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const message = await prisma.announcement.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            name: true,
            logo: true,
          },
        },
        team: {
          select: {
            name: true,
          },
        },
        template: {
          select: {
            name: true,
            category: true,
          },
        },
        deliveries: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!message) {
      return { success: false, error: "Message not found" };
    }

    // Check access rights
    if (
      session.role !== "super_admin" &&
      message.organizationId !== session.organizationId
    ) {
      return { success: false, error: "Access denied" };
    }

    return { success: true, data: message };
  } catch (error) {
    console.error("Error fetching message:", error);
    return { success: false, error: "Failed to fetch message" };
  }
}

/**
 * Create a new message/announcement
 */
export async function createMessage(data: MessageInput) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Calculate total recipients (will be updated when actually sending)
    const totalRecipients = data.recipientIds?.length || 0;

    const message = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        messageType: data.messageType,
        recipientType: data.recipientType,
        recipientGroups: data.recipientGroups || [],
        recipientIds: data.recipientIds || [],
        emailSubject: data.emailSubject,
        emailBody: data.emailBody,
        whatsappMessage: data.whatsappMessage,
        whatsappMediaUrl: data.whatsappMediaUrl,
        scheduledFor: data.scheduledFor,
        status: data.scheduledFor ? "scheduled" : "draft",
        priority: data.priority || "normal",
        attachments: data.attachments || [],
        templateId: data.templateId,
        totalRecipients,
        sendEmail: data.messageType === "email" || data.messageType === "both",
        sendWhatsApp: data.messageType === "whatsapp" || data.messageType === "both",
        organizationId:
          session.role === "super_admin" ? null : session.organizationId,
        createdById: session.id,
      },
    });

    // Log audit
    await logAction({
      organizationId: session.role === "super_admin" ? null : session.organizationId,
      action: "create",
      entityType: "message",
      entityId: message.id,
      metadata: {
        title: message.title,
        messageType: message.messageType,
        recipientType: message.recipientType,
        status: message.status,
      },
    });

    revalidatePath("/super-admin/communications");
    revalidatePath("/org/communications");

    return { success: true, data: message };
  } catch (error) {
    console.error("Error creating message:", error);
    return { success: false, error: "Failed to create message" };
  }
}

/**
 * Update an existing message
 */
export async function updateMessage(id: string, data: Partial<MessageInput>) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if message exists and user has access
    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Message not found" };
    }

    // Check access rights
    if (
      session.role !== "super_admin" &&
      existing.organizationId !== session.organizationId
    ) {
      return { success: false, error: "Access denied" };
    }

    // Can't edit sent messages
    if (existing.status === "sent") {
      return { success: false, error: "Cannot edit sent messages" };
    }

    const message = await prisma.announcement.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.messageType && { messageType: data.messageType }),
        ...(data.recipientType && { recipientType: data.recipientType }),
        ...(data.recipientGroups && { recipientGroups: data.recipientGroups }),
        ...(data.recipientIds && { recipientIds: data.recipientIds }),
        ...(data.emailSubject !== undefined && { emailSubject: data.emailSubject }),
        ...(data.emailBody !== undefined && { emailBody: data.emailBody }),
        ...(data.whatsappMessage !== undefined && { whatsappMessage: data.whatsappMessage }),
        ...(data.whatsappMediaUrl !== undefined && { whatsappMediaUrl: data.whatsappMediaUrl }),
        ...(data.scheduledFor !== undefined && { scheduledFor: data.scheduledFor }),
        ...(data.priority && { priority: data.priority }),
        ...(data.attachments && { attachments: data.attachments }),
      },
    });

    // Log audit
    await logAction({
      organizationId: session.role === "super_admin" ? null : session.organizationId,
      action: "update",
      entityType: "message",
      entityId: message.id,
      metadata: {
        updates: Object.keys(data),
      },
    });

    revalidatePath("/super-admin/communications");
    revalidatePath("/org/communications");

    return { success: true, data: message };
  } catch (error) {
    console.error("Error updating message:", error);
    return { success: false, error: "Failed to update message" };
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(id: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if message exists and user has access
    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Message not found" };
    }

    // Check access rights
    if (
      session.role !== "super_admin" &&
      existing.organizationId !== session.organizationId
    ) {
      return { success: false, error: "Access denied" };
    }

    // Can only delete drafts
    if (existing.status !== "draft") {
      return { success: false, error: "Can only delete draft messages" };
    }

    await prisma.announcement.delete({
      where: { id },
    });

    // Log audit
    await logAction({
      organizationId: session.role === "super_admin" ? null : session.organizationId,
      action: "delete",
      entityType: "message",
      entityId: id,
      metadata: {
        title: existing.title,
      },
    });

    revalidatePath("/super-admin/communications");
    revalidatePath("/org/communications");

    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    return { success: false, error: "Failed to delete message" };
  }
}

/**
 * Send a message immediately
 */
export async function sendMessage(id: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if message exists and user has access
    const message = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!message) {
      return { success: false, error: "Message not found" };
    }

    // Check access rights
    if (
      session.role !== "super_admin" &&
      message.organizationId !== session.organizationId
    ) {
      return { success: false, error: "Access denied" };
    }

    // Can only send draft or scheduled messages
    if (!["draft", "scheduled"].includes(message.status)) {
      return { success: false, error: "Message cannot be sent" };
    }

    // Update status to sending (actual sending will be handled by background job)
    await prisma.announcement.update({
      where: { id },
      data: {
        status: "sending",
        sentAt: new Date(),
      },
    });

    // TODO: Trigger background job to actually send emails/whatsapp messages
    // For now, we'll just mark it as sent
    setTimeout(async () => {
      await prisma.announcement.update({
        where: { id },
        data: { status: "sent" },
      });
    }, 1000);

    // Log audit
    await logAction({
      organizationId: session.role === "super_admin" ? null : session.organizationId,
      action: "update",
      entityType: "message",
      entityId: id,
      metadata: {
        title: message.title,
        messageType: message.messageType,
        recipientType: message.recipientType,
        action: "send",
      },
    });

    revalidatePath("/super-admin/communications");
    revalidatePath("/org/communications");

    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

/**
 * Get message statistics
 */
export async function getMessageStats(id: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const message = await prisma.announcement.findUnique({
      where: { id },
      include: {
        deliveries: {
          select: {
            status: true,
            deliveryType: true,
          },
        },
      },
    });

    if (!message) {
      return { success: false, error: "Message not found" };
    }

    // Check access rights
    if (
      session.role !== "super_admin" &&
      message.organizationId !== session.organizationId
    ) {
      return { success: false, error: "Access denied" };
    }

    // Calculate stats
    const emailDeliveries = message.deliveries.filter((d) => d.deliveryType === "email");
    const whatsappDeliveries = message.deliveries.filter((d) => d.deliveryType === "whatsapp");

    const stats = {
      total: message.totalRecipients,
      emailSent: emailDeliveries.filter((d) => d.status === "sent").length,
      emailDelivered: emailDeliveries.filter((d) => d.status === "delivered").length,
      emailFailed: emailDeliveries.filter((d) => d.status === "failed").length,
      whatsappSent: whatsappDeliveries.filter((d) => d.status === "sent").length,
      whatsappDelivered: whatsappDeliveries.filter((d) => d.status === "delivered").length,
      whatsappFailed: whatsappDeliveries.filter((d) => d.status === "failed").length,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching message stats:", error);
    return { success: false, error: "Failed to fetch message stats" };
  }
}

