/**
 * Test Neon Serverless Connection
 *
 * Run with: npx tsx scripts/test-neon-connection.ts
 *
 * This script tests:
 * 1. DATABASE_URL environment variable
 * 2. Neon serverless driver connection
 * 3. Basic SQL query execution
 */

// Load environment variables from .env.local
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function testNeonConnection() {
  console.log("🧪 Testing Neon Serverless Connection...\n");

  // Step 1: Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL not found in environment variables");
    console.log("\n💡 Make sure you have a .env.local file with:");
    console.log(
      '   DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"'
    );
    console.log("\nFor Neon pooler connection:");
    console.log(
      '   DATABASE_URL="postgresql://user:password@ep-xxx-pooler.us-west-2.aws.neon.tech:6543/db?sslmode=require"'
    );
    process.exit(1);
  }

  // Mask password in URL for security
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");
  console.log("✅ DATABASE_URL found:", maskedUrl);

  // Check if it's a Neon connection
  const isNeon = dbUrl.includes("neon.tech") || dbUrl.includes("neon.tech");
  if (isNeon) {
    console.log("✅ Detected Neon database connection");

    // Check if using pooler
    if (dbUrl.includes("-pooler")) {
      console.log(
        "✅ Using Neon pooler connection (recommended for app runtime)"
      );
      if (dbUrl.includes(":6543")) {
        console.log("✅ Correct port (6543) for pooler");
      } else {
        console.warn("⚠️  Warning: Pooler connection should use port 6543");
      }
    } else {
      console.log("ℹ️  Using direct connection (use pooler for production)");
    }
  }

  // Step 2: Initialize Neon client
  console.log("\n🔄 Initializing Neon serverless client...");
  let sql;
  try {
    sql = neon(dbUrl);
    console.log("✅ Neon client initialized");
  } catch (error: any) {
    console.error("❌ Failed to initialize Neon client:", error.message);
    process.exit(1);
  }

  // Step 3: Test connection with a simple query
  console.log("\n🔄 Testing database connection...");
  try {
    const result =
      await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log("✅ Connection successful!");
    console.log("   Current time:", result[0].current_time);
    console.log("   PostgreSQL version:", result[0].pg_version.split(",")[0]);
  } catch (error: any) {
    console.error("❌ Connection failed:", error.message);
    console.log("\n💡 Troubleshooting:");
    console.log("   1. Check your connection string format");
    console.log("   2. Verify your database credentials");
    console.log("   3. Ensure ?sslmode=require is included");
    console.log("   4. For Neon: Use pooler connection (port 6543) for app");
    process.exit(1);
  }

  // Step 4: Test querying your schema
  console.log("\n🔄 Testing schema queries...");
  try {
    // Check if players table exists
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log(`✅ Found ${tablesResult.length} table(s) in database:`);
    tablesResult.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });

    // Try to query players table if it exists
    const hasPlayersTable = tablesResult.some(
      (row: any) => row.table_name === "players"
    );

    if (hasPlayersTable) {
      const playerCount = await sql`SELECT COUNT(*) as count FROM players`;
      console.log(
        `\n✅ Players table exists with ${playerCount[0].count} record(s)`
      );
    } else {
      console.log("\nℹ️  Players table not found (run migrations if needed)");
    }
  } catch (error: any) {
    console.warn("⚠️  Schema query warning:", error.message);
    console.log("   (This is normal if migrations haven't been run yet)");
  }

  // Step 5: Test a complex query (if tables exist)
  console.log("\n🔄 Testing complex query...");
  try {
    const complexResult = await sql`
      SELECT 
        COUNT(*) as total_tables,
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as public_tables
    `;
    console.log("✅ Complex query executed successfully");
    console.log("   Total tables:", complexResult[0].total_tables);
  } catch (error: any) {
    console.warn("⚠️  Complex query warning:", error.message);
  }

  console.log("\n🎉 All tests completed!");
  console.log("\n✅ Your Neon serverless connection is working correctly!");
  console.log("\n📝 Next steps:");
  console.log("   1. You can now use the functions in src/app/actions.ts");
  console.log("   2. Import them: import { getData } from '@/app/actions'");
  console.log(
    "   3. Use them in your Server Components or call from Client Components"
  );
  console.log("\n🌐 Test in browser: http://localhost:9002/test/neon");
}

testNeonConnection().catch(error => {
  console.error("\n❌ Test failed with error:", error);
  process.exit(1);
});
