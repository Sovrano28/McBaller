# Database Setup Instructions

## Quick Start - Choose Your Database Option

### Option 1: Supabase (Recommended - Free Tier)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (URI format)
5. Paste it into `.env.local` as `DATABASE_URL`
6. Format: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

### Option 2: Neon (Recommended - Free Tier)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the **Connection String**
4. Paste it into `.env.local` as `DATABASE_URL`

### Option 3: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database: `createdb mcsportng`
3. Set `DATABASE_URL` in `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/mcsportng?schema=public"
   ```

## Next Steps After Database Setup

1. **Create `.env.local` file** in project root:

   ```env
   DATABASE_URL="your-connection-string-here"
   ```

2. **Run the migration**:

   ```bash
   npx prisma migrate dev --name init
   ```

3. **Seed the database** (optional):
   ```bash
   npx prisma db seed
   ```

## Verify Setup

Run this command to verify your database connection:

```bash
npx prisma studio
```

This opens Prisma Studio where you can view and edit your database tables in a GUI.
