# **App Name**: McBaller

**Tagline**: Professional Development Platform for Nigerian Footballers

## Vision

McBaller is a comprehensive professional development platform exclusively for Nigerian football players. The platform provides expert training programs, personalized nutrition plans using local foods, and injury prevention strategies, while also showcasing Nigerian Professional Football League (NPFL) statistics and allowing players to track and upload their own performance data.

---

## Core Features

### 1. Professional Training Programs
- Position-specific training (Goalkeeper, Defender, Midfielder, Forward)
- Programs designed for Nigerian climate and limited facilities
- Technical skills, physical conditioning, tactical awareness
- Video demonstrations and downloadable workout plans
- Progress tracking and completion badges
- Free preview with subscription tiers for full access

### 2. Diet & Nutrition Plans
- Meal plans using local Nigerian foods (Jollof rice, Eba, Egusi soup, Moi moi, etc.)
- Pre-match and post-workout nutrition strategies
- Hydration guidelines for hot climate
- Calorie calculators based on position and training intensity
- Supplements guide and nutritional values database
- Ramadan fasting strategies for Muslim athletes

### 3. Injury Prevention Module
- Common football injuries dashboard (Hamstring, ACL, Ankle, Groin)
- Position-specific injury risk assessment
- Dynamic warm-up routines with video guides
- Recovery protocols and stretching sequences
- Injury tracking journal (Pro/Elite subscribers)
- Red flag symptoms checker

### 4. Nigerian League Statistics Database
- Browse NPFL player statistics (Goals, Assists, Appearances, Cards)
- Filter by season, club, position
- Search functionality
- Top scorers and top assists leaderboards
- Player profile modals with career breakdowns

### 5. Personal Stats Upload & Tracking
- Players can submit match statistics
- Track season totals (Goals, Assists, Appearances, Cards)
- Verification badge system (club-verified vs self-reported)
- Photo/video evidence upload
- Stats appear on player profile
- Performance analytics and trends

### 6. Player Profiles & Community
- Professional player cards with stats
- Training completion badges
- Subscription tier badges
- Bio and career history
- Social media links
- Feed for updates and achievements

### 7. Analytics Dashboard
- Training completion percentage
- Programs started vs completed
- Goals/assists tracking charts
- Nutrition plan adherence
- Injury-free days counter
- Subscription usage stats
- Personalized recommendations

---

## User Role: Players Only

**Previously**: Platform supported three roles (Players, Scouts, Fans)  
**Now**: Focused exclusively on **Players** for professional development

### Player Features:
- Create and manage professional profile
- Access training programs based on subscription tier
- View nutrition plans and meal prep guides
- Track injury prevention exercises
- Upload and track match statistics
- Browse Nigerian league stats database
- Post updates to community feed
- View analytics and progress tracking
- Manage subscription and billing

---

## Subscription Tiers

### Free Tier
- Basic profile creation
- Browse Nigerian league stats
- Access to 3 training program previews
- Limited nutrition tips
- Basic injury prevention guides
- Community feed access

### Pro Tier - ₦5,000/month
- **14-day free trial**
- Full access to all training programs
- Complete nutrition plans with recipes
- Advanced injury prevention protocols
- Unlimited stats upload
- Priority support
- Downloadable workout PDFs

### Elite Tier - ₦12,000/month
- Everything in Pro, plus:
- 1-on-1 coaching sessions (monthly)
- Personalized training plan creation
- Custom meal plans from nutritionists
- Advanced analytics and insights
- Injury tracking journal
- Direct messaging with coaches
- Early access to new programs

---

## Technical Stack

* **Frontend Framework**: Next.js 15+ (App Router)
* **Styling**: Tailwind CSS with custom Nigerian theme
* **Icons**: Lucide React
* **UI Components**: shadcn/ui (Radix UI primitives)
* **State Management**: React Context for auth; localStorage for persistence
* **Form Handling**: React Hook Form with Zod validation
* **Charts**: Recharts for analytics
* **Storage**: localStorage (mock database for MVP)
* **Routing**: Next.js App Router (file-system based)

---

## Style Guidelines

### Color Palette

