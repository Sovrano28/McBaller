# Local PostgreSQL Setup - Step by Step

## Step 1: Create Database

### Option A: Using pgAdmin (GUI - Easiest)

1. Open **pgAdmin** (comes with PostgreSQL installation)
2. Connect to your PostgreSQL server (default: localhost, port 5432)
3. Right-click on **Databases** → **Create** → **Database...**
4. Enter database name: `mcsportng`
5. Click **Save**

### Option B: Using Command Prompt

Open **Command Prompt** or **PowerShell** and run:

```bash
# Find your PostgreSQL bin folder (usually in Program Files)
# Example path: C:\Program Files\PostgreSQL\15\bin

# Add to PATH temporarily for this session, then:
createdb -U postgres mcsportng
```

Or if you know your PostgreSQL password:

```bash
# Replace 'yourpassword' with your PostgreSQL postgres user password
createdb -U postgres -W mcsportng
```

### Option C: Using psql Command Line

```bash
# Connect to PostgreSQL
psql -U postgres

# Then in psql prompt, run:
CREATE DATABASE mcsportng;

# Exit psql
\q
```

---

## Step 2: Create .env.local File

Create a file named `.env.local` in your project root (same level as `package.json`) with this content:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mcsportng?schema=public"
```

**Replace `YOUR_PASSWORD` with your PostgreSQL postgres user password.**

**Default values:**

- Username: `postgres` (default PostgreSQL superuser)
- Host: `localhost`
- Port: `5432` (default PostgreSQL port)
- Database: `mcsportng`

If you use a different username or password, update the connection string accordingly.

---

## Step 3: Run Migration

After creating the database and `.env.local` file, run:

```bash
npx prisma migrate dev --name init
```

This will:

- Create all database tables
- Generate the Prisma Client types
- Set up the schema

---

## Step 4: Verify Setup

Open Prisma Studio to view your database:

```bash
npx prisma studio
```

This opens a web UI at `http://localhost:5555` where you can see all your tables.

---

## Troubleshooting

### "Connection refused" error

- Make sure PostgreSQL service is running
- Check Windows Services: `services.msc` → find "postgresql-x64-XX" → ensure it's Running

### "Password authentication failed"

- Verify your password in `.env.local`
- If you forgot the password, reset it in pgAdmin or reinstall PostgreSQL

### "Database does not exist"

- Make sure you created the `mcsportng` database first (Step 1)
- Check the database name in `.env.local` matches exactly

### Can't find psql/createdb command

- Use pgAdmin (Option A above) - it's the easiest
- Or add PostgreSQL bin folder to your Windows PATH
