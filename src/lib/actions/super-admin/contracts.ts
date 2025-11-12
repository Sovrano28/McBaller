"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import { logAction } from "@/lib/audit-logger";

export async function getContractById(id: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        player: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
              },
            },
            contracts: {
              orderBy: { startDate: "desc" },
              take: 5,
              include: {
                organization: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                team: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
            email: true,
            phone: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!contract) {
      return { success: false, error: "Contract not found" };
    }

    await logAction({
      organizationId: null,
      action: "view",
      entityType: "contract",
      entityId: id,
    });

    return { success: true, data: contract };
  } catch (error) {
    console.error("Error fetching contract:", error);
    return { success: false, error: "Failed to fetch contract" };
  }
}

