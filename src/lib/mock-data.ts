export type SubscriptionTier = "free" | "pro" | "elite";

export type LeagueStat = {
  season: string;
  club: string;
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  verified: boolean;
};

export type Player = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  dateOfBirth: string;
  state: string;
  currentLocation: string;
  position: "Goalkeeper" | "Defender" | "Midfielder" | "Forward";
  currentClub: string;
  preferredFoot?: "Left" | "Right" | "Both";
  height?: number;
  weight?: number;
  stats: {
    goals: number;
    assists: number;
    tackles: number;
  };
  leagueStats: LeagueStat[];
  bio: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry?: string;
  trialUsed: boolean;
  trainingCompleted: string[];
  badges: string[];
  joinedAt: string;
};

export type Post = {
  id: string;
  player: Player;
  content: string;
  media?: {
    type: "image" | "video";
    url: string;
    hint: string;
  };
  likes: number;
  comments: number;
  createdAt: string;
};

export type TrainingProgram = {
  id: string;
  title: string;
  description: string;
  category: "Technical" | "Physical" | "Tactical" | "Goalkeeper";
  position?: "Goalkeeper" | "Defender" | "Midfielder" | "Forward";
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  requiredTier: SubscriptionTier;
  author: string;
  authorTitle: string;
  image: { url: string; hint: string };
  prerequisites?: string[];
  equipment?: string[];
  isFree?: boolean;
};

export type NutritionPlan = {
  id: string;
  title: string;
  description: string;
  category: "Pre-match" | "Post-workout" | "Hydration" | "General" | "Ramadan";
  requiredTier: SubscriptionTier;
  image: { url: string; hint: string };
  meals: {
    mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
    name: string;
    nigerianFoods: string[];
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }[];
};

export type InjuryPrevention = {
  id: string;
  title: string;
  description: string;
  type: "Warm-up" | "Stretching" | "Strengthening" | "Recovery";
  position?: "Goalkeeper" | "Defender" | "Midfielder" | "Forward" | "All";
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  requiredTier: SubscriptionTier;
  image: { url: string; hint: string };
};

