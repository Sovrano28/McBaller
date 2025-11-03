"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export interface ContractFilters {
  status?: "active" | "expired" | "terminated";
  teamId?: string;
  playerId?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getOrganizationContracts(
  organizationId: string,
  filters?: ContractFilters
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

  if (filters?.teamId) {
    where.teamId = filters.teamId;
  }

  if (filters?.playerId) {
    where.playerId = filters.playerId;
  }

  if (filters?.startDate || filters?.endDate) {
    where.startDate = {};
    if (filters.startDate) {
      where.startDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.startDate.lte = filters.endDate;
    }
  }

  const contracts = await prisma.contract.findMany({
    where,
    include: {
      player: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          position: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      organization: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return contracts;
}

export async function getContract(organizationId: string, contractId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const contract = await prisma.contract.findFirst({
    where: {
      id: contractId,
      organizationId,
    },
    include: {
      player: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      team: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          phone: true,
          address: true,
        },
      },
    },
  });

  return contract;
}

export interface CreateContractData {
  playerId: string;
  teamId?: string;
  startDate: Date;
  endDate?: Date;
  salary?: number;
  terms?: object;
}

export async function createContract(
  organizationId: string,
  data: CreateContractData
): Promise<{ success: boolean; contract?: any; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.role === "player") {
      return { success: false, error: "Unauthorized" };
    }

    const orgSession = session as OrgAuthData;
    if (orgSession.organizationId !== organizationId) {
      return { success: false, error: "Forbidden" };
    }

    // Verify player belongs to organization
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

    // Verify team belongs to organization if provided
    if (data.teamId) {
      const team = await prisma.team.findFirst({
        where: {
          id: data.teamId,
          organizationId,
        },
      });

      if (!team) {
        return {
          success: false,
          error: "Team not found or doesn't belong to organization",
        };
      }
    }

    // Validate dates
    if (data.endDate && data.endDate <= data.startDate) {
      return { success: false, error: "End date must be after start date" };
    }

    // Validate salary
    if (data.salary !== undefined && data.salary <= 0) {
      return { success: false, error: "Salary must be positive" };
    }

    // Check for active contracts (optional: allow override)
    const existingActiveContract = await prisma.contract.findFirst({
      where: {
        playerId: data.playerId,
        status: "active",
        organizationId,
      },
    });

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        playerId: data.playerId,
        organizationId,
        teamId: data.teamId,
        startDate: data.startDate,
        endDate: data.endDate,
        salary: data.salary ? data.salary : null,
        terms: data.terms || null,
        status: "active",
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update player's teamId if contract has team
    if (data.teamId) {
      await prisma.player.update({
        where: { id: data.playerId },
        data: { teamId: data.teamId },
      });
    }

    return { success: true, contract };
  } catch (error: any) {
    console.error("Create contract error:", error);
    return {
      success: false,
      error: error.message || "Failed to create contract",
    };
  }
}

export interface UpdateContractData {
  teamId?: string;
  startDate?: Date;
  endDate?: Date;
  salary?: number;
  terms?: object;
  status?: "active" | "expired" | "terminated";
}

export async function updateContract(
  organizationId: string,
  contractId: string,
  data: UpdateContractData
): Promise<{ success: boolean; contract?: any; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.role === "player") {
      return { success: false, error: "Unauthorized" };
    }

    const orgSession = session as OrgAuthData;
    if (orgSession.organizationId !== organizationId) {
      return { success: false, error: "Forbidden" };
    }

    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        organizationId,
      },
    });

    if (!contract) {
      return { success: false, error: "Contract not found" };
    }

    // Validate dates if provided
    if (data.endDate && data.startDate && data.endDate <= data.startDate) {
      return { success: false, error: "End date must be after start date" };
    }

    if (
      data.endDate &&
      !data.startDate &&
      contract.startDate &&
      data.endDate <= contract.startDate
    ) {
      return { success: false, error: "End date must be after start date" };
    }

    // Validate salary
    if (data.salary !== undefined && data.salary <= 0) {
      return { success: false, error: "Salary must be positive" };
    }

    const updated = await prisma.contract.update({
      where: { id: contractId },
      data: {
        teamId: data.teamId,
        startDate: data.startDate,
        endDate: data.endDate,
        salary: data.salary !== undefined ? data.salary : undefined,
        terms: data.terms !== undefined ? data.terms : undefined,
        status: data.status,
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, contract: updated };
  } catch (error: any) {
    console.error("Update contract error:", error);
    return {
      success: false,
      error: error.message || "Failed to update contract",
    };
  }
}

export async function renewContract(
  organizationId: string,
  contractId: string,
  newEndDate: Date,
  updatedSalary?: number
): Promise<{ success: boolean; contract?: any; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.role === "player") {
      return { success: false, error: "Unauthorized" };
    }

    const orgSession = session as OrgAuthData;
    if (orgSession.organizationId !== organizationId) {
      return { success: false, error: "Forbidden" };
    }

    const oldContract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        organizationId,
      },
    });

    if (!oldContract) {
      return { success: false, error: "Contract not found" };
    }

    if (newEndDate <= (oldContract.endDate || new Date())) {
      return {
        success: false,
        error: "New end date must be after current end date",
      };
    }

    // Mark old contract as expired
    await prisma.contract.update({
      where: { id: contractId },
      data: { status: "expired" },
    });

    // Create new contract
    const newContract = await prisma.contract.create({
      data: {
        playerId: oldContract.playerId,
        organizationId: oldContract.organizationId,
        teamId: oldContract.teamId,
        startDate: oldContract.endDate || new Date(),
        endDate: newEndDate,
        salary:
          updatedSalary !== undefined ? updatedSalary : oldContract.salary,
        terms: {
          ...((oldContract.terms as object) || {}),
          renewedFrom: contractId,
          renewalDate: new Date().toISOString(),
        },
        status: "active",
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, contract: newContract };
  } catch (error: any) {
    console.error("Renew contract error:", error);
    return {
      success: false,
      error: error.message || "Failed to renew contract",
    };
  }
}

export async function terminateContract(
  organizationId: string,
  contractId: string,
  terminationDate: Date,
  reason: string,
  notes?: string
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

    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        organizationId,
      },
    });

    if (!contract) {
      return { success: false, error: "Contract not found" };
    }

    // Update contract
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: "terminated",
        endDate: terminationDate,
        terms: {
          ...((contract.terms as object) || {}),
          termination: {
            date: terminationDate.toISOString(),
            reason,
            notes: notes || null,
          },
        },
      },
    });

    // If contract was team-specific, remove player from team
    if (contract.teamId) {
      await prisma.player.update({
        where: { id: contract.playerId },
        data: { teamId: null },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Terminate contract error:", error);
    return {
      success: false,
      error: error.message || "Failed to terminate contract",
    };
  }
}

export async function getExpiringContracts(
  organizationId: string,
  daysAhead: number = 30
): Promise<any[]> {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

  const contracts = await prisma.contract.findMany({
    where: {
      organizationId,
      status: "active",
      endDate: {
        lte: cutoffDate,
        gte: new Date(),
      },
    },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
      team: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      endDate: "asc",
    },
  });

  return contracts;
}
