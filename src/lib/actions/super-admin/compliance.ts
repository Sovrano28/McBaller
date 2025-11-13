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

// Get compliance statistics
export async function getComplianceStats() {
  await verifySuperAdmin();

  try {
    const [
      pendingBackgroundChecks,
      approvedBackgroundChecks,
      rejectedBackgroundChecks,
      expiredDocuments,
      expiringDocuments,
      signedWaivers,
      pendingWaivers,
    ] = await Promise.all([
      // Background checks - pending
      prisma.backgroundCheck.count({
        where: { status: "pending" },
      }),
      // Background checks - approved
      prisma.backgroundCheck.count({
        where: { status: "approved" },
      }),
      // Background checks - rejected
      prisma.backgroundCheck.count({
        where: { status: "rejected" },
      }),
      // Expired documents
      prisma.document.count({
        where: {
          expiresAt: {
            lt: new Date(),
            not: null,
          },
        },
      }),
      // Documents expiring in next 30 days
      prisma.document.count({
        where: {
          expiresAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Signed waivers (has signedAt)
      prisma.waiverSignature.count({
        where: { signedAt: { not: null } },
      }),
      // Pending waivers (no signedAt)
      prisma.waiverSignature.count({
        where: { signedAt: null },
      }),
    ]);

    return {
      backgroundChecks: {
        pending: pendingBackgroundChecks,
        approved: approvedBackgroundChecks,
        rejected: rejectedBackgroundChecks,
        total: pendingBackgroundChecks + approvedBackgroundChecks + rejectedBackgroundChecks,
      },
      documents: {
        expired: expiredDocuments,
        expiring: expiringDocuments,
        total: await prisma.document.count(),
      },
      waivers: {
        signed: signedWaivers,
        pending: pendingWaivers,
        total: signedWaivers + pendingWaivers,
      },
    };
  } catch (error) {
    console.error("Error fetching compliance stats:", error);
    throw new Error("Failed to fetch compliance statistics");
  }
}

// Get expired documents
export async function getExpiredDocuments(limit: number = 50) {
  await verifySuperAdmin();

  try {
    const documents = await prisma.document.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        category: true,
        expiresAt: true,
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
      },
      orderBy: { expiresAt: "asc" },
      take: limit,
    });

    return documents;
  } catch (error) {
    console.error("Error fetching expired documents:", error);
    throw new Error("Failed to fetch expired documents");
  }
}

// Get waiver statistics
export async function getWaiverStats() {
  await verifySuperAdmin();

  try {
    const [
      signedWaivers,
      pendingWaivers,
      waiverBreakdown,
    ] = await Promise.all([
      prisma.waiverSignature.count({
        where: { signedAt: { not: null } },
      }),
      prisma.waiverSignature.count({
        where: { signedAt: null },
      }),
      prisma.waiverSignature.groupBy({
        by: ["waiverId"],
        _count: {
          id: true,
        },
        where: { signedAt: { not: null } },
      }),
    ]);

    return {
      signed: signedWaivers,
      pending: pendingWaivers,
      total: signedWaivers + pendingWaivers,
      breakdown: waiverBreakdown,
    };
  } catch (error) {
    console.error("Error fetching waiver stats:", error);
    throw new Error("Failed to fetch waiver statistics");
  }
}

// Get compliance status by organization
export async function getComplianceByOrganization() {
  await verifySuperAdmin();

  try {
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        _count: {
          select: {
            users: true,
            players: true,
            documents: true,
            backgroundChecks: true,
            waivers: true,
          },
        },
      },
    });

    const complianceData = await Promise.all(
      organizations.map(async (org) => {
        const [
          expiredDocs,
          pendingBackgroundChecks,
          signedWaivers,
        ] = await Promise.all([
          prisma.document.count({
            where: {
              organizationId: org.id,
              expiresAt: {
                lt: new Date(),
                not: null,
              },
            },
          }),
          prisma.backgroundCheck.count({
            where: {
              userId: {
                in: await prisma.user
                  .findMany({
                    where: { organizationId: org.id },
                    select: { id: true },
                  })
                  .then((users) => users.map((u) => u.id)),
              },
              status: "pending",
            },
          }),
          prisma.waiverSignature.count({
            where: {
              waiver: {
                organizationId: org.id,
              },
              signedAt: { not: null },
            },
          }),
        ]);

        return {
          organizationId: org.id,
          organizationName: org.name,
          organizationType: org.type,
          totalUsers: org._count.users,
          totalPlayers: org._count.players,
          expiredDocuments: expiredDocs,
          pendingBackgroundChecks,
          signedWaivers,
          complianceScore: calculateComplianceScore({
            expiredDocs,
            pendingBackgroundChecks,
            totalUsers: org._count.users,
            signedWaivers,
          }),
        };
      })
    );

    return complianceData.sort((a, b) => b.complianceScore - a.complianceScore);
  } catch (error) {
    console.error("Error fetching compliance by organization:", error);
    throw new Error("Failed to fetch compliance by organization");
  }
}

// Helper function to calculate compliance score (0-100)
function calculateComplianceScore({
  expiredDocs,
  pendingBackgroundChecks,
  totalUsers,
  signedWaivers,
}: {
  expiredDocs: number;
  pendingBackgroundChecks: number;
  totalUsers: number;
  signedWaivers: number;
}): number {
  let score = 100;

  // Deduct points for expired documents (5 points each, max 30)
  score -= Math.min(expiredDocs * 5, 30);

  // Deduct points for pending background checks (3 points each, max 20)
  score -= Math.min(pendingBackgroundChecks * 3, 20);

  // Deduct points if users don't have signed waivers (10 points if no waivers)
  if (totalUsers > 0 && signedWaivers === 0) {
    score -= 10;
  }

  return Math.max(0, score);
}

// Get recent compliance issues
export async function getRecentComplianceIssues(limit: number = 20) {
  await verifySuperAdmin();

  try {
    const [expiredDocs, pendingChecks] = await Promise.all([
      prisma.document.findMany({
        where: {
          expiresAt: {
            lt: new Date(),
            not: null,
          },
        },
        select: {
          id: true,
          title: true,
          category: true,
          expiresAt: true,
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
        orderBy: { expiresAt: "desc" },
        take: limit,
      }),
      prisma.backgroundCheck.findMany({
        where: {
          status: "pending",
        },
        include: {
          user: {
            select: {
              email: true,
              organization: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    return {
      expiredDocuments: expiredDocs,
      pendingBackgroundChecks: pendingChecks,
    };
  } catch (error) {
    console.error("Error fetching recent compliance issues:", error);
    throw new Error("Failed to fetch recent compliance issues");
  }
}

