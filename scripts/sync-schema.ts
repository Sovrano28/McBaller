/**
 * Sync Prisma Schema to Database (using pooler connection)
 *
 * This uses db push which syncs the schema directly.
 * Note: This is less ideal than migrations but works with pooler.
 *
 * Run with: npm run db:sync
 */

import dotenv from "dotenv";
import { resolve } from "path";
import { spawn } from "child_process";

// Load .env.local explicitly
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function syncSchema() {
  console.log("🔄 Syncing Prisma Schema to Database...\n");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  console.log("✅ Using pooler connection for schema sync");
  console.log("   (This will create/update tables based on your schema)\n");

  // Run Prisma db push
  const pushProcess = spawn("npx", ["prisma", "db", "push"], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
    },
  });

  pushProcess.on("close", code => {
    if (code === 0) {
      console.log("\n✅ Schema synced successfully!");
      console.log("\n💡 Next: Run 'npx prisma generate' to update Prisma Client");
    } else {
      console.error(`\n❌ Schema sync failed with exit code ${code}`);
      process.exit(code || 1);
    }
  });

  pushProcess.on("error", error => {
    console.error("\n❌ Failed to start sync process:", error.message);
    process.exit(1);
  });
}

syncSchema();

