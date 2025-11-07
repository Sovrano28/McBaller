# How to Verify MongoDB Connection

## ✅ Quick Verification Methods

### Method 1: Run the Verification Script (Recommended)

Use the bundled script to confirm everything is configured correctly:

```bash
npx tsx scripts/verify-db-connection.ts
```

**The script checks:**

- ✅ `DATABASE_URL` exists
- ✅ Prisma can connect to MongoDB Atlas
- ✅ Core collections respond to queries
- ✅ Relations return data without errors
- ✅ Suggested next steps (Prisma Studio, MongoDB Compass)

### Method 2: Prisma Studio (GUI)

Prisma Studio uses the same credentials as the app:

```bash
npx prisma studio
```

If you can browse collections such as `Organization`, `Player`, and `Contract`, your connection is healthy. ✅

### Method 3: Test Through the App

1. Log in as an organization user
2. Visit `/org/dashboard`
3. Confirm real data appears
4. Create a contract or invoice
5. Refresh to ensure it persists

If the data saves and shows up again, you're connected. ✅

---

## 📊 Inspect in MongoDB Compass (Optional)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Paste your `DATABASE_URL` connection string
3. Expand the `mcballer` database
4. Browse collections like `Organization`, `Player`, `Contract`, and `Invoice`
5. Use filters to spot-check recent documents

---

## 🔍 Signals That Confirm You're Connected

1. ✅ Prisma Studio loads documents at `http://localhost:5555`
2. ✅ `npm run db:verify` prints collection counts without errors
3. ✅ Seed data (organizations, users, players) appears in the UI
4. ✅ Newly created data persists across page reloads

Keep an eye on your terminal when running `npm run dev`—Prisma logs MongoDB queries as they happen.

---

## 🐛 Troubleshooting

### Prisma Studio works, but the app doesn’t

1. Confirm `.env.local` contains a valid MongoDB connection string
2. Restart the dev server: `npm run dev`
3. Clear Next.js cache if needed: `rm -rf .next && npm run dev`

### Connection errors in the script or app

1. Ensure your IP is allowed under **Network Access** in MongoDB Atlas
2. Verify username, password, and database name in the connection string
3. Check that your Atlas cluster is running (green status)
4. If credentials were rotated, update `.env.local` and restart

---

## ✅ What Success Looks Like

When everything is configured correctly you’ll see:

- ✅ Verification script completes without errors
- ✅ Collection counts logged to the console
- ✅ Sample organizations, teams, and players returned
- ✅ Documents visible in Prisma Studio and MongoDB Compass

If those items are true, your app is fully connected to MongoDB Atlas. 🎉

