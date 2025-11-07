/**
 * Test Prisma Connection to MongoDB
 *
 * Run with: npx tsx scripts/test-prisma-connection.ts
 */

import "dotenv/config";
import { resolve } from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load .env.local explicitly so the script works outside Next.js
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const prismaUrl = process.env.DATABASE_URL;

if (!prismaUrl) {
  console.error("❌ DATABASE_URL not found. Add your MongoDB connection string to .env.local");
  process.exit(1);
}

const prisma = new PrismaClient({
  log: ["error", "warn"],
  datasources: {
    db: {
      url: prismaUrl,
    },
  },
});

async function testConnection() {
  console.log("🧪 Testing Prisma connection to MongoDB...\n");

  const maskedUrl = prismaUrl.replace(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
    (_match, user) => `mongodb+srv://${user}:****@`
  );
  console.log("✅ Using DATABASE_URL:", maskedUrl);
  console.log();

  try {
    console.log("🔄 Connecting to MongoDB...");
    await prisma.$connect();
    console.log("✅ Prisma connected successfully!\n");

    console.log("🔄 Testing queries...");
    const [userCount, orgCount] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
    ]);
    console.log(`✅ Found ${userCount} user(s)`);
    console.log(`✅ Found ${orgCount} organization(s)`);

    const orgs = await prisma.organization.findMany({ take: 3 });
    if (orgs.length) {
      console.log("\n📁 Sample organizations:");
      orgs.forEach(org => {
        console.log(`   - ${org.name} (${org.type})`);
      });
    } else {
      console.log("\n⚠️  No organizations found. Run the seed script if you expect sample data.");
    }

    console.log("\n✅ All tests passed! MongoDB + Prisma are configured correctly.");
  } catch (error: any) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error.message);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Check your DATABASE_URL in .env.local");
    console.error("   2. Ensure your IP address is allowed in MongoDB Atlas");
    console.error("   3. Verify username/password and database name are correct");
    console.error("   4. Confirm the cluster is running");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

