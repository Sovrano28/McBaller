# Database Setup Instructions

The project now uses **MongoDB Atlas** via Prisma's MongoDB connector. Follow the quick steps below to get connected.

## Quick Start

1. **Create a MongoDB Atlas cluster** (free M0 tier works great).
2. **Create a database user** with password authentication.
3. **Allow your IP** under *Network Access* (use "Allow Access from Anywhere" for development).
4. **Copy the connection string** (Driver: Node.js, Version 5.5+).
5. **Update `.env.local`:**

   ```env
   DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mcballer?retryWrites=true&w=majority"
   ```

   Replace `<user>`, `<password>`, and `<cluster>` with your actual values.

## Initialize the Database

```bash
npm install          # if you haven't already
npx prisma generate  # generate Prisma client for MongoDB
npx prisma db push   # create collections in MongoDB
npm run prisma:seed  # optional: load example data
```

## Helpful Scripts

- `npm run db:setup` – guided MongoDB config helper
- `npm run db:verify` – tests the connection and basic queries
- `npm run db:test` – runs sample create/read operations to confirm everything works end-to-end

## Need more guidance?

Check out `docs/MONGODB-SETUP.md` for a detailed Atlas walkthrough, or `docs/VERIFY-DATABASE-CONNECTION.md` to troubleshoot connection issues.