// Nigerian Players (Home-based NPFL Players)
export const players: Player[] = [
  {
    id: "1",
    name: "Chukwuemeka Okonkwo",
    username: "chukwuemeka_okonkwo",
    email: "chukwuemeka@test.com",
    phone: "+2348012345678",
    avatar: "https://picsum.photos/seed/np1/100/100",
    dateOfBirth: "2002-03-15",
    state: "Lagos",
    currentLocation: "Aba, Abia State",
    position: "Forward",
    currentClub: "Enyimba FC",
    preferredFoot: "Right",
    height: 178,
    weight: 75,
    stats: { goals: 18, assists: 7, tackles: 12 },
    leagueStats: [
      {
        season: "2024",
        club: "Enyimba FC",
        appearances: 28,
        goals: 18,
        assists: 7,
        yellowCards: 3,
        redCards: 0,
        verified: true,
      },
      {
        season: "2023",
        club: "Enyimba FC",
        appearances: 25,
        goals: 14,
        assists: 5,
        yellowCards: 2,
        redCards: 0,
        verified: true,
      },
    ],
    bio: "Aggressive goal scorer with pace and clinical finishing. Rising star in the NPFL, known for my ability to score from any position.",
    socialMedia: {
      instagram: "@chukwuemeka_okonkwo",
      twitter: "@cokonkwo9",
    },
    subscriptionTier: "pro",
    subscriptionExpiry: "2025-12-31",
    trialUsed: true,
    trainingCompleted: ["1", "3", "5"],
    badges: ["first_goal", "complete_profile", "week_streak"],
    joinedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Amina Hassan",
    username: "amina_hassan",
    email: "amina@test.com",
    phone: "+2348123456789",
    avatar: "https://picsum.photos/seed/np2/100/100",
    dateOfBirth: "2005-07-22",
    state: "Kano",
    currentLocation: "Kano",
    position: "Midfielder",
    currentClub: "Kano Pillars FC",
    preferredFoot: "Both",
    height: 165,
    weight: 58,
    stats: { goals: 8, assists: 15, tackles: 42 },
    leagueStats: [
      {
        season: "2024",
        club: "Kano Pillars FC",
        appearances: 24,
        goals: 8,
        assists: 15,
        yellowCards: 4,
        redCards: 0,
        verified: true,
      },
    ],
    bio: "Technical playmaker with excellent vision and passing ability. First female player to feature prominently in NPFL discussions.",
    socialMedia: {
      instagram: "@aminahassan10",
      facebook: "aminahassan10",
    },
    subscriptionTier: "elite",
    subscriptionExpiry: "2025-06-30",
    trialUsed: true,
    trainingCompleted: ["2", "4", "6", "7"],
    badges: ["complete_profile", "month_streak", "elite_member"],
    joinedAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Oluwaseun Adebayo",
    username: "oluwa_adebayo",
    email: "oluwa@test.com",
    phone: "+2348098765432",
    avatar: "https://picsum.photos/seed/np3/100/100",
    dateOfBirth: "2000-11-08",
    state: "Oyo",
    currentLocation: "Ibadan, Oyo State",
    position: "Defender",
    currentClub: "Shooting Stars SC",
    preferredFoot: "Right",
    height: 185,
    weight: 82,
    stats: { goals: 3, assists: 4, tackles: 78 },
    leagueStats: [
      {
        season: "2024",
        club: "Shooting Stars SC",
        appearances: 30,
        goals: 3,
        assists: 4,
        yellowCards: 8,
        redCards: 1,
        verified: true,
      },
      {
        season: "2023",
        club: "Shooting Stars SC",
        appearances: 28,
        goals: 2,
        assists: 3,
        yellowCards: 6,
        redCards: 0,
        verified: true,
      },
    ],
    bio: "Defensive leader with strong aerial ability and tactical awareness. Captain of Shooting Stars SC.",
    subscriptionTier: "pro",
    subscriptionExpiry: "2025-11-15",
    trialUsed: true,
    trainingCompleted: ["1", "2"],
    badges: ["complete_profile", "defensive_rock"],
    joinedAt: "2024-03-10",
  },
  {
    id: "4",
    name: "Ibrahim Musa",
    username: "ibrahim_musa",
    email: "ibrahim@test.com",
    phone: "+2347012345678",
    avatar: "https://picsum.photos/seed/np4/100/100",
    dateOfBirth: "2006-05-19",
    state: "Kaduna",
    currentLocation: "Kaduna",
    position: "Forward",
    currentClub: "Kaduna United FC",
    preferredFoot: "Left",
    height: 172,
    weight: 68,
    stats: { goals: 12, assists: 9, tackles: 8 },
    leagueStats: [
      {
        season: "2024",
        club: "Kaduna United FC",
        appearances: 20,
        goals: 12,
        assists: 9,
        yellowCards: 2,
        redCards: 0,
        verified: false,
      },
    ],
    bio: "Speed merchant with incredible pace and dribbling skills. Young talent making waves in the NPFL.",
    subscriptionTier: "free",
    trialUsed: false,
    trainingCompleted: [],
    badges: ["first_upload"],
    joinedAt: "2024-10-05",
  },
  {
    id: "5",
    name: "Blessing Nwosu",
    username: "blessing_nwosu",
    email: "blessing@test.com",
    phone: "+2348187654321",
    avatar: "https://picsum.photos/seed/np5/100/100",
    dateOfBirth: "2002-09-12",
    state: "Anambra",
    currentLocation: "Enugu",
    position: "Goalkeeper",
    currentClub: "Rangers International FC",
    preferredFoot: "Right",
    height: 188,
    weight: 85,
    stats: { goals: 0, assists: 0, tackles: 0 },
    leagueStats: [
      {
        season: "2024",
        club: "Rangers International FC",
        appearances: 32,
        goals: 0,
        assists: 0,
        yellowCards: 1,
        redCards: 0,
        verified: true,
      },
    ],
    bio: "Shot-stopping specialist with excellent reflexes. Known for penalty saves and commanding presence in the box.",
    subscriptionTier: "pro",
    subscriptionExpiry: "2025-08-20",
    trialUsed: true,
    trainingCompleted: ["8", "9"],
    badges: ["complete_profile", "goalkeeper_master"],
    joinedAt: "2024-01-25",
  },
  {
    id: "6",
    name: "Emeka Okoli",
    username: "emeka_okoli",
    email: "emeka@test.com",
    phone: "+2348076543210",
    avatar: "https://picsum.photos/seed/np6/100/100",
    dateOfBirth: "1998-02-28",
    state: "Enugu",
    currentLocation: "Enugu",
    position: "Midfielder",
    currentClub: "Rangers International FC",
    preferredFoot: "Right",
    height: 180,
    weight: 76,
    stats: { goals: 4, assists: 8, tackles: 65 },
    leagueStats: [
      {
        season: "2024",
        club: "Rangers International FC",
        appearances: 29,
        goals: 4,
        assists: 8,
        yellowCards: 7,
        redCards: 0,
        verified: true,
      },
    ],
    bio: "Experienced defensive midfielder, anchor of the team. Known for breaking up opposition attacks.",
    subscriptionTier: "elite",
    subscriptionExpiry: "2025-12-25",
    trialUsed: true,
    trainingCompleted: ["1", "2", "3", "4", "5"],
    badges: ["veteran", "complete_profile", "elite_member"],
    joinedAt: "2023-11-01",
  },
  {
    id: "7",
    name: "Fatima Bello",
    username: "fatima_bello",
    email: "fatima@test.com",
    phone: "+2349012345678",
    avatar: "https://picsum.photos/seed/np7/100/100",
    dateOfBirth: "2004-01-17",
    state: "Abuja",
    currentLocation: "Abuja",
    position: "Forward",
    currentClub: "Nasarawa Amazons",
    preferredFoot: "Left",
    height: 170,
    weight: 62,
    stats: { goals: 22, assists: 6, tackles: 10 },
    leagueStats: [
      {
        season: "2024",
        club: "Nasarawa Amazons",
        appearances: 26,
        goals: 22,
        assists: 6,
        yellowCards: 3,
        redCards: 0,
        verified: true,
      },
    ],
    bio: "Clinical finisher with deadly left foot. Top scorer in the women's league, aiming for Super Falcons call-up.",
    subscriptionTier: "pro",
    subscriptionExpiry: "2025-09-30",
    trialUsed: true,
    trainingCompleted: ["3", "5", "7"],
    badges: ["top_scorer", "complete_profile"],
    joinedAt: "2024-04-12",
  },
  {
    id: "8",
    name: "Chidinma Eze",
    username: "chidinma_eze",
    email: "chidinma@test.com",
    phone: "+2348154321098",
    avatar: "https://picsum.photos/seed/np8/100/100",
    dateOfBirth: "2001-06-30",
    state: "Imo",
    currentLocation: "Owerri, Imo State",
    position: "Defender",
    currentClub: "Heartland FC",
    preferredFoot: "Right",
    height: 175,
    weight: 70,
    stats: { goals: 5, assists: 7, tackles: 55 },
    leagueStats: [
      {
        season: "2024",
        club: "Heartland FC",
        appearances: 27,
        goals: 5,
        assists: 7,
        yellowCards: 5,
        redCards: 0,
        verified: true,
      },
    ],
    bio: "Attacking full-back with overlapping runs and crossing ability. Modern defender who contributes in attack.",
    subscriptionTier: "free",
    trialUsed: true,
    trainingCompleted: ["1"],
    badges: ["complete_profile"],
    joinedAt: "2024-07-18",
  },
  {
    id: "9",
    name: "Abdullahi Yusuf",
    username: "abdullahi_yusuf",
    email: "abdullahi@test.com",
    phone: "+2347098765432",
    avatar: "https://picsum.photos/seed/np9/100/100",
    dateOfBirth: "2007-12-03",
    state: "Sokoto",
    currentLocation: "Sokoto",
    position: "Midfielder",
    currentClub: "Remo Stars FC",
    preferredFoot: "Right",
    height: 168,
    weight: 65,
    stats: { goals: 6, assists: 12, tackles: 28 },
    leagueStats: [
      {
        season: "2024",
        club: "Remo Stars FC",
        appearances: 18,
        goals: 6,
        assists: 12,
        yellowCards: 2,
        redCards: 0,
        verified: false,
      },
    ],
    bio: "Youth prospect with creative flair and technical ability. Future star of Nigerian football.",
    subscriptionTier: "free",
    trialUsed: false,
    trainingCompleted: [],
    badges: [],
    joinedAt: "2024-09-22",
  },
  {
    id: "10",
    name: "Ngozi Okafor",
    username: "ngozi_okafor",
    email: "ngozi@test.com",
    phone: "+2348176543210",
    avatar: "https://picsum.photos/seed/np10/100/100",
    dateOfBirth: "1999-04-25",
    state: "Delta",
    currentLocation: "Warri, Delta State",
    position: "Defender",
    currentClub: "Bayelsa Queens",
    preferredFoot: "Right",
    height: 176,
    weight: 72,
    stats: { goals: 2, assists: 3, tackles: 82 },
    leagueStats: [
      {
        season: "2024",
        club: "Bayelsa Queens",
        appearances: 31,
        goals: 2,
        assists: 3,
        yellowCards: 6,
        redCards: 0,
        verified: true,
      },
    ],
    bio: "Captain material with leadership qualities. Strong center-back and Super Falcons regular.",
    subscriptionTier: "elite",
    subscriptionExpiry: "2026-01-15",
    trialUsed: true,
    trainingCompleted: ["1", "2", "4", "6", "8"],
    badges: ["captain", "elite_member", "complete_profile"],
    joinedAt: "2023-12-05",
  },
  {
    id: "11",
    name: "Tunde Bakare",
    username: "tunde_bakare",
    email: "tunde@test.com",
    phone: "+2348087654321",
    avatar: "https://picsum.photos/seed/np11/100/100",
    dateOfBirth: "1997-08-14",
    state: "Osun",
    currentLocation: "Ikenne, Ogun State",
    position: "Forward",
    currentClub: "Remo Stars FC",
    preferredFoot: "Right",
    height: 182,
    weight: 79,
    stats: { goals: 15, assists: 5, tackles: 11 },
    leagueStats: [
      {
        season: "2024",
        club: "Remo Stars FC",
        appearances: 28,
        goals: 15,
        assists: 5,
        yellowCards: 4,
        redCards: 0,
        verified: true,
      },
    ],
    bio: "Veteran goal scorer with experience across multiple NPFL clubs. Known for positioning and finishing.",
    subscriptionTier: "pro",
    subscriptionExpiry: "2025-10-10",
    trialUsed: true,
    trainingCompleted: ["3", "5"],
    badges: ["veteran", "complete_profile"],
    joinedAt: "2023-10-20",
  },
  {
    id: "12",
    name: "Aisha Mohammed",
    username: "aisha_mohammed",
    email: "aisha@test.com",
    phone: "+2349087654321",
    avatar: "https://picsum.photos/seed/np12/100/100",
    dateOfBirth: "2003-10-11",
    state: "Borno",
    currentLocation: "Maiduguri, Borno State",
    position: "Midfielder",
    currentClub: "Lobi Stars FC",
    preferredFoot: "Both",
    height: 169,
    weight: 64,
    stats: { goals: 7, assists: 10, tackles: 48 },
    leagueStats: [
      {
        season: "2024",
        club: "Lobi Stars FC",
        appearances: 25,
        goals: 7,
        assists: 10,
        yellowCards: 5,
        redCards: 0,
        verified: true,
      },
    ],
    bio: "Box-to-box midfielder with endless energy. Covers every blade of grass on the pitch.",
    subscriptionTier: "pro",
    subscriptionExpiry: "2025-07-25",
    trialUsed: true,
    trainingCompleted: ["2", "4", "6"],
    badges: ["complete_profile", "workhorse"],
    joinedAt: "2024-05-08",
  },
  {
    id: "13",
    name: "Ikenna Nnamdi",
    username: "ikenna_nnamdi",
    email: "ikenna@test.com",
    phone: "+2348165432109",
    avatar: "https://picsum.photos/seed/np13/100/100",
    dateOfBirth: "2005-03-27",
    state: "Abia",
    currentLocation: "Umuahia, Abia State",
    position: "Forward",
    currentClub: "Abia Warriors FC",
    preferredFoot: "Right",
    height: 174,
    weight: 70,
    stats: { goals: 10, assists: 8, tackles: 9 },
    leagueStats: [
      {
        season: "2024",
        club: "Abia Warriors FC",
        appearances: 22,
        goals: 10,
        assists: 8,
        yellowCards: 3,
        redCards: 0,
        verified: false,
      },
    ],
    bio: "Tricky winger with exceptional dribbling. Loves taking on defenders one-on-one.",
    subscriptionTier: "free",
    trialUsed: false,
    trainingCompleted: [],
    badges: ["rising_star"],
    joinedAt: "2024-08-15",
  },
  {
    id: "14",
    name: "Sandra Okoro",
    username: "sandra_okoro",
    email: "sandra@test.com",
    phone: "+2348143210987",
    avatar: "https://picsum.photos/seed/np14/100/100",
    dateOfBirth: "2002-11-20",
    state: "Rivers",
    currentLocation: "Port Harcourt, Rivers State",
    position: "Goalkeeper",
    currentClub: "Rivers Angels FC",
    preferredFoot: "Right",
    height: 182,
    weight: 75,
    stats: { goals: 0, assists: 0, tackles: 0 },
    leagueStats: [
      {
        season: "2024",
        club: "Rivers Angels FC",
        appearances: 29,
        goals: 0,
        assists: 0,
        yellowCards: 2,
        redCards: 0,
        verified: true,
      },
    ],
    bio: "Agile goalkeeper with cat-like reflexes. Multiple clean sheets and penalty saves this season.",
    subscriptionTier: "pro",
    subscriptionExpiry: "2025-11-30",
    trialUsed: true,
    trainingCompleted: ["8", "9", "10"],
    badges: ["complete_profile", "goalkeeper_master", "clean_sheet_king"],
    joinedAt: "2024-02-14",
  },
  {
    id: "15",
    name: "Kingsley Udo",
    username: "kingsley_udo",
    email: "kingsley@test.com",
    phone: "+2348132109876",
    avatar: "https://picsum.photos/seed/np15/100/100",
    dateOfBirth: "2000-07-09",
    state: "Akwa Ibom",
    currentLocation: "Uyo, Akwa Ibom State",
    position: "Forward",
    currentClub: "Akwa United FC",
    preferredFoot: "Right",
    height: 186,
    weight: 84,
    stats: { goals: 13, assists: 4, tackles: 14 },
    leagueStats: [
      {
        season: "2024",
        club: "Akwa United FC",
        appearances: 26,
        goals: 13,
        assists: 4,
        yellowCards: 6,
        redCards: 1,
        verified: true,
      },
    ],
    bio: "Target man with physical presence and aerial dominance. Hold-up play specialist.",
    subscriptionTier: "pro",
    subscriptionExpiry: "2025-12-10",
    trialUsed: true,
    trainingCompleted: ["1", "3", "7"],
    badges: ["complete_profile", "aerial_threat"],
    joinedAt: "2024-03-22",
  },
];

