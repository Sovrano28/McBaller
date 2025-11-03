# How to Verify PostgreSQL Connection

## ✅ Quick Verification Methods

### Method 1: Run Verification Script (Recommended)

I've created a script that verifies everything:

```bash
npx tsx scripts/verify-db-connection.ts
```

**What it checks:**

- ✅ DATABASE_URL is configured
- ✅ Can connect to PostgreSQL
- ✅ All tables exist
- ✅ Can perform queries
- ✅ Relationships work
- ✅ Shows connection details for pgAdmin

### Method 2: Prisma Studio (GUI)

If Prisma Studio is working (which it is in your terminal), that's a **strong indicator** your app is connected:

```bash
npx prisma studio
```

If you can see your data in Prisma Studio → Your app **IS connected** to PostgreSQL! ✅

### Method 3: Test in Your App

The simplest test:

1. Log in as an organization user
2. Navigate to `/org/dashboard`
3. If you see real data (not empty) → Connected! ✅
4. Try creating a contract or invoice
5. If it saves and you can see it → Definitely connected! ✅

---

## 📊 Verify in pgAdmin

Based on the verification script output, here's how to connect:

### Connection Details (from your setup)

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `mcsportng`
- **Username**: `postgres`
- **Password**: (the password you set when creating the database)

### Steps to Connect in pgAdmin

1. **Open pgAdmin** (if not already open)

2. **Add New Server** (if not already added):

   - Right-click "Servers" → "Register" → "Server"

3. **General Tab**:

   - Name: `McSportng Local` (or any name you prefer)

4. **Connection Tab**:

   - Host name/address: `localhost`
   - Port: `5432`
   - Maintenance database: `mcsportng`
   - Username: `postgres`
   - Password: (your PostgreSQL password)
   - ☑️ Save password

5. **Click "Save"**

6. **Expand the server** → Expand "Databases" → Expand "mcsportng"

### What to Check in pgAdmin

Once connected, verify:

1. **Tables exist**:

   - Navigate to: `Servers` → `McSportng Local` → `Databases` → `mcsportng` → `Schemas` → `public` → `Tables`
   - You should see these tables:
     - ✅ `organizations`
     - ✅ `teams`
     - ✅ `users`
     - ✅ `players`
     - ✅ `contracts`
     - ✅ `invoices`
     - ✅ `payments`
     - ✅ `transactions`
     - ✅ `league_stats`
     - ✅ `training_progress`
     - ✅ `posts`

2. **Check data**:

   - Right-click any table (e.g., `organizations`) → "View/Edit Data" → "All Rows"
   - You should see your seeded data

3. **Test a query**:
   - Right-click `mcsportng` → "Query Tool"
   - Run: `SELECT COUNT(*) FROM organizations;`
   - Should return a number (you have 13 organizations)

---

## 🔍 How to Know Your App is Connected

### Strong Indicators (All working for you!):

1. ✅ **Prisma Studio works** (running at `http://localhost:5555`)

   - This directly queries PostgreSQL via Prisma
   - If Prisma Studio shows data → Connected!

2. ✅ **Verification script passed**

   - Connection successful
   - All tables exist
   - Queries work

3. ✅ **Database has data**
   - 13 organizations
   - 15 users
   - 15 players
   - This means migrations and seeding worked!

### To Confirm in Real-Time:

1. **Watch Prisma logs** in your terminal:

   ```bash
   npm run dev
   ```

   - When you navigate pages, you'll see SQL queries in the terminal
   - Example: `prisma:query SELECT ... FROM "organizations"`

2. **Create data and verify**:

   - Log in as organization → Create a contract
   - Check in Prisma Studio → See the new contract
   - Check in pgAdmin → See the new row in `contracts` table

3. **Query in pgAdmin**:

   ```sql
   -- See recent contracts
   SELECT * FROM contracts ORDER BY "createdAt" DESC LIMIT 5;

   -- See recent invoices
   SELECT * FROM invoices ORDER BY "createdAt" DESC LIMIT 5;

   -- See players with their organizations
   SELECT p.name, p.position, o.name as organization
   FROM players p
   LEFT JOIN organizations o ON p."organizationId" = o.id
   LIMIT 10;
   ```

---

## 🐛 Troubleshooting

### If Prisma Studio works but app doesn't:

1. **Check `.env.local` file exists**:

   ```bash
   # Should have:
   DATABASE_URL="postgresql://postgres:password@localhost:5432/mcsportng?schema=public"
   ```

2. **Restart Next.js dev server**:

   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

### If nothing works:

1. **Verify PostgreSQL is running**:

   ```bash
   # Windows (check Services)
   # Or in pgAdmin, try connecting
   ```

2. **Test connection manually**:

   ```bash
   psql -h localhost -U postgres -d mcsportng
   ```

3. **Check DATABASE_URL**:
   ```bash
   # In your app root, create/check .env.local
   echo $DATABASE_URL  # Should show your connection string
   ```

---

## ✅ Current Status (From Verification)

Based on the script output:

- ✅ **Connected**: Successfully connected to PostgreSQL
- ✅ **Database**: `mcsportng` on `localhost:5432`
- ✅ **Tables**: All 11 tables exist
- ✅ **Data**: 13 organizations, 15 users, 15 players seeded
- ✅ **Relationships**: Working (can query related data)

**Conclusion**: Your app **IS fully connected** to PostgreSQL! 🎉

The fact that Prisma Studio works is the best proof - it directly queries your PostgreSQL database using the same connection string your app uses.
