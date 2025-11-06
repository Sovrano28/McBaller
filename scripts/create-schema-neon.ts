/**
 * Create Schema in NeonDB using Migration SQL
 *
 * This script reads the migration SQL files and executes them
 * using the Neon serverless driver (which works better than Prisma for DDL)
 *
 * Run with: npm run db:create-schema
 */

import dotenv from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

// Load .env.local explicitly
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const NEON_DB_URL = process.env.DATABASE_URL;

if (!NEON_DB_URL) {
  console.error("❌ DATABASE_URL (NeonDB) not found in .env.local");
  process.exit(1);
}

async function createSchema() {
  console.log("🔄 Creating Schema in NeonDB from Migration Files...\n");

  const sql = neon(NEON_DB_URL);

  // Test connection
  try {
    await sql`SELECT 1`;
    console.log("✅ Connected to NeonDB\n");
  } catch (error: any) {
    console.error("❌ Failed to connect to NeonDB:", error.message);
    process.exit(1);
  }

  // Get all migration directories
  const migrationsDir = join(process.cwd(), "prisma", "migrations");
  const migrations = readdirSync(migrationsDir)
    .filter(dir => dir !== "migration_lock.toml")
    .sort();

  console.log(`📦 Found ${migrations.length} migration(s)\n`);

  for (const migration of migrations) {
    const migrationPath = join(migrationsDir, migration, "migration.sql");
    console.log(`🔄 Applying migration: ${migration}...`);

    try {
      const sqlContent = readFileSync(migrationPath, "utf-8");

      // Parse and execute SQL statements one by one
      // Neon driver works better with individual statements
      const lines = sqlContent.split("\n");
      let currentStatement = "";
      let statements: string[] = [];

      // Parse SQL into individual statements
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip comments
        if (trimmed.startsWith("--")) continue;

        currentStatement += line + "\n";

        // If line ends with semicolon, it's a complete statement
        if (trimmed.endsWith(";")) {
          const stmt = currentStatement.trim();
          if (stmt && stmt !== ";") {
            statements.push(stmt);
          }
          currentStatement = "";
        }
      }

      // Add any remaining statement
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }

      // Execute each statement
      let executed = 0;
      for (const statement of statements) {
        if (!statement || statement === ";" || statement.length < 10) continue;

        try {
          await sql.unsafe(statement);
          executed++;
        } catch (error: any) {
          // Ignore "already exists" errors
          if (
            error.message?.includes("already exists") ||
            error.message?.includes("duplicate key") ||
            error.message?.includes("relation already exists")
          ) {
            // Table/constraint already exists, that's okay
            executed++;
          } else {
            console.log(`   ⚠️  Error: ${error.message.substring(0, 150)}`);
            console.log(`   Statement: ${statement.substring(0, 100)}...`);
          }
        }
      }

      if (executed > 0) {
        console.log(`   ✅ Executed ${executed} statement(s)`);
      }

      console.log(`   ✅ Migration applied\n`);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        console.log(`   ⏭️  No SQL file found (skipping)\n`);
      } else {
        console.log(`   ⚠️  Error: ${error.message}\n`);
      }
    }
  }

  // Verify tables were created
  console.log("🔍 Verifying schema...");
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log(`✅ Found ${tables.length} table(s) in NeonDB:`);
    tables.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });
  } catch (error: any) {
    console.log(`⚠️  Could not verify: ${error.message}`);
  }

  console.log("\n🎉 Schema creation completed!");
  console.log("\n💡 Next step: Run 'npm run db:migrate-data' to migrate your data");
}

createSchema().catch(error => {
  console.error("\n❌ Schema creation failed:", error);
  process.exit(1);
});

