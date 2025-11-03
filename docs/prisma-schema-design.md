# Prisma Schema Design - McSportng Database

## Overview

This schema supports both **Players** (existing features) and **Organizations** (clubs/teams/agents) managing players, contracts, invoices, and billing.

---

## Database Schema Design

### 1. Organization Table

Stores clubs, teams, and agent agencies.

```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique // URL-friendly identifier (e.g., "enyimba-fc")
  type        String   // "club" | "team" | "agent"
  email       String
  phone       String?
  address     String?
  logo        String?
  website     String?
  description String?
  settings    Json?    // Flexible settings storage
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  teams       Team[]
  users       User[]      // Organization members
  players     Player[]    // Players under this org
  contracts   Contract[]
  invoices    Invoice[]

  @@index([slug])
  @@index([type])
}
```

### 2. Team Table

Teams under an organization (e.g., U-20, First Team, Women's Team).

```prisma
model Team {
  id             String   @id @default(cuid())
  organizationId String
  name           String
  slug           String
  logo           String?
  description    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  contracts      Contract[]
  players        Player[]     // Players assigned to this team via contracts

  @@unique([organizationId, slug])
  @@index([organizationId])
}
```

### 3. User Table

Central authentication table for both players and org users.

```prisma
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  passwordHash   String
  role           String   // "player" | "org_admin" | "coach" | "finance" | "analyst"
  organizationId String?  // Nullable - only for org users
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  lastLoginAt    DateTime?

  // Relations
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  player         Player?       // One-to-one if role is "player"

  @@index([email])
  @@index([organizationId])
  @@index([role])
}
```

### 4. Player Table

Extends existing player data with database relationships.

```prisma
model Player {
  id                String   @id @default(cuid())
  userId            String   @unique // Links to User table
  name              String
  username          String   @unique
  phone             String
  avatar            String?
  dateOfBirth       DateTime?
  state             String?  // Nigerian state
  currentLocation   String?
  position          String   // "Goalkeeper" | "Defender" | "Midfielder" | "Forward"
  preferredFoot     String?  // "Left" | "Right" | "Both"
  height            Int?     // cm
  weight            Int?     // kg
  bio               String?
  subscriptionTier  String   @default("free") // "free" | "pro" | "elite"
  subscriptionExpiry DateTime?
  trialUsed         Boolean  @default(false)
  joinedAt          DateTime @default(now())

  // Organization Relations (nullable for independent players)
  organizationId    String?
  teamId            String?  // Current team assignment

  // Relations
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization      Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  team              Team?        @relation(fields: [teamId], references: [id], onDelete: SetNull)
  contracts         Contract[]
  invoices          Invoice[]
  leagueStats       LeagueStat[]
  trainingProgress  TrainingProgress[]
  posts             Post[]

  @@index([username])
  @@index([organizationId])
  @@index([teamId])
  @@index([subscriptionTier])
}
```

### 5. LeagueStat Table

Player statistics by season (normalized from previous array structure).

```prisma
model LeagueStat {
  id            String   @id @default(cuid())
  playerId      String
  season        String   // "2024", "2023", etc.
  club          String
  appearances   Int      @default(0)
  goals         Int      @default(0)
  assists       Int      @default(0)
  yellowCards   Int      @default(0)
  redCards      Int      @default(0)
  verified      Boolean  @default(false) // club-verified vs self-reported
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  player        Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@unique([playerId, season, club])
  @@index([playerId])
  @@index([season])
}
```

### 6. Contract Table

Player contracts with organizations.

```prisma
model Contract {
  id             String   @id @default(cuid())
  playerId       String
  organizationId String
  teamId         String?
  startDate      DateTime
  endDate        DateTime?
  salary         Decimal? // Monthly salary in Naira
  terms          String?  // Contract terms (JSON or text)
  status         String   @default("active") // "active" | "expired" | "terminated"
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  player         Player       @relation(fields: [playerId], references: [id], onDelete: Cascade)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  team           Team?        @relation(fields: [teamId], references: [id], onDelete: SetNull)

  @@index([playerId])
  @@index([organizationId])
  @@index([status])
}
```

### 7. Invoice Table

Billing invoices for player subscriptions or services.

```prisma
model Invoice {
  id             String   @id @default(cuid())
  organizationId String
  playerId       String?
  invoiceNumber  String   @unique // Auto-generated (e.g., "INV-2024-001")
  amount         Decimal
  currency       String   @default("NGN")
  status         String   @default("draft") // "draft" | "sent" | "paid" | "overdue" | "void"
  dueDate        DateTime
  paidAt         DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  player         Player?      @relation(fields: [playerId], references: [id], onDelete: SetNull)
  payments       Payment[]

  @@index([organizationId])
  @@index([playerId])
  @@index([status])
  @@index([invoiceNumber])
}
```

### 8. Payment Table

Payment records for invoices.

```prisma
model Payment {
  id            String   @id @default(cuid())
  invoiceId     String
  amount        Decimal
  method        String   // "paystack" | "bank_transfer" | "mobile_money" | "cash"
  status        String   @default("pending") // "pending" | "succeeded" | "failed" | "refunded"
  transactionId String?  // External payment gateway transaction ID
  paidAt        DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  invoice       Invoice      @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  transactions  Transaction[]

  @@index([invoiceId])
  @@index([status])
  @@index([transactionId])
}
```

### 9. Transaction Table

Detailed transaction history (for payment tracking and reconciliation).

```prisma
model Transaction {
  id        String   @id @default(cuid())
  paymentId String
  type      String   // "payment" | "refund" | "adjustment"
  amount    Decimal
  status    String   // "pending" | "completed" | "failed"
  metadata  Json?    // Flexible storage for payment gateway responses
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  payment   Payment  @relation(fields: [paymentId], references: [id], onDelete: Cascade)

  @@index([paymentId])
  @@index([status])
}
```

### 10. TrainingProgress Table (Optional - for tracking training completion)

Tracks which players completed which training programs.

```prisma
model TrainingProgress {
  id              String   @id @default(cuid())
  playerId        String
  trainingProgramId String // References training program ID (from mock data or separate table)
  status          String   @default("in_progress") // "not_started" | "in_progress" | "completed"
  progressPercent Int      @default(0)
  completedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  player          Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@unique([playerId, trainingProgramId])
  @@index([playerId])
}
```

### 11. Post Table

Player posts/feed entries.

```prisma
model Post {
  id        String   @id @default(cuid())
  playerId  String
  content   String
  mediaType String?  // "image" | "video" | null
  mediaUrl  String?
  likes     Int      @default(0)
  comments  Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  player    Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@index([playerId])
  @@index([createdAt])
}
```

---

## Key Design Decisions

### 1. User & Player Separation

- `User` table handles authentication (email, password)
- `Player` table extends user data with football-specific fields
- One-to-one relationship allows role flexibility

### 2. Organization & Team Hierarchy

- Organizations can have multiple Teams
- Players can be assigned to Teams via Contracts
- Both organization and team are nullable on Player (supports independent players)

### 3. Contract System

- Links Player → Organization → Team
- Tracks salary, dates, terms
- Status tracking for active/expired/terminated

### 4. Invoice & Payment Flow

- Invoice belongs to Organization and optionally Player
- Payment tracks individual payments on invoices
- Transaction provides detailed history for reconciliation

### 5. League Stats Normalization

- Moved from JSON array to separate table
- Allows better querying, filtering, and verification
- Supports multiple seasons and clubs per player

### 6. Flexible Settings

- Organization.settings as JSON for future extensibility
- Transaction.metadata for payment gateway data

---

## Migration Considerations

1. **Existing Mock Data**: Current localStorage mock data will need migration script
2. **Username Uniqueness**: Ensure existing usernames are unique before migration
3. **Email Normalization**: Convert existing email formats to lowercase
4. **Default Values**: Set sensible defaults for new fields

---

## Indexes for Performance

All foreign keys are indexed. Additional indexes on:

- Organization: slug, type
- User: email, organizationId, role
- Player: username, organizationId, teamId, subscriptionTier
- LeagueStat: playerId, season
- Contract: playerId, organizationId, status
- Invoice: organizationId, playerId, status, invoiceNumber
- Payment: invoiceId, status, transactionId

---

## Review Questions

1. **Organization Types**: Should we add more specific types or keep it flexible?
2. **Team Assignment**: Do players need to be on only one team at a time, or can they be on multiple?
3. **Contract Terms**: Should terms be JSON for structured data or keep as text?
4. **Training Programs**: Should we create a separate TrainingProgram table, or keep as reference IDs?
5. **Social Media**: Keep as JSON on Player or normalize into separate table?

**Please review and let me know if you want any changes before I implement!**
