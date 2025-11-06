# NeonDB Setup & Installation Overview

## 📋 Overview

This document provides a comprehensive overview of the NeonDB (Serverless PostgreSQL) setup and installation for the McBaller project. NeonDB is a serverless PostgreSQL database that automatically scales and provides a connection pooler for optimal performance in Next.js applications.

## 🎯 What Was Installed

### 1. **Neon Serverless Driver**
- **Package**: `@neondatabase/serverless` (v1.0.2)
- **Purpose**: Provides serverless-compatible PostgreSQL driver for Next.js
- **Location**: Used in server actions and API routes

### 2. **Prisma ORM**
- **Package**: `@prisma/client` (v6.18.0) and `prisma` (v6.18.0)
- **Purpose**: Type-safe database access layer
- **Configuration**: Configured to use PostgreSQL with NeonDB connection string

### 3. **Test Scripts**
Three test scripts were created to verify the installation and connection:

#### a. `scripts/test-neon-connection.ts`
- **Purpose**: Tests Neon serverless driver connection directly
- **What it tests**:
  - DATABASE_URL environment variable presence
  - Neon serverless driver initialization
  - Basic SQL query execution
  - Schema verification (table existence)
  - Complex query execution

#### b. `scripts/verify-db-connection.ts`
- **Purpose**: Verifies Prisma connection to PostgreSQL
- **What it tests**:
  - DATABASE_URL configuration
  - Prisma client connection
  - Table existence verification
  - Basic queries (count operations)
  - Relationship queries
  - Database statistics

#### c. `scripts/test-db-operations.ts`
- **Purpose**: Tests actual database operations (CRUD)
- **What it tests**:
  - Contract creation
  - Invoice creation
  - Data retrieval and verification
  - Relationship queries

### 4. **Test Page**
- **Location**: `src/app/test/neon/page.tsx`
- **Purpose**: Browser-based connection test
- **Features**:
  - Visual connection status indicators
  - Data retrieval tests
  - Environment information display
  - Troubleshooting guidance

## 🔧 Installation Steps

### Step 1: Install Dependencies

```bash
npm install @neondatabase/serverless @prisma/client prisma
```

### Step 2: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# NeonDB Connection String
# Use pooler connection (port 6543) for app runtime
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.us-west-2.aws.neon.tech:6543/db?sslmode=require"
```

**Important Notes:**
- Use the **pooler connection** (port 6543) for Next.js app runtime
- Always include `?sslmode=require` for secure connections
- The connection string format: `postgresql://user:password@host:port/database?sslmode=require`

### Step 3: Prisma Setup

1. **Initialize Prisma** (if not already done):
   ```bash
   npx prisma init
   ```

2. **Run Migrations**:
   ```bash
   npx prisma migrate dev
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **Seed Database** (optional):
   ```bash
   npm run prisma:seed
   ```

## 🧪 Testing the Installation

### Method 1: Command Line Tests

#### Test Neon Serverless Connection
```bash
npm run test:neon
# or
npx tsx scripts/test-neon-connection.ts
```

**Expected Output:**
- ✅ DATABASE_URL found
- ✅ Detected Neon database connection
- ✅ Using Neon pooler connection
- ✅ Connection successful
- ✅ Schema queries working

#### Verify Prisma Connection
```bash
npm run db:verify
# or
npx tsx scripts/verify-db-connection.ts
```

**Expected Output:**
- ✅ DATABASE_URL found
- ✅ Successfully connected to PostgreSQL
- ✅ Database statistics
- ✅ Table verification
- ✅ Relationship tests

#### Test Database Operations
```bash
npm run db:test
# or
npx tsx scripts/test-db-operations.ts
```

**Expected Output:**
- ✅ Contract created
- ✅ Invoice created
- ✅ Data verification successful

### Method 2: Browser Test

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:9002/test/neon`

3. Check the test results:
   - **Test 1: Basic Connection** - Should show ✅ Connection Successful
   - **Test 2: Data Retrieval** - Should show ✅ Data Retrieval Successful
   - **Environment Information** - Should show DATABASE_URL configured

## 📁 File Structure