export const posts: Post[] = [
  {
    id: "1",
    player: players[0],
    content:
      "What a match! Incredible atmosphere at the Enyimba Stadium today. Three points in the bag! On to the next one! ⚽💚 #NPFL #EnyimbaFC",
    media: {
      type: "image",
      url: "https://picsum.photos/seed/post1/600/400",
      hint: "soccer goal celebration",
    },
    likes: 342,
    comments: 28,
    createdAt: "2h ago",
  },
  {
    id: "2",
    player: players[1],
    content:
      "Morning training session done! Working on my passing accuracy with Coach Usman. The heat is intense but we push through! 💪🔥 #McBallerTraining",
    likes: 218,
    comments: 15,
    createdAt: "5h ago",
  },
  {
    id: "3",
    player: players[6],
    content:
      "Proud to be named Player of the Match! Hat-trick today against Rivers United. Glory to God! 🙏⚽⚽⚽ #SuperFalcons #NasarawaAmazons",
    media: {
      type: "image",
      url: "https://picsum.photos/seed/post3/600/500",
      hint: "female soccer player celebrating",
    },
    likes: 567,
    comments: 43,
    createdAt: "1d ago",
  },
  {
    id: "4",
    player: players[2],
    content:
      "Great session with the boys. Perfecting our defensive shape before the big match this weekend. #3GBShooting",
    likes: 195,
    comments: 12,
    createdAt: "2d ago",
  },
  {
    id: "5",
    player: players[5],
    content:
      'Just completed the "Midfield Maestro" training program on McBaller! My passing stats have improved significantly. Highly recommend! 📊💯',
    likes: 428,
    comments: 31,
    createdAt: "3d ago",
  },
];

