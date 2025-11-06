/**
 * Run Prisma Migrations with Direct Connection
 *
 * This script uses DIRECT_URL for migrations automatically.
 * Your app will continue using DATABASE_URL (pooler) for runtime.
 *
 * Run with: npm run db:migrate
 */

import dotenv from "dotenv";
import { resolve } from "path";
import { spawn } from "child_process";

// Load .env.local explicitly
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function runMigrations() {
  console.log("🔄 Running Prisma Migrations with Direct Connection...\n");

  const directUrl = process.env.DIRECT_URL;
  const databaseUrl = process.env.DATABASE_URL;

  if (!directUrl) {
    console.error("❌ DIRECT_URL not found in .env.local");
    console.log("\n💡 Make sure you have DIRECT_URL set in .env.local");
    console.log("   DIRECT_URL=\"postgresql://...:5432/...\"");
    process.exit(1);
  }

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  console.log("✅ Using direct connection for migrations");
  const hostMatch = directUrl.match(/@([^:]+)/);
  console.log("   Host:", hostMatch ? hostMatch[1] : "unknown");
  console.log("   Port: 5432 (direct)\n");
  console.log("💡 Your app will continue using pooler connection for runtime\n");

  // Run Prisma migrate deploy with DIRECT_URL as DATABASE_URL
  // Using 'deploy' instead of 'dev' for existing migrations
  const migrateProcess = spawn("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      DATABASE_URL: directUrl, // Override with direct connection
    },
  });

  migrateProcess.on("close", code => {
    if (code === 0) {
      console.log("\n✅ Migrations completed successfully!");
      console.log("\n💡 Your app will use the pooler connection (DATABASE_URL) for runtime");
    } else {
      console.error(`\n❌ Migration failed with exit code ${code}`);
      process.exit(code || 1);
    }
  });

  migrateProcess.on("error", error => {
    console.error("\n❌ Failed to start migration process:", error.message);
    process.exit(1);
  });
}

runMigrations();

