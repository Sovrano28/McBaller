# Local MongoDB Setup - Step by Step

## Step 1: Install MongoDB Community Edition

1. Download the installer from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
2. Choose the latest **MSI** for Windows.
3. During installation:
   - Select **Complete** setup.
   - Check **Install MongoDB Compass** if you want the GUI (recommended).
   - Leave "Run service as Network Service user" enabled.
4. Finish the install; the MongoDB service will start automatically.

## Step 2: Create the Application Database

Open **Command Prompt** or **PowerShell** and run:

```bash
"C:\Program Files\MongoDB\Server\<version>\bin\mongosh.exe"
```

In the Mongo shell:

```javascript
use mcballer
db.createCollection("Organization")
```

This creates the database and a starter collection. You can exit the shell with `exit`.

## Step 3: Create `.env.local`

In the project root (same folder as `package.json`), create a file named `.env.local`:

```env
DATABASE_URL="mongodb://localhost:27017/mcballer"
```

If you set up authentication, add `username:password@` before `localhost`.

## Step 4: Push the Prisma Schema

```bash
npx prisma generate
npx prisma db push
```

This generates the Prisma client and creates all required collections in your local MongoDB instance.

## Step 5: (Optional) Seed Example Data

```bash
npm run prisma:seed
```

## Step 6: Verify the Connection

```bash
npx prisma studio
```

Prisma Studio opens at `http://localhost:5555`. You should see the newly created collections. Alternatively, open MongoDB Compass and connect using `mongodb://localhost:27017`.

---

## Troubleshooting

### MongoDB service isn't running

- Open **Services** (`services.msc`) and ensure `MongoDB` status is **Running**.
- Start it manually if needed.

### Cannot connect from Prisma

- Confirm the connection string in `.env.local` matches your setup.
- Restart the dev server after updating environment variables.

### Collections missing in Compass

- Run `npx prisma db push` again; Prisma will recreate the schema if necessary.
- Ensure you are pointing Compass to the correct database (`mcballer`).

With these steps complete, your local MongoDB environment is ready for development. 🎉

