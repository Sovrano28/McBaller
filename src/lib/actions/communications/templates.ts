"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import { revalidatePath } from "next/cache";

export interface MessageTemplateInput {
  name: string;
  description?: string;
  category: string;
  emailSubject?: string;
  emailBody?: string;
  whatsappMessage?: string;
  variables?: string[];
}

/**
 * Get all templates for the current user's scope
 */
export async function getMessageTemplates() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const where: any = { isActive: true };
    
    // Super-admins can see all templates (global + org-specific)
    // Org users only see global templates + their org templates
    if (session.role !== "super_admin") {
      where.OR = [
        { organizationId: null }, // Global templates
        { organizationId: session.organizationId },
      ];
    }

    const templates = await prisma.messageTemplate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        organization: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
    });

    return { success: true, data: templates };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return { success: false, error: "Failed to fetch templates" };
  }
}

/**
 * Get a single template by ID
 */
export async function getMessageTemplate(id: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const template = await prisma.messageTemplate.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    // Check access rights
    if (
      session.role !== "super_admin" &&
      template.organizationId !== null &&
      template.organizationId !== session.organizationId
    ) {
      return { success: false, error: "Access denied" };
    }

    return { success: true, data: template };
  } catch (error) {
    console.error("Error fetching template:", error);
    return { success: false, error: "Failed to fetch template" };
  }
}

/**
 * Create a new message template
 */
export async function createMessageTemplate(data: MessageTemplateInput) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Determine if this is a global or org-specific template
    const organizationId =
      session.role === "super_admin" ? null : session.organizationId;

    const template = await prisma.messageTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        emailSubject: data.emailSubject,
        emailBody: data.emailBody,
        whatsappMessage: data.whatsappMessage,
        variables: data.variables || [],
        organizationId,
      },
    });

    revalidatePath("/super-admin/communications/templates");
    revalidatePath("/org/communications/templates");

    return { success: true, data: template };
  } catch (error) {
    console.error("Error creating template:", error);
    return { success: false, error: "Failed to create template" };
  }
}

/**
 * Update an existing message template
 */
export async function updateMessageTemplate(
  id: string,
  data: Partial<MessageTemplateInput>
) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if template exists and user has access
    const existing = await prisma.messageTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Template not found" };
    }

    // Check access rights
    if (
      session.role !== "super_admin" &&
      existing.organizationId !== session.organizationId
    ) {
      return { success: false, error: "Access denied" };
    }

    const template = await prisma.messageTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.emailSubject !== undefined && { emailSubject: data.emailSubject }),
        ...(data.emailBody !== undefined && { emailBody: data.emailBody }),
        ...(data.whatsappMessage !== undefined && { whatsappMessage: data.whatsappMessage }),
        ...(data.variables && { variables: data.variables }),
      },
    });

    revalidatePath("/super-admin/communications/templates");
    revalidatePath("/org/communications/templates");

    return { success: true, data: template };
  } catch (error) {
    console.error("Error updating template:", error);
    return { success: false, error: "Failed to update template" };
  }
}

/**
 * Delete a message template
 */
export async function deleteMessageTemplate(id: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if template exists and user has access
    const existing = await prisma.messageTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Template not found" };
    }

    // Check access rights
    if (
      session.role !== "super_admin" &&
      existing.organizationId !== session.organizationId
    ) {
      return { success: false, error: "Access denied" };
    }

    // Soft delete by marking inactive
    await prisma.messageTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/super-admin/communications/templates");
    revalidatePath("/org/communications/templates");

    return { success: true };
  } catch (error) {
    console.error("Error deleting template:", error);
    return { success: false, error: "Failed to delete template" };
  }
}

/**
 * Get template categories
 */
export async function getTemplateCategories() {
  return {
    success: true,
    data: [
      { value: "general", label: "General" },
      { value: "event", label: "Event" },
      { value: "payment", label: "Payment" },
      { value: "announcement", label: "Announcement" },
      { value: "welcome", label: "Welcome" },
      { value: "reminder", label: "Reminder" },
      { value: "custom", label: "Custom" },
    ],
  };
}