```
McBaller/
├── .env.local                    # Environment variables (DATABASE_URL)
├── prisma/
│   ├── schema.prisma             # Database schema definition
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Database seeding script
├── scripts/
│   ├── test-neon-connection.ts   # Neon serverless driver test
│   ├── verify-db-connection.ts   # Prisma connection verification
│   └── test-db-operations.ts     # CRUD operations test
├── src/
│   ├── lib/
│   │   └── prisma.ts            # Prisma client singleton
│   ├── app/
│   │   ├── actions.ts           # Server actions using Prisma
│   │   └── test/
│   │       └── neon/
│   │           └── page.tsx     # Browser test page
└── package.json                 # Dependencies and scripts
```

## 🔍 How It Works

### 1. **Prisma Client** (`src/lib/prisma.ts`)
- Creates a singleton Prisma client instance
- Reuses the same instance across requests (development)
- Configured with appropriate logging levels

### 2. **Server Actions** (`src/app/actions.ts`)
- Uses Prisma client to interact with the database
- Handles errors gracefully
- Returns structured responses

### 3. **Neon Serverless Driver**
- Used for direct SQL queries when needed
- Provides connection pooling automatically
- Optimized for serverless environments

## 📊 Connection Types

### Pooler Connection (Recommended for App)
```
postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech:6543/db?sslmode=require
```
- **Port**: 6543
- **Use Case**: Next.js app runtime, API routes, server actions
- **Benefits**: Connection pooling, better performance, handles many concurrent connections

### Direct Connection
```
postgresql://user:password@ep-xxx.region.aws.neon.tech:5432/db?sslmode=require
```
- **Port**: 5432
- **Use Case**: Migrations, one-off scripts, Prisma Studio
- **Note**: Limited concurrent connections

## ✅ Verification Checklist

- [ ] DATABASE_URL is set in `.env.local`
- [ ] Using pooler connection (port 6543) for app
- [ ] Prisma migrations have been run
- [ ] Prisma client has been generated
- [ ] `npm run test:neon` passes all tests
- [ ] `npm run db:verify` shows all tables exist
- [ ] Browser test at `/test/neon` shows green checkmarks
- [ ] Can create contracts and invoices via `npm run db:test`

## 🐛 Troubleshooting

### Issue: "DATABASE_URL not found"
**Solution:**
- Ensure `.env.local` exists in project root
- Verify the file contains `DATABASE_URL=...`
- Restart the development server after adding environment variables

### Issue: "Connection failed"
**Solution:**
- Check connection string format
- Verify credentials are correct
- Ensure `?sslmode=require` is included
- For app runtime, use pooler connection (port 6543)

### Issue: "Tables not found"
**Solution:**
- Run migrations: `npx prisma migrate dev`
- Verify migrations were successful
- Check `prisma/migrations` folder exists

### Issue: "Prisma Client not generated"
**Solution:**
- Run: `npx prisma generate`
- Ensure `schema.prisma` is valid
- Check for errors in terminal output

### Issue: "Connection timeout"
**Solution:**
- Verify NeonDB project is active
- Check network connectivity
- Try using direct connection for testing
- Verify firewall settings

## 📝 NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `test:neon` | `tsx scripts/test-neon-connection.ts` | Test Neon serverless connection |
| `db:verify` | `tsx scripts/verify-db-connection.ts` | Verify Prisma connection |
| `db:test` | `tsx scripts/test-db-operations.ts` | Test CRUD operations |
| `prisma:seed` | `tsx prisma/seed.ts` | Seed database with sample data |

## 🚀 Next Steps

After successful installation and verification:

1. **Use Prisma in Server Actions**
   ```typescript
   import { prisma } from "@/lib/prisma";
   
   export async function getData() {
     return await prisma.organization.findMany();
   }
   ```

2. **Use in Server Components**
   ```typescript
   import { prisma } from "@/lib/prisma";
   
   export default async function Page() {
     const data = await prisma.player.findMany();
     return <div>...</div>;
   }
   ```

3. **Use in API Routes**
   ```typescript
   import { prisma } from "@/lib/prisma";
   
   export async function GET() {
     const data = await prisma.contract.findMany();
     return Response.json(data);
   }
   ```

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

## ✨ Summary

The NeonDB setup provides:
- ✅ Serverless PostgreSQL database
- ✅ Automatic scaling
- ✅ Connection pooling
- ✅ Type-safe database access via Prisma
- ✅ Comprehensive test scripts for verification
- ✅ Browser-based testing interface

All test scripts and the browser test page confirm that the installation is working correctly and ready for development.