export const trainingPlans: TrainingProgram[] = [
  {
    id: "1",
    title: "Speed & Agility for Nigerian Climate",
    description:
      "A 6-week program designed to build explosive speed and agility while managing the hot Nigerian weather. Includes hydration strategies and optimal training times.",
    category: "Physical",
    duration: "6-week",
    difficulty: "Intermediate",
    requiredTier: "pro",
    author: "Coach Adebayo Lawal",
    authorTitle: "CAF License A Coach",
    image: {
      url: "https://picsum.photos/seed/train1/400/250",
      hint: "soccer speed training",
    },
    equipment: ["Cones", "Resistance bands", "Stopwatch"],
    isFree: false,
  },
  {
    id: "2",
    title: "Ball Control Mastery",
    description:
      "Master first touch, close control, and dribbling in tight spaces. Perfect for Nigerian league conditions with limited space.",
    category: "Technical",
    duration: "4-week",
    difficulty: "Beginner",
    requiredTier: "free",
    author: "Coach Emmanuel Okocha",
    authorTitle: "Former NPFL Player",
    image: {
      url: "https://picsum.photos/seed/train2/400/250",
      hint: "soccer ball control",
    },
    equipment: ["Football", "Wall or rebounder"],
    isFree: true,
  },
  {
    id: "3",
    title: "Finishing Like Osimhen",
    description:
      "Learn finishing techniques from analyzing Victor Osimhen's movement and shooting. Become clinical in front of goal.",
    category: "Technical",
    position: "Forward",
    duration: "8-week",
    difficulty: "Advanced",
    requiredTier: "pro",
    author: "Coach Chidi Nwankwo",
    authorTitle: "UEFA B Licensed Coach",
    image: {
      url: "https://picsum.photos/seed/train3/400/250",
      hint: "soccer shooting practice",
    },
    equipment: ["Football", "Goal", "Cones"],
    isFree: false,
  },
  {
    id: "4",
    title: "Midfield Maestro Masterclass",
    description:
      "Improve your passing range, vision, and ball control under pressure. Dominate the middle of the park.",
    category: "Technical",
    position: "Midfielder",
    duration: "6-week",
    difficulty: "Intermediate",
    requiredTier: "pro",
    author: "Coach Nosa Igiebor",
    authorTitle: "Former Super Eagles Midfielder",
    image: {
      url: "https://picsum.photos/seed/train4/400/250",
      hint: "soccer passing practice",
    },
    equipment: ["Football", "Cones", "Training partner"],
    isFree: false,
  },
  {
    id: "5",
    title: "Defensive Wall Fundamentals",
    description:
      "Master tackling, positioning, and reading the game. Become the rock your team needs at the back.",
    category: "Tactical",
    position: "Defender",
    duration: "6-week",
    difficulty: "Beginner",
    requiredTier: "free",
    author: "Coach Taribo West",
    authorTitle: "Former Super Eagles Defender",
    image: {
      url: "https://picsum.photos/seed/train5/400/250",
      hint: "soccer defending",
    },
    equipment: ["Cones", "Training partner"],
    isFree: true,
  },
  {
    id: "6",
    title: "Goalkeeper Command & Presence",
    description:
      "Develop shot-stopping, positioning, and commanding your area. Includes distribution techniques.",
    category: "Goalkeeper",
    position: "Goalkeeper",
    duration: "8-week",
    difficulty: "Intermediate",
    requiredTier: "pro",
    author: "Coach Vincent Enyeama",
    authorTitle: "Super Eagles Legend",
    image: {
      url: "https://picsum.photos/seed/train6/400/250",
      hint: "goalkeeper training",
    },
    equipment: ["Gloves", "Goal", "Balls"],
    isFree: false,
  },
  {
    id: "7",
    title: "Tactical Intelligence Builder",
    description:
      "Understand formations, positioning, and game reading. Learn to think like a coach on the field.",
    category: "Tactical",
    duration: "4-week",
    difficulty: "Advanced",
    requiredTier: "elite",
    author: "Coach Stephen Keshi",
    authorTitle: "AFCON Winning Coach",
    image: {
      url: "https://picsum.photos/seed/train7/400/250",
      hint: "soccer tactics board",
    },
    prerequisites: ["Basic tactical knowledge"],
    isFree: false,
  },
  {
    id: "8",
    title: "First Touch Perfection",
    description:
      "Perfect your first touch in all situations. Essential skill for every position.",
    category: "Technical",
    duration: "2-week",
    difficulty: "Beginner",
    requiredTier: "free",
    author: "Coach Austin Eguavoen",
    authorTitle: "Super Eagles Interim Coach",
    image: {
      url: "https://picsum.photos/seed/train8/400/250",
      hint: "soccer first touch",
    },
    equipment: ["Football", "Wall"],
    isFree: true,
  },
  {
    id: "9",
    title: "Wing Play & Crossing Under Pressure",
    description:
      "Develop elite wing play: 1v1s, pace control, and accurate crossing despite heat and dry pitches.",
    category: "Technical",
    position: "Midfielder",
    duration: "4-week",
    difficulty: "Intermediate",
    requiredTier: "pro",
    author: "Coach Peter Rufai",
    authorTitle: "CAF License B Coach",
    image: {
      url: "https://picsum.photos/seed/train9/400/250",
      hint: "soccer crossing drill",
    },
    equipment: ["Footballs", "Mannequins", "Cones"],
  },
  {
    id: "10",
    title: "Heat-Ready Endurance Builder",
    description:
      "Conditioning blocks tailored for Nigerian weather: interval runs, tempo repeats, hydration timing.",
    category: "Physical",
    duration: "8-week",
    difficulty: "Intermediate",
    requiredTier: "pro",
    author: "Coach Sani Musa",
    authorTitle: "Strength & Conditioning Coach",
    image: {
      url: "https://picsum.photos/seed/train10/400/250",
      hint: "endurance running",
    },
    equipment: ["Track/Field", "Timer", "Electrolytes"],
  },
  {
    id: "11",
    title: "Pressing & Counter-Press Basics",
    description:
      "Team pressing triggers, 5-second counter-press rules, and compact shape maintenance.",
    category: "Tactical",
    duration: "4-week",
    difficulty: "Beginner",
    requiredTier: "free",
    author: "Coach Ifeanyi Udeze",
    authorTitle: "NPFL Assistant Coach",
    image: {
      url: "https://picsum.photos/seed/train11/400/250",
      hint: "pressing tactic board",
    },
    prerequisites: ["Basic fitness"],
  },
  {
    id: "12",
    title: "Set-Piece Mastery (Nigeria Edition)",
    description:
      "Corners, free-kicks, and long throws adapted for NPFL match conditions and officiating tendencies.",
    category: "Tactical",
    duration: "6-week",
    difficulty: "Advanced",
    requiredTier: "elite",
    author: "Coach Sunday Mba",
    authorTitle: "AFCON Hero, Specialist Coach",
    image: {
      url: "https://picsum.photos/seed/train12/400/250",
      hint: "set piece training",
    },
    equipment: ["Walls", "Markers", "Video"],
  },
  {
    id: "13",
    title: "Ball Winning for Midfield Destroyers",
    description:
      "Tackling angles, body shape, and duel timing for CDMs in fast transitions.",
    category: "Technical",
    position: "Midfielder",
    duration: "4-week",
    difficulty: "Intermediate",
    requiredTier: "pro",
    author: "Coach Wilfred Ndidi",
    authorTitle: "Guest Program",
    image: {
      url: "https://picsum.photos/seed/train13/400/250",
      hint: "tackling drill",
    },
    equipment: ["Cones", "Partner"],
  },
  {
    id: "14",
    title: "Composure in the Box",
    description:
      "Finishing under pressure, scanning habits, first-touch finishing in tight NPFL penalty areas.",
    category: "Technical",
    position: "Forward",
    duration: "2-week",
    difficulty: "Beginner",
    requiredTier: "free",
    author: "Coach Daniel Amokachi",
    authorTitle: "Super Eagles Legend",
    image: {
      url: "https://picsum.photos/seed/train14/400/250",
      hint: "finishing drill box",
    },
  },
  {
    id: "15",
    title: "Sweeper Keeper Distribution",
    description:
      "Modern GK footwork, passing lanes, and launch accuracy for quick counterattacks.",
    category: "Goalkeeper",
    position: "Goalkeeper",
    duration: "4-week",
    difficulty: "Intermediate",
    requiredTier: "pro",
    author: "Coach Ike Shorunmu",
    authorTitle: "GK Coach",
    image: {
      url: "https://picsum.photos/seed/train15/400/250",
      hint: "goalkeeper passing",
    },
  },
  {
    id: "16",
    title: "Back Three Defensive Cohesion",
    description:
      "Communication, cover-shadow, and line shifting for 3-5-2 and 3-4-3 systems.",
    category: "Tactical",
    position: "Defender",
    duration: "8-week",
    difficulty: "Advanced",
    requiredTier: "elite",
    author: "Coach Joseph Yobo",
    authorTitle: "Assistant Coach, Super Eagles",
    image: {
      url: "https://picsum.photos/seed/train16/400/250",
      hint: "back three defending",
    },
  },
  {
    id: "17",
    title: "Street-to-Pro Technical Upgrade",
    description:
      "Convert street skills to professional efficiency: decision speed, scanning, and end product.",
    category: "Technical",
    duration: "6-week",
    difficulty: "Intermediate",
    requiredTier: "pro",
    author: "Coach Finidi George",
    authorTitle: "NPFL Head Coach",
    image: {
      url: "https://picsum.photos/seed/train17/400/250",
      hint: "street football drill",
    },
  },
  {
    id: "18",
    title: "Explosive Acceleration & First 5 Steps",
    description:
      "Micro-sprint mechanics, ankle stiffness, and resisted starts to win short races.",
    category: "Physical",
    duration: "4-week",
    difficulty: "Beginner",
    requiredTier: "free",
    author: "Coach Blessing Okagbare",
    authorTitle: "Speed Consultant",
    image: {
      url: "https://picsum.photos/seed/train18/400/250",
      hint: "acceleration sprint",
    },
  },
  {
    id: "19",
    title: "Creative Playmaking in Tight Spaces",
    description:
      "Rondo progressions, third-man runs, and disguise passes used in NPFL mid-blocks.",
    category: "Technical",
    position: "Midfielder",
    duration: "8-week",
    difficulty: "Advanced",
    requiredTier: "pro",
    author: "Coach Austin Okocha",
    authorTitle: "Creative Consultant",
    image: {
      url: "https://picsum.photos/seed/train19/400/250",
      hint: "rondo drill",
    },
  },
  {
    id: "20",
    title: "Aerial Dominance for Centre-Backs",
    description:
      "Jump mechanics, timing, and body use to win duels without fouls.",
    category: "Physical",
    position: "Defender",
    duration: "6-week",
    difficulty: "Intermediate",
    requiredTier: "pro",
    author: "Coach Kenneth Omeruo",
    authorTitle: "Defensive Specialist",
    image: {
      url: "https://picsum.photos/seed/train20/400/250",
      hint: "aerial duels",
    },
  },
];

