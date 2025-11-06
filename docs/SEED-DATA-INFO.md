# Seed Data Information

## What Was Created

The seed script has populated your MongoDB database with comprehensive demo data:

### Organizations (16 total)
- **13 Club Organizations:**
  - Enyimba FC
  - Kano Pillars FC
  - Shooting Stars SC
  - Kaduna United FC
  - Rangers International FC
  - Nasarawa Amazons
  - Heartland FC
  - Remo Stars FC
  - Bayelsa Queens
  - Lobi Stars FC
  - Abia Warriors FC
  - Rivers Angels FC
  - Akwa United FC

- **3 Agent Organizations:**
  - Nigerian Football Agents
  - West Africa Sports Management
  - Elite Player Management

### Teams (13 teams)
- One main team created for each club organization
- Teams are linked to their parent organizations
- Players are assigned to their respective teams

### Players (15 players)
All players have:
- Complete profiles (name, username, email, phone, position, etc.)
- League statistics (goals, assists, appearances)
- Subscription tiers (free, pro, elite)
- Training progress and badges
- Social media links
- Bio information

**Sample Players:**
- Chukwuemeka Okonkwo (Forward, Enyimba FC)
- Amina Hassan (Midfielder, Kano Pillars FC)
- Fatima Bello (Forward, Nasarawa Amazons)
- Blessing Nwosu (Goalkeeper, Rangers International FC)
- And 11 more...

### Users
- **15 Player Users** - One for each player
- **13 Organization Admin Users** - One for each club
- **3 Agent Admin Users** - One for each agent organization
- **1 System Admin** - admin@mcballer.com (from setup)

### Additional Data
- **League Statistics** - Historical stats for players across seasons
- **Posts** - 5 sample social media posts from players
- **Team Assignments** - All players assigned to their respective teams

## Login Credentials

### For Players:
- **Email:** Any player email (e.g., `chukwuemeka@test.com`, `amina@test.com`)
- **Password:** `password123`

### For Club Organizations:
- **Email:** `{club-slug}@mcballer.test` (e.g., `enyimba@mcballer.test`, `kanopillars@mcballer.test`)
- **Password:** `password123`

### For Agent Organizations:
- **Email:** Agent email (e.g., `info@nigerianagents.com`, `contact@westafricasports.com`)
- **Password:** `password123`

### System Admin:
- **Email:** `admin@mcballer.com`
- **Password:** `admin123`

## Running the Seed Again

To re-run the seed script (it uses upsert, so it's safe to run multiple times):

```bash
npx tsx prisma/seed.ts
```

Or if you have it configured in package.json:
```bash
npm run prisma:seed
```

## Data Structure

- **Organizations** → Have multiple **Teams**
- **Teams** → Have multiple **Players**
- **Players** → Have **League Stats**, **Posts**, **Training Progress**
- **Users** → Can be players, org admins, or agent admins
- **All players are assigned to teams** within their organizations

## Next Steps

1. **Login as different user types** to see different views
2. **Explore the dashboard** with the seeded data
3. **Test features** like player profiles, team management, etc.
4. **Create additional data** through the UI