**Primary Colors:**
- Nigerian Green: `#008751` - Main brand color, CTAs, headers
- Background: `#F0FAF4` - Light green backdrop (light mode)
- Dark Background: `#0A0A0A` - Main background (dark mode)

**Accent Colors:**
- Gold: `#FFB81C` - Achievements, highlights, nutrition
- Blue: `#0066CC` - Links, secondary CTAs
- Red: `#DC3545` - Injury prevention, alerts, warnings

**Typography:**
- Headline: `'Space Grotesk', sans-serif` - Bold, athletic feel
- Body: `'Inter', sans-serif` - Clean, modern readability

**Design Principles:**
- Mobile-first responsive design
- Nigerian flag elements (subtle green/white accents)
- Football-themed imagery and patterns
- Professional, clean layouts
- Touch-friendly interactions (min 44x44px buttons)

---

## Data Structure

### Player Schema
```typescript
{
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string; // +234...
  avatar: string;
  
  // Basic Info
  dateOfBirth: Date;
  state: string; // Nigerian state
  currentLocation: string;
  
  // Football Details
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  currentClub: string;
  previousClubs?: string[];
  preferredFoot?: 'Left' | 'Right' | 'Both';
  height?: number; // cm
  weight?: number; // kg
  
  // Stats
  stats: {
    goals: number;
    assists: number;
    tackles: number;
  };
  
  // League Stats (uploaded by player)
  leagueStats: {
    season: string;
    club: string;
    appearances: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    verified: boolean; // club-verified or self-reported
  }[];
  
  // Profile
  bio: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  
  // Subscription
  subscriptionTier: 'free' | 'pro' | 'elite';
  subscriptionExpiry?: Date;
  trialUsed: boolean;
  
  // Progress
  trainingCompleted: string[]; // program IDs
  badges: string[];
  joinedAt: Date;
}
```

### Training Program Schema
```typescript
{
  id: string;
  title: string;
  description: string;
  category: 'Technical' | 'Physical' | 'Tactical' | 'Goalkeeper';
  position?: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  duration: string; // '4-week', '8-week', '12-week'
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  requiredTier: 'free' | 'pro' | 'elite';
  author: string;
  authorTitle: string;
  image: { url: string; hint: string };
  prerequisites?: string[];
  equipment?: string[];
  weeks: {
    weekNumber: number;
    days: {
      dayNumber: number;
      title: string;
      exercises: Exercise[];
    }[];
  }[];
}
```

### Nutrition Plan Schema
```typescript
{
  id: string;
  title: string;
  description: string;
  category: 'Pre-match' | 'Post-workout' | 'Hydration' | 'General';
  requiredTier: 'free' | 'pro' | 'elite';
  meals: {
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    name: string;
    ingredients: string[];
    nigerianFoods: string[]; // e.g., ['Jollof Rice', 'Plantain', 'Fish']
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    preparation?: string;
  }[];
}
```

---

## Routing Structure

```
/ - Public landing page
/login - Login page
/signup - Signup page (players only)

/dashboard - Main feed (authenticated)
/training - Training programs listing
/training/[id] - Individual program details
/nutrition - Nutrition plans
/injury-prevention - Injury prevention module
/league-stats - Nigerian league statistics browser
/stats/upload - Upload personal match stats
/pricing - Subscription tiers and pricing
/analytics - Personal analytics dashboard
/profile/[username] - Player profile page
```

---

## Nigerian-Specific Customizations

### Localization
- All 36 Nigerian states + FCT in dropdowns
- Major NPFL clubs: Enyimba FC, Rangers International, Kano Pillars, Rivers United, Plateau United, Lobi Stars, etc.
- Phone numbers with +234 country code
- Currency in Nigerian Naira (₦)
- Time zone: West Africa Time (WAT)

### Cultural Considerations
- Inclusive design (male & female players)
- Ramadan fasting nutrition strategies
- Training for hot climate (30-40°C)
- Limited facilities and equipment adaptation
- Local food-based nutrition
- Community and teamwork values
- Education alongside football emphasis

### Payment Integration (Mock for MVP)
- Bank transfer instructions
- Paystack payment gateway
- Mobile money options (Paga, OPay)

---

## Nigerian Clubs Database

