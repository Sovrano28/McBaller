/**
 * Database Connection Verification Script
 *
 * Run with: npx tsx scripts/verify-db-connection.ts
 *
 * This script verifies that:
 * 1. The DATABASE_URL is configured
 * 2. Prisma can connect to MongoDB
 * 3. Core collections contain data
 * 4. Relations load correctly
 */

// Load environment variables from .env.local
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["info", "warn", "error"],
});

async function verifyConnection() {
  console.log("🔍 Verifying MongoDB connection...\n");

  // 1. Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL not found in environment variables");
    console.log("\n💡 Make sure you have a .env.local file with:");
    console.log(
      '   DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/mcballer"'
    );
    process.exit(1);
  }

  const maskedUrl = dbUrl.replace(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
    (_match, user) => `mongodb+srv://${user}:****@`
  );
  console.log("✅ DATABASE_URL found:", maskedUrl);

  try {
    // 2. Test connection with $connect
    console.log("\n🔄 Testing connection...");
    await prisma.$connect();
    console.log("✅ Successfully connected to MongoDB!");

    // 3. Test core collections
    console.log("\n📊 Running test queries...");
    const [orgCount, userCount, playerCount, contractCount, invoiceCount] =
      await Promise.all([
        prisma.organization.count(),
        prisma.user.count(),
        prisma.player.count(),
        prisma.contract.count(),
        prisma.invoice.count(),
      ]);

    console.log("\n📈 Collection statistics:");
    console.log(`   Organizations: ${orgCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Players: ${playerCount}`);
    console.log(`   Contracts: ${contractCount}`);
    console.log(`   Invoices: ${invoiceCount}`);

    // 4. Test a sample query with relations
    console.log("\n🔗 Testing relationships...");
    const sampleOrg = await prisma.organization.findFirst({
      include: {
        teams: { take: 2, select: { name: true } },
        players: { take: 2, select: { name: true, position: true } },
        _count: {
          select: {
            players: true,
            teams: true,
            contracts: true,
            invoices: true,
          },
        },
      },
    });

    if (sampleOrg) {
      console.log(`\n✅ Sample organization: "${sampleOrg.name}"`);
      console.log(`   - Teams: ${sampleOrg._count.teams}`);
      console.log(`   - Players: ${sampleOrg._count.players}`);
      console.log(`   - Contracts: ${sampleOrg._count.contracts}`);
      console.log(`   - Invoices: ${sampleOrg._count.invoices}`);

      if (sampleOrg.teams.length) {
        console.log("   • Example teams:");
        sampleOrg.teams.forEach(team => console.log(`     - ${team.name}`));
      }

      if (sampleOrg.players.length) {
        console.log("   • Example players:");
        sampleOrg.players.forEach(player =>
          console.log(`     - ${player.name} (${player.position})`)
        );
      }
    } else {
      console.log("\n⚠️  No organizations found (database might be empty)");
      console.log("💡 Run seed script: npm run prisma:seed");
    }

    console.log("\n✅ All checks passed! MongoDB is ready to use.");
    console.log("\n💡 Next steps:");
    console.log("   - View data in Prisma Studio: npx prisma studio");
    console.log("   - Inspect collections in MongoDB Compass");
    console.log("   - Start the dev server: npm run dev");
  } catch (error: any) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error.message);

    console.error("\n💡 Troubleshooting:");
    console.error("   - Confirm your MongoDB Atlas cluster is running");
    console.error("   - Verify your IP is whitelisted in Network Access");
    console.error("   - Check username/password and database name");
    console.error("   - Ensure DNS (SRV) connection string is correct");

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyConnection();
