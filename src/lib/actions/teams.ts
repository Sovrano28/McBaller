"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import type { OrgAuthData } from "@/lib/auth-types";

export async function getOrganizationDivisions(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  return await prisma.division.findMany({
    where: { organizationId },
    orderBy: [{ level: "asc" }, { name: "asc" }],
  });
}

export async function getOrganizationAgeGroups(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  return await prisma.ageGroup.findMany({
    where: { organizationId },
    orderBy: [{ minAge: "asc" }, { name: "asc" }],
  });
}

export async function getOrganizationSeasons(organizationId: string) {
  const session = await getSession();
  if (!session || session.role === "player") {
    throw new Error("Unauthorized");
  }

  const orgSession = session as OrgAuthData;
  if (orgSession.organizationId !== organizationId) {
    throw new Error("Forbidden");
  }

  return await prisma.season.findMany({
    where: { organizationId },
    orderBy: { startDate: "desc" },
  });
}

export interface CreateTeamData {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  divisionId?: string;
  ageGroupId?: string;
  seasonId?: string;
}

export interface UpdateTeamData extends Partial<CreateTeamData> {}

export async function createTeam(
  organizationId: string,
  data: CreateTeamData
): Promise<{ success: boolean; team?: any; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.role === "player") {
      return { success: false, error: "Unauthorized" };
    }

    const orgSession = session as OrgAuthData;
    if (orgSession.organizationId !== organizationId) {
      return { success: false, error: "Forbidden" };
    }

    // Generate slug from name if not provided
    let slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-");
    slug = slug.replace(/[^a-z0-9-]/g, "");

    // Ensure slug is unique within organization
    const existingTeam = await prisma.team.findFirst({
      where: {
        organizationId,
        slug,
      },
    });

    if (existingTeam) {
      // Append number if slug exists
      let counter = 1;
      let uniqueSlug = `${slug}-${counter}`;
      while (
        await prisma.team.findFirst({
          where: { organizationId, slug: uniqueSlug },
        })
      ) {
        counter++;
        uniqueSlug = `${slug}-${counter}`;
      }
      slug = uniqueSlug;
    }

    // Validate division, age group, and season belong to organization if provided
    if (data.divisionId) {
      const division = await prisma.division.findFirst({
        where: {
          id: data.divisionId,
          organizationId,
        },
      });
      if (!division) {
        return { success: false, error: "Invalid division" };
      }
    }

    if (data.ageGroupId) {
      const ageGroup = await prisma.ageGroup.findFirst({
        where: {
          id: data.ageGroupId,
          organizationId,
        },
      });
      if (!ageGroup) {
        return { success: false, error: "Invalid age group" };
      }
    }

    if (data.seasonId) {
      const season = await prisma.season.findFirst({
        where: {
          id: data.seasonId,
          organizationId,
        },
      });
      if (!season) {
        return { success: false, error: "Invalid season" };
      }
    }

    const team = await prisma.team.create({
      data: {
        organizationId,
        name: data.name,
        slug,
        description: data.description,
        logo: data.logo,
        divisionId: data.divisionId,
        ageGroupId: data.ageGroupId,
        seasonId: data.seasonId,
      },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
        division: {
          select: {
            id: true,
            name: true,
          },
        },
        ageGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        season: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            players: true,
            contracts: true,
          },
        },
      },
    });

    return { success: true, team };
  } catch (error: any) {
    console.error("Create team error:", error);
    return {
      success: false,
      error: error.message || "Failed to create team",
    };
  }
}

export async function updateTeam(
  organizationId: string,
  teamId: string,
  data: UpdateTeamData
): Promise<{ success: boolean; team?: any; error?: string }> {
  try {
    const session = await getSession();
    if (!session || session.role === "player") {
      return { success: false, error: "Unauthorized" };
    }

    const orgSession = session as OrgAuthData;
    if (orgSession.organizationId !== organizationId) {
      return { success: false, error: "Forbidden" };
    }

    // Verify team belongs to organization
    const existingTeam = await prisma.team.findFirst({
      where: {
        id: teamId,
        organizationId,
      },
    });

    if (!existingTeam) {
      return { success: false, error: "Team not found" };
    }

    // Handle slug uniqueness if slug is being updated
    let slug = data.slug;
    if (slug && slug !== existingTeam.slug) {
      const slugExists = await prisma.team.findFirst({
        where: {
          organizationId,
          slug,
          id: { not: teamId },
        },
      });

      if (slugExists) {
        return { success: false, error: "Slug already exists" };
      }
    }

    // Validate related entities if provided
    if (data.divisionId) {
      const division = await prisma.division.findFirst({
        where: {
          id: data.divisionId,
          organizationId,
        },
      });
      if (!division) {
        return { success: false, error: "Invalid division" };
      }
    }

    if (data.ageGroupId) {
      const ageGroup = await prisma.ageGroup.findFirst({
        where: {
          id: data.ageGroupId,
          organizationId,
        },
      });
      if (!ageGroup) {
        return { success: false, error: "Invalid age group" };
      }
    }

    if (data.seasonId) {
      const season = await prisma.season.findFirst({
        where: {
          id: data.seasonId,
          organizationId,
        },
      });
      if (!season) {
        return { success: false, error: "Invalid season" };
      }
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        name: data.name,
        slug: slug || undefined,
        description: data.description,
        logo: data.logo,
        divisionId: data.divisionId,
        ageGroupId: data.ageGroupId,
        seasonId: data.seasonId,
      },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            players: true,
            contracts: true,
          },
        },
      },
    });

    return { success: true, team };
  } catch (error: any) {
    console.error("Update team error:", error);
    return {
      success: false,
      error: error.message || "Failed to update team",
    };
  }
}

export async function deleteTeam(
  organizationId: string,
  teamId: string
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

    // Verify team belongs to organization
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        organizationId,
      },
    });

    if (!team) {
      return { success: false, error: "Team not found" };
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete team error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete team",
    };
  }
}

