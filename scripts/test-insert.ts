import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);

async function testInsert() {
  try {
    console.log("Testing insert...");
    
    // Test 1: Simple insert with template literal
    const result1 = await sql`
      INSERT INTO organizations (id, name, slug, type, email, "createdAt", "updatedAt") 
      VALUES ('test-123', 'Test Org', 'test-org', 'club', 'test@test.com', NOW(), NOW()) 
      ON CONFLICT (id) DO NOTHING 
      RETURNING id
    `;
    console.log("Test 1 result:", result1);

    // Test 2: Parameterized insert
    const result2 = await sql.unsafe(
      `INSERT INTO organizations (id, name, slug, type, email, "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       ON CONFLICT (id) DO NOTHING 
       RETURNING id`,
      ["test-456", "Test Org 2", "test-org-2", "club", "test2@test.com"]
    );
    console.log("Test 2 result:", result2);

    // Check count
    const count = await sql`SELECT COUNT(*) as count FROM organizations`;
    console.log("Total organizations:", count[0].count);
  } catch (error: any) {
    console.error("Error:", error.message);
    console.error("Full error:", error);
  }
}

testInsert();