export const nutritionPlans: NutritionPlan[] = [
  {
    id: "1",
    title: "Match Day Power",
    description:
      "Optimal nutrition for peak performance on game day using accessible Nigerian foods.",
    category: "Pre-match",
    requiredTier: "pro",
    image: {
      url: "https://picsum.photos/seed/nutrition1/400/250",
      hint: "healthy nigerian meal",
    },
    meals: [
      {
        mealType: "Breakfast",
        name: "Power Breakfast",
        nigerianFoods: ["Oatmeal", "Banana", "Eggs", "Honey"],
        calories: 520,
        protein: 25,
        carbs: 68,
        fats: 15,
      },
      {
        mealType: "Lunch",
        name: "Pre-Match Fuel",
        nigerianFoods: [
          "Jollof Rice (brown rice)",
          "Grilled Chicken",
          "Plantain",
          "Vegetables",
        ],
        calories: 680,
        protein: 45,
        carbs: 85,
        fats: 18,
      },
    ],
  },
  {
    id: "2",
    title: "Recovery Nutrition",
    description:
      "Post-workout meals to help your body recover and build muscle.",
    category: "Post-workout",
    requiredTier: "pro",
    image: {
      url: "https://picsum.photos/seed/nutrition2/400/250",
      hint: "protein rich meal",
    },
    meals: [
      {
        mealType: "Snack",
        name: "Recovery Shake",
        nigerianFoods: ["Soya milk", "Banana", "Groundnut", "Dates"],
        calories: 350,
        protein: 20,
        carbs: 45,
        fats: 12,
      },
      {
        mealType: "Dinner",
        name: "Muscle Builder",
        nigerianFoods: ["Beans", "Fish", "Eba (moderate)", "Vegetable soup"],
        calories: 580,
        protein: 38,
        carbs: 65,
        fats: 16,
      },
    ],
  },
  {
    id: "3",
    title: "Hydration for Heat",
    description:
      "Stay hydrated in Nigerian climate with proper fluid and electrolyte strategies.",
    category: "Hydration",
    requiredTier: "free",
    image: {
      url: "https://picsum.photos/seed/nutrition3/400/250",
      hint: "water and fruits",
    },
    meals: [
      {
        mealType: "Snack",
        name: "Hydration Boost",
        nigerianFoods: ["Coconut water", "Watermelon", "Orange"],
        calories: 150,
        protein: 2,
        carbs: 38,
        fats: 0,
      },
    ],
  },
  {
    id: "4",
    title: "Ramadan Training Nutrition",
    description:
      "Special meal planning for Muslim athletes training during Ramadan fasting.",
    category: "Ramadan",
    requiredTier: "pro",
    image: {
      url: "https://picsum.photos/seed/nutrition4/400/250",
      hint: "ramadan iftar meal",
    },
    meals: [
      {
        mealType: "Breakfast",
        name: "Suhoor Power Meal",
        nigerianFoods: ["Pap (Akamu)", "Moi moi", "Dates", "Milk"],
        calories: 480,
        protein: 22,
        carbs: 72,
        fats: 12,
      },
      {
        mealType: "Dinner",
        name: "Iftar Recovery",
        nigerianFoods: ["Dates", "Water", "Rice", "Chicken", "Vegetables"],
        calories: 720,
        protein: 42,
        carbs: 88,
        fats: 20,
      },
    ],
  },
];

