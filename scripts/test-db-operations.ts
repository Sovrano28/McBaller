/**
 * Test Database Operations Script
 *
 * Run with: npx tsx scripts/test-db-operations.ts
 *
 * This creates sample data to verify everything works:
 * - Creates a sample contract
 * - Creates a sample invoice
 * - Shows they're saved in the database
 */

// Load environment variables from .env.local
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function testOperations() {
  console.log("🧪 Testing Database Operations...\n");

  try {
    // Get first organization and player
    const org = await prisma.organization.findFirst({
      where: { type: "club" },
    });
    const player = await prisma.player.findFirst({
      where: { organizationId: org?.id },
    });

    if (!org || !player) {
      console.log(
        "⚠️  No organization or player found. Run seed first: npm run prisma:seed"
      );
      return;
    }

    console.log(`✅ Using Organization: ${org.name}`);
    console.log(`✅ Using Player: ${player.name}\n`);

    // Test 1: Create a Contract
    console.log("📝 Test 1: Creating a contract...");
    const contract = await prisma.contract.create({
      data: {
        playerId: player.id,
        organizationId: org.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        salary: 500000,
        status: "active",
        terms: {
          bonus: "Goal bonus: ₦10,000 per goal",
          notes: "Test contract created via script",
        },
      },
    });
    console.log(`✅ Contract created: ${contract.id}`);
    console.log(`   Status: ${contract.status}`);
    console.log(`   Salary: ₦${Number(contract.salary).toLocaleString()}\n`);

    // Test 2: Create an Invoice
    console.log("📝 Test 2: Creating an invoice...");
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const invoiceCount = await prisma.invoice.count({
      where: {
        organizationId: org.id,
        createdAt: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lte: new Date(today.setHours(23, 59, 59, 999)),
        },
      },
    });
    const invoiceNumber = `INV-${dateStr}-${String(invoiceCount + 1).padStart(
      4,
      "0"
    )}`;

    const invoice = await prisma.invoice.create({
      data: {
        organizationId: org.id,
        playerId: player.id,
        invoiceNumber,
        amount: 250000,
        currency: "NGN",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: "draft",
      },
    });
    console.log(`✅ Invoice created: ${invoice.invoiceNumber}`);
    console.log(`   Amount: ₦${Number(invoice.amount).toLocaleString()}`);
    console.log(`   Status: ${invoice.status}\n`);

    // Test 3: Query and verify
    console.log("📊 Test 3: Verifying data...");
    const contracts = await prisma.contract.findMany({
      where: { organizationId: org.id },
      include: { player: { select: { name: true } } },
    });
    const invoices = await prisma.invoice.findMany({
      where: { organizationId: org.id },
      include: { player: { select: { name: true } } },
    });

    console.log(`✅ Contracts for ${org.name}: ${contracts.length}`);
    contracts.forEach(c => {
      console.log(
        `   - ${c.player.name}: ${c.status} (₦${Number(
          c.salary || 0
        ).toLocaleString()})`
      );
    });

    console.log(`\n✅ Invoices for ${org.name}: ${invoices.length}`);
    invoices.forEach(i => {
      console.log(
        `   - ${i.invoiceNumber}: ${i.status} (₦${Number(
          i.amount
        ).toLocaleString()})`
      );
    });

    console.log("\n✅ All database operations working!");
    console.log("\n💡 You can verify in:");
    console.log("   - Prisma Studio: npx prisma studio");
    console.log("   - pgAdmin: Check contracts and invoices tables");
    console.log("   - Your app: /org/contracts and /org/billing/invoices");
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testOperations();
