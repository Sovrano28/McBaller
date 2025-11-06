import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Hash a default password for all users
  const defaultPassword = await bcrypt.hash("password123", 10);

  // Create Organizations from unique clubs
  const uniqueClubs = [
    "Enyimba FC",
    "Kano Pillars FC",
    "Shooting Stars SC",
    "Kaduna United FC",
    "Rangers International FC",
    "Nasarawa Amazons",
    "Heartland FC",
    "Remo Stars FC",
    "Bayelsa Queens",
    "Lobi Stars FC",
    "Abia Warriors FC",
    "Rivers Angels FC",
    "Akwa United FC",
  ];

  const organizationsMap = new Map<string, string>();

  for (const clubName of uniqueClubs) {
    const slug = clubName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/fc$/g, "");
    const orgType =
      clubName.includes("Queens") ||
      clubName.includes("Amazons") ||
      clubName.includes("Angels")
        ? "club"
        : clubName.includes("United")
        ? "club"
        : "club";

    const org = await prisma.organization.upsert({
      where: { slug },
      update: {
        email: `${slug.replace(/-/g, "")}@mcsportng.test`,
      },
      create: {
        name: clubName,
        slug,
        type: orgType,
        email: `${slug.replace(/-/g, "")}@mcsportng.test`,
        phone: "+2348012345678",
        description: `${clubName} - Nigerian Professional Football Club`,
      },
    });

    organizationsMap.set(clubName, org.id);
  }

  // Players data from mock-data.ts
  const playersData = [
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
      socialMedia: { instagram: "@chukwuemeka_okonkwo", twitter: "@cokonkwo9" },
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
      socialMedia: { instagram: "@aminahassan10", facebook: "aminahassan10" },
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

  // Create Users and Players
  for (const playerData of playersData) {
    // Create User first
    const user = await prisma.user.upsert({
      where: { email: playerData.email },
      update: {},
      create: {
        email: playerData.email,
        passwordHash: defaultPassword,
        role: "player",
      },
    });

    // Get organization ID if club exists
    const organizationId = organizationsMap.get(playerData.currentClub) || null;

    // Create Player
    const player = await prisma.player.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: playerData.name,
        username: playerData.username,
        phone: playerData.phone,
        avatar: playerData.avatar,
        dateOfBirth: playerData.dateOfBirth
          ? new Date(playerData.dateOfBirth)
          : null,
        state: playerData.state,
        currentLocation: playerData.currentLocation,
        position: playerData.position,
        preferredFoot: playerData.preferredFoot,
        height: playerData.height,
        weight: playerData.weight,
        bio: playerData.bio,
        socialMedia: playerData.socialMedia || null,
        subscriptionTier: playerData.subscriptionTier,
        subscriptionExpiry: playerData.subscriptionExpiry
          ? new Date(playerData.subscriptionExpiry)
          : null,
        trialUsed: playerData.trialUsed,
        trainingCompleted: playerData.trainingCompleted || [],
        badges: playerData.badges || [],
        joinedAt: new Date(playerData.joinedAt),
        organizationId,
      },
    });

    // Create League Stats
    for (const stat of playerData.leagueStats) {
      const existing = await prisma.leagueStat.findFirst({
        where: {
          playerId: player.id,
          season: stat.season,
          club: stat.club,
        },
      });

      if (!existing) {
        await prisma.leagueStat.create({
          data: {
            playerId: player.id,
            season: stat.season,
            club: stat.club,
            appearances: stat.appearances,
            goals: stat.goals,
            assists: stat.assists,
            yellowCards: stat.yellowCards,
            redCards: stat.redCards,
            verified: stat.verified,
          },
        });
      }
    }
  }

  // Create Posts
  const postsData = [
    {
      playerEmail: "chukwuemeka@test.com",
      content:
        "What a match! Incredible atmosphere at the Enyimba Stadium today. Three points in the bag! On to the next one! ⚽💚 #NPFL #EnyimbaFC",
      mediaType: "image",
      mediaUrl: "https://picsum.photos/seed/post1/600/400",
      likes: 342,
      comments: 28,
    },
    {
      playerEmail: "amina@test.com",
      content:
        "Morning training session done! Working on my passing accuracy with Coach Usman. The heat is intense but we push through! 💪🔥 #McSportngTraining",
      mediaType: null,
      mediaUrl: null,
      likes: 218,
      comments: 15,
    },
    {
      playerEmail: "fatima@test.com",
      content:
        "Proud to be named Player of the Match! Hat-trick today against Rivers United. Glory to God! 🙏⚽⚽⚽ #SuperFalcons #NasarawaAmazons",
      mediaType: "image",
      mediaUrl: "https://picsum.photos/seed/post3/600/500",
      likes: 567,
      comments: 43,
    },
    {
      playerEmail: "oluwa@test.com",
      content:
        "Great session with the boys. Perfecting our defensive shape before the big match this weekend. #3GBShooting",
      mediaType: null,
      mediaUrl: null,
      likes: 195,
      comments: 12,
    },
    {
      playerEmail: "emeka@test.com",
      content:
        'Just completed the "Midfield Maestro" training program on McSportng! My passing stats have improved significantly. Highly recommend! 📊💯',
      mediaType: null,
      mediaUrl: null,
      likes: 428,
      comments: 31,
    },
  ];

  for (const postData of postsData) {
    const user = await prisma.user.findUnique({
      where: { email: postData.playerEmail },
      include: { player: true },
    });

    if (user?.player) {
      await prisma.post.create({
        data: {
          playerId: user.player.id,
          content: postData.content,
          mediaType: postData.mediaType,
          mediaUrl: postData.mediaUrl,
          likes: postData.likes,
          comments: postData.comments,
          createdAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ), // Random date within last week
        },
      });
    }
  }

  // Create Teams for Organizations
  console.log("\n📋 Creating teams for organizations...");
  const teamsCreated: string[] = [];
  
  for (const [clubName, orgId] of organizationsMap.entries()) {
    // Create main team for each organization
    const teamSlug = clubName.toLowerCase().replace(/\s+/g, "-").replace(/fc$/g, "");
    const team = await prisma.team.upsert({
      where: {
        organizationId_slug: {
          organizationId: orgId,
          slug: teamSlug,
        },
      },
      update: {},
      create: {
        organizationId: orgId,
        name: clubName,
        slug: teamSlug,
        description: `First team of ${clubName}`,
      },
    });
    teamsCreated.push(team.id);
    
    // Create admin user for organization
    const adminEmail = `${teamSlug.replace(/-/g, "")}@mcballer.test`;
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        passwordHash: defaultPassword,
        role: "org_admin",
        organizationId: orgId,
      },
    });
  }
  
  // Create Agent Organizations
  console.log("\n👔 Creating agent organizations...");
  const agents = [
    { name: "Nigerian Football Agents", slug: "nigerian-football-agents", email: "info@nigerianagents.com" },
    { name: "West Africa Sports Management", slug: "west-africa-sports", email: "contact@westafricasports.com" },
    { name: "Elite Player Management", slug: "elite-player-management", email: "hello@eliteplayers.com" },
  ];
  
  const agentsMap = new Map<string, string>();
  for (const agent of agents) {
    const org = await prisma.organization.upsert({
      where: { slug: agent.slug },
      update: {},
      create: {
        name: agent.name,
        slug: agent.slug,
        type: "agent",
        email: agent.email,
        phone: "+2348012345678",
        description: `${agent.name} - Professional football agency representing Nigerian players`,
      },
    });
    agentsMap.set(agent.name, org.id);
    
    // Create admin user for agent
    const agentAdmin = await prisma.user.upsert({
      where: { email: agent.email },
      update: {},
      create: {
        email: agent.email,
        passwordHash: defaultPassword,
        role: "org_admin",
        organizationId: org.id,
      },
    });
  }
  
  // Assign some players to teams
  console.log("\n⚽ Assigning players to teams...");
  let assignedCount = 0;
  for (const playerData of playersData) {
    const orgId = organizationsMap.get(playerData.currentClub);
    if (orgId) {
      const team = await prisma.team.findFirst({
        where: { organizationId: orgId },
      });
      if (team) {
        const user = await prisma.user.findUnique({
          where: { email: playerData.email },
          include: { player: true },
        });
        if (user?.player) {
          await prisma.player.update({
            where: { id: user.player.id },
            data: { teamId: team.id },
          });
          assignedCount++;
        }
      }
    }
  }

  console.log("\n✅ Seed completed successfully!");
  console.log(`   - Created ${organizationsMap.size} club organizations`);
  console.log(`   - Created ${agentsMap.size} agent organizations`);
  console.log(`   - Created ${teamsCreated.length} teams`);
  console.log(`   - Created ${playersData.length} players with their stats`);
  console.log(`   - Assigned ${assignedCount} players to teams`);
  console.log(`   - Created ${postsData.length} posts`);
  console.log(`   - Created admin users for all organizations`);
  console.log("\n📝 Login credentials:");
  console.log(`   - Players: Use any player email (e.g., chukwuemeka@test.com) with password: password123`);
  console.log(`   - Organizations: Use org email (e.g., enyimba@mcballer.test) with password: password123`);
  console.log(`   - Agents: Use agent email (e.g., info@nigerianagents.com) with password: password123`);
}

main()
  .catch(e => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
