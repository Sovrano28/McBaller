/**
 * Setup MongoDB - Create initial admin user
 * 
 * Run with: npx tsx scripts/setup-mongodb.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function setupMongoDB() {
  console.log("🚀 Setting up MongoDB for McBaller...\n");

  try {
    // Check if any users exist
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      console.log(`✅ Database already has ${userCount} user(s)`);
      console.log("   Skipping setup. Database is ready to use!");
      return;
    }

    console.log("📝 Creating initial admin user...");

    // Create a default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = await prisma.user.create({
      data: {
        email: "admin@mcballer.com",
        passwordHash: hashedPassword,
        role: "org_admin",
      },
    });

    console.log("✅ Admin user created!");
    console.log("   Email: admin@mcballer.com");
    console.log("   Password: admin123");
    console.log("   ⚠️  Please change this password after first login!\n");

    // Create a sample organization
    const org = await prisma.organization.create({
      data: {
        name: "McBaller Demo",
        slug: "mcballer-demo",
        type: "club",
        email: "admin@mcballer.com",
      },
    });

    console.log("✅ Sample organization created!");
    console.log(`   Name: ${org.name}\n`);

    console.log("🎉 Setup complete! You can now login with:");
    console.log("   Email: admin@mcballer.com");
    console.log("   Password: admin123");

  } catch (error: any) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupMongoDB();