**NPFL Clubs (2024/2025 Season):**
1. Enyimba FC (Aba, Abia State)
2. Rangers International FC (Enugu, Enugu State)
3. Kano Pillars FC (Kano, Kano State)
4. Rivers United FC (Port Harcourt, Rivers State)
5. Plateau United FC (Jos, Plateau State)
6. Lobi Stars FC (Makurdi, Benue State)
7. Remo Stars FC (Ikenne, Ogun State)
8. Shooting Stars SC (Ibadan, Oyo State)
9. Kwara United FC (Ilorin, Kwara State)
10. Nasarawa United FC (Lafia, Nasarawa State)
11. Akwa United FC (Uyo, Akwa Ibom State)
12. Abia Warriors FC (Umuahia, Abia State)
13. Heartland FC (Owerri, Imo State)
14. Niger Tornadoes FC (Minna, Niger State)
15. Sunshine Stars FC (Akure, Ondo State)

---

## Feature Implementation Priority

### Phase 1: Foundation (Week 1) ✅
- [x] Public landing page with services showcase
- [x] Updated blueprint and data model
- [ ] Players-only authentication system
- [ ] Nigerian states and clubs integration

### Phase 2: Training & Navigation (Week 2)
- [ ] Training programs section with filtering
- [ ] Individual program detail pages
- [ ] Updated navigation with new structure
- [ ] Subscription tier access control

### Phase 3: Nutrition & Injury Prevention (Week 3)
- [ ] Nutrition plans with Nigerian foods
- [ ] Injury prevention module
- [ ] Exercise video placeholders
- [ ] Warm-up routine guides

### Phase 4: League Stats (Week 4)
- [ ] Nigerian league stats browser
- [ ] Stats upload system for players
- [ ] Verification badge system
- [ ] Season leaderboards

### Phase 5: Subscriptions & Profiles (Week 5)
- [ ] Pricing page with tiers
- [ ] Enhanced player profiles
- [ ] Training completion badges
- [ ] Subscription management

### Phase 6: Content & Polish (Week 6)
- [ ] 20+ training programs with Nigerian context
- [ ] Enhanced analytics dashboard
- [ ] Nigerian theme refinements
- [ ] Mobile responsiveness testing

---

## Success Metrics

### Player Engagement
- Profile completion rate
- Training program starts/completions
- Stats upload frequency
- Daily active users
- Session duration

### Business Metrics
- Free to Pro conversion rate
- Pro to Elite upgrade rate
- Trial completion rate
- Subscription retention
- Churn rate

### Content Metrics
- Most popular training programs
- Most accessed nutrition plans
- Injury prevention module usage
- League stats page views

---

## Future Enhancements (Post-MVP)

1. **Mobile Apps**: Native iOS and Android applications
2. **Coach Portal**: Coaches can create and publish programs
3. **Team Features**: Club/team management tools
4. **Live Classes**: Virtual training sessions
5. **Marketplace**: Equipment and merchandise shop
6. **Scouting**: Limited scout access for talent discovery
7. **Certifications**: Digital certificates for completed programs
8. **Competitions**: In-app challenges and leaderboards
9. **Video Analysis**: Upload and analyze match footage
10. **AI Recommendations**: Machine learning-powered training suggestions

---

## Getting Started

### Prerequisites
```bash
Node.js 18+
npm or yarn
```

### Installation
```bash
npm install
npm run dev
```

### Development
- Development server: http://localhost:9002
- Dark mode by default
- Hot reload enabled

---

## Key Differentiators

- **Nigerian-first approach**: Everything designed for local context
- **Comprehensive services**: Training, nutrition, injury prevention in one platform
- **Local food integration**: Nutrition plans with accessible Nigerian ingredients
- **NPFL statistics**: Showcase home-based league talent
- **Affordable pricing**: ₦5,000/month for professional development
- **Climate-aware**: Training programs adapted for hot weather
- **Community-driven**: Players upload and track their own stats

---

## Contact & Support

- **Email**: support@mcballer.ng
- **Phone**: +234 XXX XXXX XXX
- **Address**: Lagos, Nigeria

---

**Last Updated**: January 2025  
**Version**: 2.0 (Platform Revamp)
