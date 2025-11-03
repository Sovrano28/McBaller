# McSportng

**Professional Development Platform for Nigerian Footballers**

## Overview

McSportng is a comprehensive professional development platform exclusively for Nigerian football players. We provide expert training programs, personalized nutrition plans using local foods, and injury prevention strategies, while also showcasing Nigerian Professional Football League (NPFL) statistics and allowing players to track and upload their own performance data.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (or use Supabase/Neon cloud database)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Start development server
npm run dev
```

Visit [http://localhost:9002](http://localhost:9002)

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session-based auth
- **Charts**: Recharts

## Features

- 🏃 **Training Programs**: Position-specific programs for Nigerian climate
- 🍽️ **Nutrition Plans**: Meal plans using local Nigerian foods
- 🛡️ **Injury Prevention**: Injury tracking and prevention protocols
- 📊 **League Stats**: NPFL player statistics and leaderboards
- 📈 **Personal Stats**: Upload and track your performance data
- 🎯 **Subscription Tiers**: Free, Pro (₦5,000/mo), Elite (₦12,000/mo)

## Documentation

All documentation is in the `docs/` folder:

- [Blueprint](./docs/blueprint.md) - Complete project specifications
- [Database Setup](./docs/README-DATABASE-SETUP.md) - Database configuration guides
- [Prisma Schema Design](./docs/prisma-schema-design.md) - Database structure
- [Database Connection Guide](./docs/VERIFY-DATABASE-CONNECTION.md) - Troubleshooting

## Project Structure

```
McBaller/
├── docs/                    # All documentation files
│   ├── blueprint.md        # Complete project specs
│   └── *.md               # Other documentation
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma      # Prisma schema
│   ├── seed.ts            # Database seeding script
│   └── migrations/        # Migration history
├── scripts/               # Utility scripts
│   └── one-time-seed-scripts/  # One-off seed scripts (not in git)
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   └── lib/             # Utilities and helpers
└── public/              # Static assets
```

## Development

```bash
# Run development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Database utilities
npx prisma studio          # Open database GUI
npm run db:verify          # Verify database connection
npm run db:test            # Test database operations
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database (choose one)
DATABASE_URL="postgresql://postgres:password@localhost:5432/mcsportng?schema=public"
# OR use Supabase
# DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Optional: Supabase Client (for future features)
# NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
# NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

## Contributing

Please read our contributing guidelines before submitting PRs.

## License

Copyright © 2025 McSportng. All rights reserved.
