/**
 * Test MongoDB Atlas Connection
 * 
 * Run with: npx tsx scripts/test-mongodb-connection.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

async function testConnection() {
  console.log("🧪 Testing MongoDB Atlas Connection...\n");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL not found in .env.local");
    console.log("\n💡 Make sure you have:");
    console.log('   DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/dbname"');
    process.exit(1);
  }

  // Mask password in URL
  const maskedUrl = dbUrl.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, "mongodb+srv://****:****@");
  console.log("✅ DATABASE_URL found:", maskedUrl);
  console.log();

  try {
    console.log("🔄 Connecting to MongoDB Atlas...");
    await prisma.$connect();
    console.log("✅ Connected successfully!\n");

    console.log("🔄 Testing query...");
    const userCount = await prisma.user.count();
    console.log(`✅ Query successful! Found ${userCount} user(s)\n`);

    // Test a more complex query
    const orgs = await prisma.organization.findMany({ take: 3 });
    console.log(`✅ Found ${orgs.length} organization(s) (showing first 3)`);
    orgs.forEach(org => {
      console.log(`   - ${org.name} (${org.type})`);
    });

    console.log("\n✅ All tests passed! MongoDB Atlas is working perfectly.");
    console.log("🎉 You're ready to use your app!");
  } catch (error: any) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error.message);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Check your DATABASE_URL in .env.local");
    console.error("   2. Make sure your IP is whitelisted in MongoDB Atlas");
    console.error("   3. Verify username and password are correct");
    console.error("   4. Ensure database name is in the connection string");
    console.error("   5. Check MongoDB Atlas cluster is running");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

