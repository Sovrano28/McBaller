# 🚀 Quick Start: MongoDB Atlas Setup (5 Minutes)

## Step 1: Create MongoDB Atlas Account (2 min)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free, no credit card)
3. Create project: "McBaller"

## Step 2: Create Free Cluster (1 min)
1. Click "Build a Database"
2. Choose **FREE** (M0)
3. Select region (closest to you)
4. Click "Create" (takes ~3 minutes)

## Step 3: Setup Access (1 min)
1. **Database Access** → "Add New Database User"
   - Username: `mcballer`
   - Password: Click "Autogenerate Secure Password" (SAVE IT!)
   - Privileges: "Atlas admin"
   - Click "Add User"

2. **Network Access** → "Add IP Address"
   - Click "Allow Access from Anywhere" (for dev)
   - Click "Confirm"

## Step 4: Get Connection String (30 sec)
1. Go to "Database" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: **Node.js**, Version: **5.5+**
4. Copy the connection string

## Step 5: Update .env.local (30 sec)
Replace your `.env.local` with:

```env
# MongoDB Atlas Connection
DATABASE_URL="mongodb+srv://mcballer:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mcballer?retryWrites=true&w=majority"
```

**Replace:**
- `YOUR_PASSWORD` with the password you saved
- `cluster0.xxxxx` with your actual cluster name
- Keep `/mcballer` as the database name

## Step 6: Setup Database (30 sec)
```bash
# Generate Prisma client for MongoDB
npx prisma generate

# Push schema to MongoDB (creates collections)
npx prisma db push

# Create initial admin user
npm run db:setup
```

## Step 7: Test Connection
```bash
npm run db:verify
```

## Step 8: Start Your App
```bash
npm run dev
```

## Login Credentials
After running `npm run db:setup`:
- **Email:** `admin@mcballer.com`
- **Password:** `admin123`

**⚠️ Change password after first login!**

---

## That's It! 🎉

MongoDB Atlas is:
- ✅ **Free** (512MB storage)
- ✅ **No connection issues** (works perfectly with Prisma)
- ✅ **Serverless-friendly**
- ✅ **Easy setup** (5 minutes vs hours with PostgreSQL)

## Need Help?
Check `docs/MONGODB-SETUP.md` for detailed instructions.

