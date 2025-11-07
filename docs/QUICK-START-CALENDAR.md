# 🚀 Quick Start: Calendar Feature

## Prerequisites

- MongoDB database running (local or Atlas)
- Prisma schema pushed (`npx prisma db push`)
- Next.js dev server ready

---

## Setup Steps

### 1. Push Prisma Schema

The calendar collections are part of the Prisma schema. If you haven't created them yet:

```bash
npx prisma db push
```

This will create the `Event` and `CalendarSync` collections.

### 2. Generate Prisma Client

If you're seeing TypeScript errors, regenerate Prisma Client:

```bash
npx prisma generate
```

**Note**: Stop your dev server first if you get an EPERM error.

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access Calendar

1. Log in as an **Organization** user
2. Navigate to **Calendar** in the sidebar
3. Click **New Event** to create your first event

---

## First Event Example

Create a practice event:

1. Go to `/org/calendar/new`
2. Fill in:
   - **Title**: "Morning Practice"
   - **Type**: Practice
   - **Start**: Today at 8:00 AM
   - **End**: Today at 10:00 AM
   - **Location**: "Main Field"
3. Click **Create Event**

You should see it appear in your calendar!

---

## Testing Checklist

- [ ] Create a practice event
- [ ] Create a game event
- [ ] Create an all-day tournament
- [ ] Edit an existing event
- [ ] Delete an event
- [ ] View calendar month view
- [ ] Check upcoming events sidebar

---

## Calendar Sync (Coming Soon)

The infrastructure is ready, but external calendar integration requires:

1. **Google Calendar**
   - OAuth 2.0 credentials from Google Cloud Console
   - Google Calendar API enabled

2. **Outlook Calendar**
   - Microsoft App Registration
   - Microsoft Graph API permissions

For now, use the basic calendar features. External sync can be added later.

---

## Troubleshooting

### "Module not found" errors

Stop your dev server and regenerate Prisma Client:
```bash
npx prisma generate
npm run dev
```

### "Event not showing"

1. Check you're logged in as organization user
2. Verify event was created for your organization
3. Check browser console for errors

### "Can't edit event"

1. Verify event exists in database
2. Check organizationId matches
3. Try refreshing the page

---

## Need Help?

- Check [CALENDAR-FEATURE.md](./CALENDAR-FEATURE.md) for full documentation
- Review [Database Setup](./SETUP-DATABASE.md) for DB issues
- Check browser console for JavaScript errors

---

**Happy Scheduling! ⚽📅**

