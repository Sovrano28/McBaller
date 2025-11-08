import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyMcUnited() {
  console.log("🔍 Verifying McUnited FC data in database...\n");

  try {
    // Check organization
    const org = await prisma.organization.findUnique({
      where: { slug: "mcunited-fc" },
      include: {
        teams: true,
        players: true,
      },
    });

    if (!org) {
      console.log("❌ McUnited FC organization not found!");
      return;
    }

    console.log("✅ Organization Found:");
    console.log(`   Name: ${org.name}`);
    console.log(`   Email: ${org.email}`);
    console.log(`   Teams: ${org.teams.length}`);
    console.log(`   Players: ${org.players.length}`);

    // Check teams
    console.log("\n✅ Teams:");
    for (const team of org.teams) {
      const playerCount = await prisma.player.count({
        where: { teamId: team.id },
      });
      console.log(`   - ${team.name}: ${playerCount} players`);
    }

    // Check contracts
    const contracts = await prisma.contract.count({
      where: { organizationId: org.id },
    });
    console.log(`\n✅ Contracts: ${contracts}`);

    // Check events
    const events = await prisma.event.count({
      where: { organizationId: org.id },
    });
    console.log(`✅ Events: ${events}`);

    // Check venues
    const venues = await prisma.venue.count({
      where: { organizationId: org.id },
    });
    console.log(`✅ Venues: ${venues}`);

    // Check announcements
    const announcements = await prisma.announcement.count({
      where: { organizationId: org.id },
    });
    console.log(`✅ Announcements: ${announcements}`);

    // Check assignments
    const assignments = await prisma.assignment.count({
      where: { organizationId: org.id },
    });
    console.log(`✅ Assignments: ${assignments}`);

    // Check media files
    const mediaFiles = await prisma.mediaFile.count({
      where: { organizationId: org.id },
    });
    console.log(`✅ Media Files: ${mediaFiles}`);

    // Check invoices
    const invoices = await prisma.invoice.count({
      where: { organizationId: org.id },
    });
    console.log(`✅ Invoices: ${invoices}`);

    // Check payments
    const payments = await prisma.payment.findMany({
      include: { invoice: true },
      where: { invoice: { organizationId: org.id } },
    });
    console.log(`✅ Payments: ${payments.length}`);

    // Check waivers
    const waivers = await prisma.waiver.count({
      where: { organizationId: org.id },
    });
    console.log(`✅ Waivers: ${waivers}`);

    // Check waiver signatures
    const signatures = await prisma.waiverSignature.count({
      where: { waiver: { organizationId: org.id } },
    });
    console.log(`✅ Waiver Signatures: ${signatures}`);

    // Check background checks
    const bgChecks = await prisma.backgroundCheck.count({
      where: { organizationId: org.id },
    });
    console.log(`✅ Background Checks: ${bgChecks}`);

    // Check documents
    const documents = await prisma.document.count({
      where: { organizationId: org.id },
    });
    console.log(`✅ Documents: ${documents}`);

    // Check audit logs
    const auditLogs = await prisma.auditLog.count({
      where: { organizationId: org.id },
    });
    console.log(`✅ Audit Logs: ${auditLogs}`);

    // Check season
    const seasons = await prisma.season.count({
      where: { organizationId: org.id },
    });
    console.log(`✅ Seasons: ${seasons}`);

    // Check tournaments
    const tournaments = await prisma.tournament.count({
      where: { organizationId: org.id },
    });
    console.log(`✅ Tournaments: ${tournaments}`);

    // Check availabilities
    const availabilities = await prisma.availability.count({
      where: { event: { organizationId: org.id } },
    });
    console.log(`✅ Availabilities: ${availabilities}`);

    // Check attendances
    const attendances = await prisma.attendance.count({
      where: { event: { organizationId: org.id } },
    });
    console.log(`✅ Attendances: ${attendances}`);

    // Sample player
    const samplePlayer = await prisma.player.findFirst({
      where: { organizationId: org.id },
      include: {
        user: true,
        team: true,
        contracts: true,
        leagueStats: true,
      },
    });

    if (samplePlayer) {
      console.log("\n✅ Sample Player:");
      console.log(`   Name: ${samplePlayer.name}`);
      console.log(`   Email: ${samplePlayer.user.email}`);
      console.log(`   Team: ${samplePlayer.team?.name || "No team"}`);
      console.log(`   Position: ${samplePlayer.position}`);
      console.log(`   Contracts: ${samplePlayer.contracts.length}`);
      console.log(`   Stats: ${samplePlayer.leagueStats.length} seasons`);
    }

    console.log("\n✅ McUnited FC data verification complete!");
    console.log("\n🔑 Login with:");
    console.log("   Admin: admin@mcunitedfc.ng / mcunited123");
    console.log(`   Player: ${samplePlayer?.user.email} / mcunited123`);
  } catch (error) {
    console.error("❌ Error verifying data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMcUnited();

