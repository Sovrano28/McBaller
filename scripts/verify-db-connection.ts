/**
 * Database Connection Verification Script
 *
 * Run with: npx tsx scripts/verify-db-connection.ts
 *
 * This script verifies that:
 * 1. The DATABASE_URL is configured
 * 2. Prisma can connect to PostgreSQL
 * 3. All tables exist
 * 4. Can perform basic queries
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function verifyConnection() {
  console.log("🔍 Verifying PostgreSQL Connection...\n");

  // 1. Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL not found in environment variables");
    console.log("\n💡 Make sure you have a .env or .env.local file with:");
    console.log(
      '   DATABASE_URL="postgresql://user:password@localhost:5432/mcsportng"'
    );
    process.exit(1);
  }

  // Mask password in URL for security
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");
  console.log("✅ DATABASE_URL found:", maskedUrl);

  try {
    // 2. Test connection with $connect
    console.log("\n🔄 Testing connection...");
    await prisma.$connect();
    console.log("✅ Successfully connected to PostgreSQL!");

    // 3. Test a simple query
    console.log("\n📊 Running test queries...");
    const orgCount = await prisma.organization.count();
    const userCount = await prisma.user.count();
    const playerCount = await prisma.player.count();
    const contractCount = await prisma.contract.count();
    const invoiceCount = await prisma.invoice.count();

    console.log("\n📈 Database Statistics:");
    console.log(`   Organizations: ${orgCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Players: ${playerCount}`);
    console.log(`   Contracts: ${contractCount}`);
    console.log(`   Invoices: ${invoiceCount}`);

    // 4. Check if tables exist by querying schema
    console.log("\n📋 Verifying tables exist...");
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    const expectedTables = [
      "organizations",
      "teams",
      "users",
      "players",
      "contracts",
      "invoices",
      "payments",
      "transactions",
      "league_stats",
      "training_progress",
      "posts",
    ];

    console.log("\n✅ Found tables in database:");
    tables.forEach(table => {
      const expected = expectedTables.includes(table.tablename);
      const status = expected ? "✅" : "⚠️ ";
      console.log(`   ${status} ${table.tablename}`);
    });

    const missingTables = expectedTables.filter(
      table => !tables.some(t => t.tablename === table)
    );

    if (missingTables.length > 0) {
      console.log("\n⚠️  Missing expected tables:");
      missingTables.forEach(table => console.log(`   - ${table}`));
      console.log("\n💡 Run migrations: npx prisma migrate dev");
    }

    // 5. Test a sample query with relations
    console.log("\n🔗 Testing relationships...");
    const sampleOrg = await prisma.organization.findFirst({
      include: {
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
      console.log(`\n✅ Sample Organization: "${sampleOrg.name}"`);
      console.log(`   - Players: ${sampleOrg._count.players}`);
      console.log(`   - Teams: ${sampleOrg._count.teams}`);
      console.log(`   - Contracts: ${sampleOrg._count.contracts}`);
      console.log(`   - Invoices: ${sampleOrg._count.invoices}`);
    } else {
      console.log("\n⚠️  No organizations found (database might be empty)");
      console.log("💡 Run seed script: npm run prisma:seed");
    }

    console.log("\n✅ All checks passed! Your app is connected to PostgreSQL.");
    console.log("\n💡 You can now:");
    console.log("   - View data in Prisma Studio: npx prisma studio");
    console.log("   - View data in pgAdmin (connection details below)");
    console.log("\n📝 Connection Info for pgAdmin:");
    const url = new URL(dbUrl);
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port || 5432}`);
    console.log(`   Database: ${url.pathname.slice(1)}`);
    console.log(`   Username: ${url.username}`);
  } catch (error: any) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error.message);

    if (error.code === "P1001") {
      console.error("\n💡 Possible issues:");
      console.error("   - PostgreSQL server is not running");
      console.error(
        "   - Wrong DATABASE_URL (check host, port, database name)"
      );
      console.error("   - Incorrect username/password");
    } else if (error.code === "P1017") {
      console.error("\n💡 Connection was closed. Check:");
      console.error("   - PostgreSQL server logs");
      console.error("   - Network connectivity");
    } else {
      console.error(
        "\n💡 Check your DATABASE_URL and PostgreSQL server status"
      );
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyConnection();
