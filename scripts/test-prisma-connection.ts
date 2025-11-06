/**
 * Test Prisma Connection to NeonDB
 * 
 * Run with: npx tsx scripts/test-prisma-connection.ts
 */

import "dotenv/config";
import { resolve } from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load .env.local explicitly
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

// Use DIRECT_URL for Prisma (works better than pooler)
const prismaUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient({
  log: ["error", "warn"],
  datasources: {
    db: {
      url: prismaUrl,
    },
  },
});

async function testConnection() {
  console.log("🧪 Testing Prisma Connection to NeonDB...\n");

  // Prisma should use DIRECT_URL for better compatibility
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL or DIRECT_URL not found");
    process.exit(1);
  }

  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");
  const connectionType = process.env.DIRECT_URL ? "DIRECT_URL (direct)" : "DATABASE_URL (pooler)";
  console.log(`✅ Using ${connectionType}:`, maskedUrl);
  console.log();

  try {
    console.log("🔄 Connecting to database...");
    await prisma.$connect();
    console.log("✅ Prisma connected successfully!\n");

    console.log("🔄 Testing query...");
    const userCount = await prisma.user.count();
    console.log(`✅ Query successful! Found ${userCount} user(s)\n`);

    // Test a more complex query
    const orgs = await prisma.organization.findMany({ take: 3 });
    console.log(`✅ Found ${orgs.length} organization(s) (showing first 3)`);
    orgs.forEach(org => {
      console.log(`   - ${org.name} (${org.type})`);
    });

    console.log("\n✅ All tests passed! Prisma is working with NeonDB.");
  } catch (error: any) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error.message);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Check your DATABASE_URL in .env.local");
    console.error("   2. Ensure connect_timeout=10 is in the connection string");
    console.error("   3. For pooler, add pgbouncer=true parameter");
    console.error("   4. Restart your dev server after changing .env.local");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

