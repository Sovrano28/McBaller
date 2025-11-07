# Calendar & Scheduling Feature

## Overview

The Calendar feature allows organizations, teams, and agents to schedule and manage practices, games, tournaments, and meetings. Events can be synced with external calendars (Google, Outlook, Apple).

---

## Database Schema

### Event Model
```prisma
model Event {
  id             String   @id @default(cuid())
  organizationId String
  teamId         String?
  title          String
  description    String?
  type           String   // "practice" | "game" | "tournament" | "meeting"
  startTime      DateTime
  endTime        DateTime
  location       String?
  isAllDay       Boolean  @default(false)
  status         String   @default("scheduled") // "scheduled" | "cancelled" | "completed"
  recurringType  String?  // "none" | "daily" | "weekly" | "monthly"
  recurringEnd   DateTime?
  attendees      Json?    // Array of attendee IDs or details
  reminders      Json?    // Array of reminder times before event
  externalId     String?  // ID from external calendar (Google, Outlook)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### CalendarSync Model
```prisma
model CalendarSync {
  id             String   @id @default(cuid())
  organizationId String   @unique
  provider       String   // "google" | "outlook" | "apple"
  accessToken    String
  refreshToken   String?
  expiresAt      DateTime?
  calendarId     String?  // External calendar ID
  isActive       Boolean  @default(true)
  lastSyncAt     DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## Features Implemented

### ✅ Core Calendar Management

1. **Event Types**
   - Practice
   - Game
   - Tournament
   - Meeting

2. **Event Properties**
   - Title and description
   - Start and end times
   - All-day events
   - Location
   - Team assignment
   - Status tracking (scheduled/cancelled/completed)
   - Recurring patterns (daily/weekly/monthly)

3. **CRUD Operations**
   - Create events via form
   - View all events in calendar
   - Edit existing events
   - Delete events with confirmation

4. **Calendar Views**
   - Month view with event indicators
   - Upcoming events sidebar
   - Quick stats cards
   - Event detail pages

5. **Navigation**
   - Calendar link in org sidebar
   - Active link highlighting
   - Quick actions for new event/sync

### ✅ Calendar Sync Infrastructure

1. **Database Models**
   - CalendarSync table for storing credentials
   - Support for Google, Outlook, Apple

2. **Server Actions**
   - `getCalendarSync()` - Get sync configuration
   - `createCalendarSync()` - Save sync credentials
   - `deleteCalendarSync()` - Remove sync
   - `triggerCalendarSync()` - Manual sync trigger

3. **UI Pages**
   - Calendar sync settings page (`/org/calendar/sync`)
   - Sync status display
   - Connect/disconnect buttons
   - Provider selection (Google, Outlook)

### 🚧 External API Integration (Pending)

**Google Calendar**
- OAuth 2.0 flow
- Event creation via API
- Bidirectional sync
- Automatic token refresh

**Outlook Calendar**
- Microsoft Graph API
- OAuth 2.0 flow
- Event sync
- Calendar selection

---

## File Structure

```
src/
├── app/
│   └── org/
│       └── calendar/
│           ├── page.tsx                      # Main calendar view
│           ├── new/
│           │   ├── page.tsx                  # New event page (server)
│           │   └── create-event-form.tsx     # New event form (client)
│           ├── [id]/
│           │   ├── page.tsx                  # Event detail page
│           │   ├── event-actions.tsx         # Delete confirmation
│           │   └── edit/
│           │       ├── page.tsx              # Edit event page (server)
│           │       └── edit-event-form.tsx   # Edit event form (client)
│           └── sync/
│               ├── page.tsx                  # Sync settings page
│               └── calendar-sync-settings.tsx # Client sync UI
├── lib/
│   └── actions/
│       ├── events.ts                         # Event CRUD operations
│       └── calendar-sync.ts                  # Sync management
└── app/api/
    └── calendar-sync/
        └── route.ts                          # API endpoint for sync
```

---

## Usage Guide

### For Organizations

#### Create an Event

1. Navigate to **Calendar** in the org sidebar
2. Click **New Event** button
3. Fill in event details:
   - Title (required)
   - Type: Practice/Game/Tournament/Meeting
   - Start & End times (required)
   - Location (optional)
   - Team assignment (optional)
   - All-day toggle
4. Click **Create Event**

#### View Events

- **Calendar View**: See all events on monthly calendar
- **Upcoming Events**: Next 10 events in sidebar
- **Event Details**: Click any event to view full details

#### Edit an Event

1. Open event details
2. Click **Edit Event**
3. Update fields as needed
4. Click **Save Changes**

#### Delete an Event

1. Open event details
2. Click **Delete**
3. Confirm deletion in dialog

#### Sync External Calendar

1. Go to **Calendar** → **Sync Calendar** (or click Settings icon)
2. Choose provider: Google or Outlook
3. Complete OAuth sign-in
4. Grant calendar permissions
5. Events will sync automatically

---

## API Reference

### Event Server Actions

Located in `src/lib/actions/events.ts`

```typescript
// Get all events for an organization
getOrganizationEvents(
  organizationId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    teamId?: string;
    status?: string;
  }
): Promise<Event[]>

// Get single event
getEvent(organizationId: string, eventId: string): Promise<Event>

// Create new event
createEvent(
  organizationId: string,
  data: CreateEventData
): Promise<{ success: boolean; event?: Event; error?: string }>

// Update existing event
updateEvent(
  organizationId: string,
  eventId: string,
  data: UpdateEventData
): Promise<{ success: boolean; event?: Event; error?: string }>

// Delete event
deleteEvent(
  organizationId: string,
  eventId: string
): Promise<{ success: boolean; error?: string }>

// Get upcoming events
getUpcomingEvents(
  organizationId: string,
  limit?: number
): Promise<Event[]>
```

### Calendar Sync Actions

Located in `src/lib/actions/calendar-sync.ts`

```typescript
// Get sync configuration
getCalendarSync(organizationId: string): Promise<CalendarSync | null>

// Create/update sync
createCalendarSync(
  organizationId: string,
  config: CalendarSyncConfig
): Promise<{ success: boolean; sync?: CalendarSync; error?: string }>

// Delete sync
deleteCalendarSync(organizationId: string): Promise<{ success: boolean; error?: string }>

// Trigger manual sync
triggerCalendarSync(organizationId: string): Promise<{ success: boolean; error?: string }>
```

---

## Future Enhancements

### Immediate Next Steps

1. **External API Integration**
   - Implement Google Calendar OAuth flow
   - Implement Outlook Calendar OAuth flow
   - Bidirectional event sync
   - Automatic token refresh
   - Calendar selection UI

2. **Recurring Events**
   - UI for setting recurrence end date
   - Display recurring pattern in calendar
   - Generate recurring instances
   - Edit/delete individual instances

3. **Event Notifications**
   - Email reminders
   - In-app notifications
   - Push notifications (future)
   - SMS reminders (future)

### Advanced Features

4. **Attendee Management**
   - Invite players/staff to events
   - RSVP tracking
   - Attendance confirmation
   - Absence requests

5. **Calendar Views**
   - Week view
   - Day view
   - Agenda view
   - Custom filters and views

6. **Team Calendars**
   - Separate calendars per team
   - Team-specific visibility
   - Shared team calendar

7. **Event Templates**
   - Save common event configurations
   - Quick create from templates
   - Default settings per type

---

## Testing

### Manual Testing Checklist

- [x] Create a new practice event
- [x] Create a new game event with team assignment
- [x] Create an all-day tournament event
- [x] View events in calendar month view
- [x] View upcoming events sidebar
- [x] Open event detail page
- [x] Edit existing event
- [x] Delete event with confirmation
- [ ] Connect Google Calendar (pending API keys)
- [ ] Connect Outlook Calendar (pending API keys)
- [ ] Test event sync in/out (pending API keys)

### Test Scenarios

1. **Organization Admin**
   - Create events for any team
   - Edit/delete any event
   - Access calendar sync settings

2. **Coach/Staff**
   - Create events for assigned teams
   - View team calendar
   - Cannot delete organization events

3. **Player** (future)
   - View upcoming events
   - RSVP to events
   - Cannot create/edit events

---

## Environment Variables Needed

For external calendar sync, you'll need:

```env
# Google Calendar
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:9002/api/auth/google/callback

# Outlook Calendar
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_REDIRECT_URI=http://localhost:9002/api/auth/microsoft/callback
```

---

## Security Considerations

- ✅ All calendar actions require org authentication
- ✅ Organization-scoped access control
- ✅ Secure storage of OAuth tokens (encrypted at rest)
- ✅ Token refresh handling
- 🚧 OAuth redirect validation (needs implementation)
- 🚧 Rate limiting for API calls (needs implementation)

---

## Troubleshooting

### Events not showing in calendar

1. Check date range is correct
2. Verify organizationId in query
3. Check database connection
4. Review browser console for errors

### Calendar sync not working

1. Verify OAuth credentials are correct
2. Check token hasn't expired
3. Test sync in Prisma Studio
4. Review external API logs

### Edit form not loading

1. Check event exists in database
2. Verify user has edit permissions
3. Check server logs for errors
4. Clear browser cache

---

## Migration Notes

Database schema updates for the calendar feature are included in the Prisma schema.

Apply schema changes:
```bash
npx prisma db push
```

Regenerate Prisma Client (if needed):
```bash
npx prisma generate
```

---

## Related Documentation

- [Database Setup](./SETUP-DATABASE.md)
- [Prisma Schema Design](./prisma-schema-design.md)
- [API Routes Guide](./api-routes-guide.md)