export const injuryPrevention: InjuryPrevention[] = [
  {
    id: "1",
    title: "10-Minute Dynamic Warm-up",
    description:
      "Quick but effective warm-up routine to prepare your body for training or matches. Reduces injury risk significantly.",
    type: "Warm-up",
    position: "All",
    duration: "10 minutes",
    difficulty: "Beginner",
    requiredTier: "free",
    image: {
      url: "https://picsum.photos/seed/injury1/400/250",
      hint: "soccer warm up",
    },
  },
  {
    id: "2",
    title: "Hamstring Protection Protocol",
    description:
      "Prevent the most common football injury with these targeted exercises and stretches.",
    type: "Strengthening",
    position: "All",
    duration: "15 minutes",
    difficulty: "Intermediate",
    requiredTier: "pro",
    image: {
      url: "https://picsum.photos/seed/injury2/400/250",
      hint: "hamstring stretch",
    },
  },
  {
    id: "3",
    title: "ACL Injury Prevention for Forwards",
    description:
      "Position-specific exercises to protect your ACL during quick direction changes and explosive movements.",
    type: "Strengthening",
    position: "Forward",
    duration: "20 minutes",
    difficulty: "Advanced",
    requiredTier: "pro",
    image: {
      url: "https://picsum.photos/seed/injury3/400/250",
      hint: "knee strengthening",
    },
  },
  {
    id: "4",
    title: "Post-Match Recovery Routine",
    description:
      "Essential recovery protocol to reduce muscle soreness and prepare for the next session.",
    type: "Recovery",
    position: "All",
    duration: "20 minutes",
    difficulty: "Beginner",
    requiredTier: "free",
    image: {
      url: "https://picsum.photos/seed/injury4/400/250",
      hint: "recovery stretching",
    },
  },
];

