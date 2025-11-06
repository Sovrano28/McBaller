# MongoDB Atlas Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free (no credit card needed for free tier)
3. Create a new project (e.g., "McBaller")

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0)
3. Select a cloud provider and region (choose closest to you)
4. Click "Create"

### Step 3: Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `mcballer` (or your choice)
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Atlas admin" (for free tier)
7. Click "Add User"

### Step 4: Whitelist Your IP
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP for production
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Your .env.local
Replace the connection string with your MongoDB connection string:

```env
# MongoDB Atlas Connection
DATABASE_URL="mongodb+srv://mcballer:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mcballer?retryWrites=true&w=majority"
```

**Important:** Replace:
- `mcballer` with your database username
- `YOUR_PASSWORD` with your database password
- `cluster0.xxxxx` with your actual cluster name
- Add `/mcballer` before `?` to specify database name

### Step 7: Install Dependencies & Setup
```bash
# Prisma already supports MongoDB, no new packages needed!
# Just regenerate Prisma client
npx prisma generate

# Push schema to MongoDB (creates collections)
npx prisma db push

# Optional: Seed initial data
npm run db:seed
```

## That's It! 🎉

Your app is now connected to MongoDB Atlas. The setup is much simpler than PostgreSQL:
- ✅ No connection pooling issues
- ✅ No direct/pooler URL confusion
- ✅ Works great with serverless
- ✅ Free tier is generous (512MB storage)

## Troubleshooting

**Connection Error?**
- Check your IP is whitelisted in Network Access
- Verify username/password in connection string
- Make sure database name is in the URL

**Schema Push Failed?**
- Make sure MongoDB Atlas cluster is running
- Check connection string format
- Try `npx prisma db push --accept-data-loss` if needed

## Next Steps
1. Test login functionality
2. Your existing data structure will work with MongoDB
3. Prisma handles the MongoDB conversion automatically

