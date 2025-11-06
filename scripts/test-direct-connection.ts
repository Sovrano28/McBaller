/**
 * Test Direct Connection to NeonDB
 * 
 * Run with: npx tsx scripts/test-direct-connection.ts
 */

import dotenv from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";

// Load .env.local explicitly
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function testDirectConnection() {
  console.log("🧪 Testing Direct Connection (Port 5432)...\n");

  const directUrl = process.env.DIRECT_URL;
  
  if (!directUrl) {
    console.error("❌ DIRECT_URL not found");
    process.exit(1);
  }

  const maskedUrl = directUrl.replace(/:[^:@]+@/, ":****@");
  console.log("✅ DIRECT_URL found:", maskedUrl);
  console.log("   Port: 5432 (direct)\n");

  try {
    const sql = neon(directUrl);
    console.log("🔄 Testing connection...");
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log("✅ Direct connection successful!");
    console.log("   Current time:", result[0].current_time);
    console.log("   PostgreSQL version:", result[0].pg_version.split(",")[0]);
  } catch (error: any) {
    console.error("❌ Direct connection failed:", error.message);
    console.log("\n💡 Possible issues:");
    console.log("   1. Direct connection might be disabled in Neon");
    console.log("   2. Check if port 5432 is accessible");
    console.log("   3. Try using pooler connection for migrations (less ideal)");
    process.exit(1);
  }
}

testDirectConnection();