export const profileViewsData = [
  { date: "Mon", views: 45 },
  { date: "Tue", views: 62 },
  { date: "Wed", views: 58 },
  { date: "Thu", views: 78 },
  { date: "Fri", views: 125 },
  { date: "Sat", views: 182 },
  { date: "Sun", views: 156 },
];

export const videoWatchesData = [
  { name: "Goal Highlights", watches: 2850 },
  { name: "Training Clips", watches: 1420 },
  { name: "Match Recap", watches: 2150 },
];

// Nigerian States
export const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

// NPFL Clubs
export const npflClubs = [
  "Enyimba FC",
  "Rangers International FC",
  "Kano Pillars FC",
  "Rivers United FC",
  "Plateau United FC",
  "Lobi Stars FC",
  "Remo Stars FC",
  "Shooting Stars SC",
  "Kwara United FC",
  "Nasarawa United FC",
  "Akwa United FC",
  "Abia Warriors FC",
  "Heartland FC",
  "Niger Tornadoes FC",
  "Sunshine Stars FC",
  "Kaduna United FC",
  "Bayelsa United FC",
  "Wikki Tourists FC",
  "Doma United FC",
  "Gombe United FC",
  // Women's clubs
  "Bayelsa Queens",
  "Rivers Angels FC",
  "Nasarawa Amazons",
  "Edo Queens",
  "Delta Queens",
];
