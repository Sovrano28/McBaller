import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Nigerian names for players
const maleFirstNames = ["Chukwuemeka", "Oluwaseun", "Ibrahim", "Emeka", "Tunde", "Ikenna", "Kingsley", "Abdullahi", "Yusuf", "Adekunle", "Samuel", "Chijioke", "Obinna", "Kehinde", "Akinwale"];
const femaleFirstNames = ["Amina", "Blessing", "Fatima", "Chidinma", "Ngozi", "Sandra", "Aisha", "Funmilayo", "Zainab", "Adaobi", "Chiamaka", "Hauwa", "Tobi", "Ifunanya", "Maryam"];
const lastNames = ["Okonkwo", "Adebayo", "Musa", "Okoli", "Bakare", "Nnamdi", "Okoro", "Udo", "Bello", "Eze", "Yusuf", "Hassan", "Nwosu", "Mohammed", "Williams", "Okafor", "Adeleke", "Ajayi", "Idowu", "Chukwu"];

// Nigerian states
const nigerianStates = ["Lagos", "Kano", "Oyo", "Kaduna", "Enugu", "Abuja", "Rivers", "Abia", "Imo", "Akwa Ibom", "Delta", "Ogun", "Anambra", "Borno", "Sokoto"];

// Football positions
const positions = {
  goalkeeper: "Goalkeeper",
  defender: "Defender",
  midfielder: "Midfielder",
  forward: "Forward"
};

// Function to generate a random date of birth based on age category
function generateDOB(isU17: boolean): Date {
  const currentYear = new Date().getFullYear();
  if (isU17) {
    // U17: 15-16 years old
    const year = currentYear - 15 - Math.floor(Math.random() * 2);
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    return new Date(year, month, day);
  } else {
    // Senior: 18-30 years old
    const year = currentYear - 18 - Math.floor(Math.random() * 13);
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    return new Date(year, month, day);
  }
}

// Function to generate player stats
function generateStats(position: string) {
  if (position === "Goalkeeper") {
    return {
      goals: 0,
      assists: 0,
      tackles: 0,
      saves: Math.floor(Math.random() * 50) + 30,
      cleanSheets: Math.floor(Math.random() * 15)
    };
  } else if (position === "Defender") {
    return {
      goals: Math.floor(Math.random() * 5),
      assists: Math.floor(Math.random() * 8),
      tackles: Math.floor(Math.random() * 60) + 40,
      interceptions: Math.floor(Math.random() * 40) + 20
    };
  } else if (position === "Midfielder") {
    return {
      goals: Math.floor(Math.random() * 12) + 3,
      assists: Math.floor(Math.random() * 15) + 5,
      tackles: Math.floor(Math.random() * 50) + 20,
      keyPasses: Math.floor(Math.random() * 30) + 10
    };
  } else { // Forward
    return {
      goals: Math.floor(Math.random() * 20) + 8,
      assists: Math.floor(Math.random() * 10) + 3,
      tackles: Math.floor(Math.random() * 20),
      shotsOnTarget: Math.floor(Math.random() * 50) + 30
    };
  }
}

// Function to create a player object
function createPlayer(
  index: number,
  isMale: boolean,
  isU17: boolean,
  position: string
) {
  const firstName = isMale 
    ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
    : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${index}`;
  const email = `${username}@mcunited.test`;
  const state = nigerianStates[Math.floor(Math.random() * nigerianStates.length)];
  
  // Football-related images from Unsplash
  const footballImages = [
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400",
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400",
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400",
    "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400",
  ];
  
  const avatar = footballImages[Math.floor(Math.random() * footballImages.length)];
  
  return {
    name,
    username,
    email,
    phone: `+234${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    avatar,
    dateOfBirth: generateDOB(isU17),
    state,
    currentLocation: state,
    position,
    preferredFoot: Math.random() > 0.7 ? "Left" : Math.random() > 0.5 ? "Right" : "Both",
    height: position === "Goalkeeper" ? 180 + Math.floor(Math.random() * 15) : 165 + Math.floor(Math.random() * 20),
    weight: 60 + Math.floor(Math.random() * 30),
    bio: `Talented ${position.toLowerCase()} for McUnited FC. Passionate about the beautiful game and representing Nigeria on the field.`,
  };
}

async function main() {
  console.log("🌱 Starting McUnited FC comprehensive seed...");

  // Hash default password
  const defaultPassword = await bcrypt.hash("mcunited123", 10);

  // 1. CREATE ORGANIZATION
  console.log("\n📋 Creating McUnited FC organization...");
  const organization = await prisma.organization.upsert({
    where: { slug: "mcunited-fc" },
    update: {},
    create: {
      name: "McUnited FC",
      slug: "mcunited-fc",
      type: "club",
      email: "info@mcunitedfc.ng",
      phone: "+2349012345678",
      address: "12 Victory Road, Surulere, Lagos State",
      logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200",
      website: "https://mcunitedfc.ng",
      description: "McUnited FC is a premier football club in Lagos, Nigeria. We nurture talent from grassroots to professional levels, with teams across multiple age groups and divisions.",
      settings: {
        currency: "NGN",
        timezone: "Africa/Lagos",
        language: "en"
      }
    },
  });
  console.log(`✅ Created organization: ${organization.name}`);

  // 2. CREATE ADMIN USER
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@mcunitedfc.ng" },
    update: {},
    create: {
      email: "admin@mcunitedfc.ng",
      passwordHash: defaultPassword,
      role: "org_admin",
      organizationId: organization.id,
    },
  });

  // 3. CREATE AGE GROUPS
  console.log("\n📊 Creating age groups...");
  const seniorAgeGroup = await prisma.ageGroup.upsert({
    where: {
      organizationId_name: {
        organizationId: organization.id,
        name: "Senior"
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: "Senior",
      minAge: 18,
      maxAge: null,
      description: "Senior team players (18 years and above)"
    }
  });

  const u17AgeGroup = await prisma.ageGroup.upsert({
    where: {
      organizationId_name: {
        organizationId: organization.id,
        name: "U-17"
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: "U-17",
      minAge: 13,
      maxAge: 17,
      description: "Under 17 youth team"
    }
  });

  // 4. CREATE DIVISIONS
  console.log("\n📊 Creating divisions...");
  const menDivision = await prisma.division.upsert({
    where: {
      organizationId_name: {
        organizationId: organization.id,
        name: "Men's Division"
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: "Men's Division",
      description: "Men's football division",
      level: 1
    }
  });

  const womenDivision = await prisma.division.upsert({
    where: {
      organizationId_name: {
        organizationId: organization.id,
        name: "Women's Division"
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: "Women's Division",
      description: "Women's football division",
      level: 1
    }
  });

  // 5. CREATE SEASON
  console.log("\n📅 Creating active season...");
  const season = await prisma.season.create({
    data: {
      organizationId: organization.id,
      name: "2024/2025 Season",
      startDate: new Date("2024-09-01"),
      endDate: new Date("2025-06-30"),
      isActive: true,
      description: "Current season for all McUnited FC teams"
    }
  });

  // 6. CREATE TEAMS
  console.log("\n⚽ Creating teams...");
  const seniorMenTeam = await prisma.team.create({
    data: {
      organizationId: organization.id,
      name: "McUnited FC Senior Men",
      slug: "senior-men",
      logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200",
      description: "Senior Men's first team",
      divisionId: menDivision.id,
      ageGroupId: seniorAgeGroup.id,
      seasonId: season.id
    }
  });

  const seniorWomenTeam = await prisma.team.create({
    data: {
      organizationId: organization.id,
      name: "McUnited FC Senior Women",
      slug: "senior-women",
      logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200",
      description: "Senior Women's first team",
      divisionId: womenDivision.id,
      ageGroupId: seniorAgeGroup.id,
      seasonId: season.id
    }
  });

  const u17MenTeam = await prisma.team.create({
    data: {
      organizationId: organization.id,
      name: "McUnited FC U17 Men",
      slug: "u17-men",
      logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200",
      description: "Under-17 Men's team",
      divisionId: menDivision.id,
      ageGroupId: u17AgeGroup.id,
      seasonId: season.id
    }
  });

  const u17WomenTeam = await prisma.team.create({
    data: {
      organizationId: organization.id,
      name: "McUnited FC U17 Women",
      slug: "u17-women",
      logo: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200",
      description: "Under-17 Women's team",
      divisionId: womenDivision.id,
      ageGroupId: u17AgeGroup.id,
      seasonId: season.id
    }
  });

  const teams = [
    { team: seniorMenTeam, isMale: true, isU17: false },
    { team: seniorWomenTeam, isMale: false, isU17: false },
    { team: u17MenTeam, isMale: true, isU17: true },
    { team: u17WomenTeam, isMale: false, isU17: true }
  ];

  // 7. CREATE PLAYERS (23 per team = 92 total)
  console.log("\n👥 Creating 92 players...");
  let playerCount = 0;
  const allPlayers: any[] = [];

  for (const { team, isMale, isU17 } of teams) {
    // Team composition: 2 GK, 8 Defenders, 8 Midfielders, 5 Forwards
    const positions = [
      ...Array(2).fill("Goalkeeper"),
      ...Array(8).fill("Defender"),
      ...Array(8).fill("Midfielder"),
      ...Array(5).fill("Forward")
    ];

    for (let i = 0; i < 23; i++) {
      const playerData = createPlayer(playerCount++, isMale, isU17, positions[i]);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          email: playerData.email,
          passwordHash: defaultPassword,
          role: "player",
          organizationId: organization.id
        }
      });

      // Create player
      const player = await prisma.player.create({
        data: {
          userId: user.id,
          name: playerData.name,
          username: playerData.username,
          phone: playerData.phone,
          avatar: playerData.avatar,
          dateOfBirth: playerData.dateOfBirth,
          state: playerData.state,
          currentLocation: playerData.currentLocation,
          position: playerData.position,
          preferredFoot: playerData.preferredFoot,
          height: playerData.height,
          weight: playerData.weight,
          bio: playerData.bio,
          organizationId: organization.id,
          teamId: team.id,
          subscriptionTier: "pro",
          subscriptionExpiry: new Date("2025-12-31")
        }
      });

      allPlayers.push({ player, team, position: playerData.position });

      // Create league stats
      await prisma.leagueStat.create({
        data: {
          playerId: player.id,
          season: "2024/2025",
          club: "McUnited FC",
          appearances: Math.floor(Math.random() * 20) + 5,
          goals: playerData.position === "Forward" ? Math.floor(Math.random() * 15) + 2 : 
                 playerData.position === "Midfielder" ? Math.floor(Math.random() * 8) :
                 playerData.position === "Defender" ? Math.floor(Math.random() * 3) : 0,
          assists: Math.floor(Math.random() * 10),
          yellowCards: Math.floor(Math.random() * 5),
          redCards: Math.random() > 0.9 ? 1 : 0,
          verified: true
        }
      });
    }
    console.log(`✅ Created 23 players for ${team.name}`);
  }

  // 8. CREATE CONTRACTS
  console.log("\n📝 Creating contracts for all players...");
  for (const { player, team } of allPlayers) {
    await prisma.contract.create({
      data: {
        playerId: player.id,
        organizationId: organization.id,
        teamId: team.id,
        startDate: new Date("2024-07-01"),
        endDate: new Date("2026-06-30"),
        salary: Math.floor(Math.random() * 150000) + 50000, // 50k - 200k NGN
        terms: {
          type: "Professional",
          bonuses: {
            goalBonus: 5000,
            winBonus: 10000,
            cleanSheetBonus: 7500
          },
          clauses: [
            "Must maintain fitness standards",
            "Required to attend all training sessions",
            "Available for all official matches"
          ]
        },
        status: "active"
      }
    });
  }
  console.log(`✅ Created ${allPlayers.length} contracts`);

  // 9. CREATE VENUES
  console.log("\n🏟️ Creating venues...");
  const venues = [
    {
      name: "McUnited Stadium",
      address: "Victory Road, Surulere",
      city: "Lagos",
      state: "Lagos",
      capacity: 15000,
      facilities: ["Floodlights", "Changing Rooms", "VIP Lounge", "Medical Room", "Press Box", "Parking"],
      contactName: "Stadium Manager",
      contactPhone: "+2349012345678",
      contactEmail: "stadium@mcunitedfc.ng",
      notes: "Home stadium for all McUnited FC teams",
      isActive: true
    },
    {
      name: "Lagos Sports Complex",
      address: "National Stadium Road",
      city: "Lagos",
      state: "Lagos",
      capacity: 25000,
      facilities: ["Floodlights", "Multiple Pitches", "Changing Rooms", "Parking", "Medical Facilities"],
      contactName: "Complex Director",
      contactPhone: "+2349023456789",
      contactEmail: "info@lagossports.ng",
      notes: "Used for major tournaments and cup matches",
      isActive: true
    },
    {
      name: "Training Ground Alpha",
      address: "Behind McUnited Stadium",
      city: "Lagos",
      state: "Lagos",
      capacity: 500,
      facilities: ["Multiple Pitches", "Gym", "Changing Rooms", "Medical Room"],
      contactName: "Training Coordinator",
      contactPhone: "+2349034567890",
      contactEmail: "training@mcunitedfc.ng",
      notes: "Primary training facility",
      isActive: true
    }
  ];

  const createdVenues = [];
  for (const venueData of venues) {
    const venue = await prisma.venue.create({
      data: {
        organizationId: organization.id,
        ...venueData
      }
    });
    createdVenues.push(venue);
  }

  // 10. CREATE TOURNAMENTS
  console.log("\n🏆 Creating tournaments...");
  const tournament = await prisma.tournament.create({
    data: {
      organizationId: organization.id,
      seasonId: season.id,
      name: "Lagos State Premier League",
      description: "Premier football competition in Lagos State",
      type: "round_robin",
      startDate: new Date("2024-09-15"),
      endDate: new Date("2025-05-30"),
      status: "in_progress",
      settings: {
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0,
        matchDuration: 90
      }
    }
  });

  // 11. CREATE CALENDAR EVENTS
  console.log("\n📅 Creating comprehensive calendar events...");
  const eventTypes = [
    { type: "practice", title: "Team Training Session", location: "Training Ground Alpha" },
    { type: "game", title: "League Match vs ", location: "McUnited Stadium" },
    { type: "meeting", title: "Team Meeting", location: "Club House" },
    { type: "tournament", title: "Tournament Match", location: "Lagos Sports Complex" }
  ];

  const opponents = ["FC Warriors", "Lagos United", "Victory FC", "Champions SC", "Royal FC", "Elite FC"];
  
  const events = [];
  const startDate = new Date("2024-11-08");
  
  // Training sessions - 3 per week
  for (let i = 0; i < 12; i++) {
    const eventDate = new Date(startDate);
    eventDate.setDate(eventDate.getDate() + (i * 2) + 1);
    eventDate.setHours(9, 0, 0, 0);
    
    const endDate = new Date(eventDate);
    endDate.setHours(12, 0, 0, 0);
    
    for (const { team } of teams) {
      const event = await prisma.event.create({
        data: {
          organizationId: organization.id,
          teamId: team.id,
          title: `${team.name} - Morning Training`,
          description: "Regular training session focusing on tactical preparation and fitness",
          type: "practice",
          startTime: eventDate,
          endTime: endDate,
          location: createdVenues[2].name,
          status: i < 5 ? "completed" : "scheduled",
          attendees: [],
          reminders: [60, 1440] // 1 hour and 1 day before
        }
      });
      events.push(event);
    }
  }

  // Matches - Weekly
  for (let i = 0; i < 8; i++) {
    const matchDate = new Date(startDate);
    matchDate.setDate(matchDate.getDate() + (i * 7) + 6); // Every Saturday
    matchDate.setHours(16, 0, 0, 0);
    
    const endDate = new Date(matchDate);
    endDate.setHours(18, 0, 0, 0);
    
    const opponent = opponents[i % opponents.length];
    
    for (const { team } of teams.slice(0, 2)) { // Only senior teams play league matches
      const event = await prisma.event.create({
        data: {
          organizationId: organization.id,
          teamId: team.id,
          title: `${team.name} vs ${opponent}`,
          description: `League match - Lagos State Premier League`,
          type: "game",
          startTime: matchDate,
          endTime: endDate,
          location: i % 2 === 0 ? createdVenues[0].name : createdVenues[1].name,
          status: i < 3 ? "completed" : "scheduled",
          attendees: []
        }
      });
      events.push(event);
    }
  }

  // Team meetings - Monthly
  for (let i = 0; i < 3; i++) {
    const meetingDate = new Date(startDate);
    meetingDate.setDate(meetingDate.getDate() + (i * 30));
    meetingDate.setHours(18, 0, 0, 0);
    
    const endDate = new Date(meetingDate);
    endDate.setHours(19, 30, 0, 0);
    
    const event = await prisma.event.create({
      data: {
        organizationId: organization.id,
        teamId: null, // Organization-wide
        title: "Monthly Strategy Meeting",
        description: "Review performance, discuss tactics, and plan for upcoming fixtures",
        type: "meeting",
        startTime: meetingDate,
        endTime: endDate,
        location: "McUnited FC Boardroom",
        status: i < 1 ? "completed" : "scheduled"
      }
    });
    events.push(event);
  }

  console.log(`✅ Created ${events.length} calendar events`);

  // 12. CREATE ANNOUNCEMENTS
  console.log("\n📢 Creating announcements...");
  const announcements = [
    {
      title: "Welcome to the 2024/2025 Season!",
      content: "We are thrilled to kick off another exciting season at McUnited FC! This season promises great football, teamwork, and success. Let's give it our all and make our fans proud. Training begins Monday at 9 AM sharp. See you all there!",
      priority: "high",
      sendEmail: true,
      sendPush: true,
      targetAudience: ["all"],
      createdAt: new Date("2024-08-25")
    },
    {
      title: "New Training Equipment Arrived",
      content: "Great news everyone! We've received our new training equipment including balls, cones, bibs, and fitness gear. Thanks to our sponsors for making this possible. Let's put them to good use!",
      priority: "normal",
      sendEmail: false,
      sendPush: true,
      targetAudience: ["coaches", "players"],
      createdAt: new Date("2024-09-10")
    },
    {
      title: "Match Day Protocols",
      content: "Reminder: All players must arrive 2 hours before kickoff on match days. Bring your kit, boots, and positive attitude. Medical checks will be conducted 90 minutes before kickoff. Let's maintain our professional standards!",
      priority: "high",
      sendEmail: true,
      sendPush: true,
      targetAudience: ["players", "coaches"],
      createdAt: new Date("2024-09-20")
    },
    {
      title: "Congratulations on League Win!",
      content: "Fantastic performance everyone! Our senior men's team secured a crucial 3-1 victory yesterday. Special mention to our goal scorers and the entire defensive unit. Recovery session tomorrow at 10 AM.",
      priority: "normal",
      sendEmail: false,
      sendPush: true,
      targetAudience: ["all"],
      createdAt: new Date("2024-10-15")
    },
    {
      title: "Medical Screenings Scheduled",
      content: "Annual medical screenings for all players will take place next week. This is mandatory for insurance and player welfare. Please check the schedule and attend your assigned slot. Contact the medical team if you have any concerns.",
      priority: "urgent",
      sendEmail: true,
      sendPush: true,
      targetAudience: ["players"],
      createdAt: new Date("2024-10-28")
    }
  ];

  for (const announcement of announcements) {
    await prisma.announcement.create({
      data: {
        organizationId: organization.id,
        teamId: null,
        createdById: adminUser.id,
        ...announcement
      }
    });
  }

  // 13. CREATE ASSIGNMENTS
  console.log("\n📋 Creating assignments...");
  const assignments = [
    {
      title: "Equipment Management - Match Day",
      description: "Responsible for preparing and managing all equipment for the upcoming match. Ensure balls, cones, medical kit, and water bottles are ready.",
      type: "duty",
      status: "completed",
      dueDate: new Date("2024-10-20"),
      completedAt: new Date("2024-10-20"),
      notes: "Task completed successfully"
    },
    {
      title: "Social Media Content Creation",
      description: "Create and post training highlight videos on club social media. Capture team spirit and training intensity.",
      type: "task",
      status: "in_progress",
      dueDate: new Date("2024-11-15"),
      notes: "Video editing in progress"
    },
    {
      title: "Youth Training Volunteer",
      description: "Assist with U17 training sessions. Help with drills, provide mentorship, and share your experience with younger players.",
      type: "volunteer",
      status: "pending",
      dueDate: new Date("2024-11-20"),
      notes: "3 sessions per week"
    },
    {
      title: "Community Outreach Event",
      description: "Participate in the community football clinic for local schools. Represent McUnited FC and inspire young footballers.",
      type: "volunteer",
      status: "pending",
      dueDate: new Date("2024-11-25"),
      notes: "Saturday morning event"
    },
    {
      title: "Match Report Preparation",
      description: "Compile match statistics and performance analysis for the coaching staff. Include key metrics and observations.",
      type: "task",
      status: "completed",
      dueDate: new Date("2024-10-18"),
      completedAt: new Date("2024-10-18")
    }
  ];

  for (const assignment of assignments) {
    // Assign to random players from senior teams
    const randomPlayer = allPlayers[Math.floor(Math.random() * 46)]; // First 46 are senior players
    
    await prisma.assignment.create({
      data: {
        organizationId: organization.id,
        teamId: randomPlayer.team.id,
        createdById: adminUser.id,
        assignedToId: randomPlayer.player.id,
        assignedToType: "player",
        ...assignment
      }
    });
  }

  // 14. CREATE MEDIA FILES
  console.log("\n📸 Creating media files...");
  const mediaFiles = [
    {
      title: "Team Photo 2024/2025",
      description: "Official team photo for the new season",
      fileType: "image",
      fileName: "team-photo-2024.jpg",
      fileUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800",
      category: "photo",
      isPublic: true,
      tags: ["team", "official", "season-2024"]
    },
    {
      title: "Training Session Highlights",
      description: "Intense training session preparing for upcoming match",
      fileType: "image",
      fileName: "training-highlights.jpg",
      fileUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
      category: "training_drill",
      isPublic: true,
      tags: ["training", "preparation", "teamwork"]
    },
    {
      title: "Match Day Action",
      description: "Exciting moments from our league victory",
      fileType: "image",
      fileName: "match-action.jpg",
      fileUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
      category: "match_highlights",
      isPublic: true,
      tags: ["match", "victory", "action"]
    },
    {
      title: "Goal Celebration",
      description: "Team celebrating a crucial goal",
      fileType: "image",
      fileName: "goal-celebration.jpg",
      fileUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800",
      category: "match_highlights",
      isPublic: true,
      tags: ["goal", "celebration", "teamwork"]
    },
    {
      title: "Training Drill: Passing Exercise",
      description: "Tactical passing drill for midfield coordination",
      fileType: "image",
      fileName: "passing-drill.jpg",
      fileUrl: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800",
      category: "training_drill",
      isPublic: false,
      tags: ["drill", "tactics", "training"]
    },
    {
      title: "Youth Team in Action",
      description: "Our talented U17 players during training",
      fileType: "image",
      fileName: "youth-training.jpg",
      fileUrl: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800",
      category: "photo",
      isPublic: true,
      tags: ["youth", "u17", "development"]
    },
    {
      title: "Stadium Atmosphere",
      description: "McUnited Stadium on match day",
      fileType: "image",
      fileName: "stadium.jpg",
      fileUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800",
      category: "photo",
      isPublic: true,
      tags: ["stadium", "fans", "atmosphere"]
    },
    {
      title: "Medical Registration Form",
      description: "Template for player medical registration",
      fileType: "document",
      fileName: "medical-form.pdf",
      fileUrl: "https://example.com/forms/medical.pdf",
      category: "form",
      isPublic: false,
      tags: ["medical", "form", "registration"]
    }
  ];

  for (const media of mediaFiles) {
    await prisma.mediaFile.create({
      data: {
        organizationId: organization.id,
        teamId: null,
        uploadedById: adminUser.id,
        fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
        mimeType: media.fileType === "image" ? "image/jpeg" : "application/pdf",
        ...media
      }
    });
  }

  // 15. CREATE INVOICES AND PAYMENTS
  console.log("\n💰 Creating invoices and payments...");
  const invoiceTypes = [
    { description: "Registration Fee", amount: 25000 },
    { description: "Training Kit", amount: 15000 },
    { description: "Tournament Entry Fee", amount: 50000 },
    { description: "Monthly Dues", amount: 10000 }
  ];

  let invoiceNumber = 1000;
  for (let i = 0; i < 15; i++) {
    const randomPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)];
    const invoiceType = invoiceTypes[i % invoiceTypes.length];
    const isPaid = Math.random() > 0.3; // 70% paid
    
    const invoice = await prisma.invoice.create({
      data: {
        organizationId: organization.id,
        playerId: randomPlayer.player.id,
        invoiceNumber: `INV-${invoiceNumber++}`,
        amount: invoiceType.amount,
        currency: "NGN",
        status: isPaid ? "paid" : Math.random() > 0.5 ? "sent" : "overdue",
        dueDate: new Date(Date.now() + (Math.random() * 30 - 15) * 24 * 60 * 60 * 1000),
        paidAt: isPaid ? new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000) : null
      }
    });

    if (isPaid) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: invoice.amount,
          method: ["paystack", "bank_transfer", "mobile_money"][Math.floor(Math.random() * 3)],
          status: "succeeded",
          transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          paidAt: invoice.paidAt
        }
      });
    }
  }

  // 16. CREATE WAIVERS AND SIGNATURES
  console.log("\n📄 Creating waivers and signatures...");
  const waivers = [
    {
      title: "Player Liability Waiver 2024/2025",
      content: "I, the undersigned, hereby acknowledge that I am voluntarily participating in football activities organized by McUnited FC. I understand that football is a physical sport that involves risk of injury. I hereby release McUnited FC, its officials, coaches, and staff from any liability for injuries sustained during training or matches, except in cases of gross negligence.",
      version: "1.0",
      isActive: true,
      requiresParent: false
    },
    {
      title: "Minor Player Consent Form (U17)",
      content: "As the parent/guardian of the minor player named below, I grant permission for my child to participate in all football activities organized by McUnited FC. I understand the risks involved and consent to emergency medical treatment if necessary. I confirm that my child is medically fit to participate in football activities.",
      version: "1.0",
      isActive: true,
      requiresParent: true
    },
    {
      title: "Media Release Consent",
      content: "I consent to McUnited FC capturing and using photographs, videos, and other media of me for promotional purposes including website, social media, and marketing materials. I understand that no compensation will be provided for such use.",
      version: "1.0",
      isActive: true,
      requiresParent: false
    }
  ];

  const createdWaivers = [];
  for (const waiverData of waivers) {
    const waiver = await prisma.waiver.create({
      data: {
        organizationId: organization.id,
        ...waiverData
      }
    });
    createdWaivers.push(waiver);
  }

  // Create signatures for most players
  for (const { player } of allPlayers.slice(0, 70)) { // 70 out of 92 have signed
    const waiver = createdWaivers[Math.random() > 0.5 ? 0 : 2]; // Sign liability or media waiver
    
    await prisma.waiverSignature.create({
      data: {
        waiverId: waiver.id,
        playerId: player.id,
        signatureData: `${player.name} - Digital Signature`,
        ipAddress: `197.210.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        signedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // 17. CREATE BACKGROUND CHECKS
  console.log("\n🔍 Creating background checks...");
  const checkTypes = ["criminal", "reference", "certification"];
  const checkStatuses = ["passed", "passed", "passed", "in_progress", "pending"];

  // Background checks for coaches and staff
  for (let i = 0; i < 5; i++) {
    await prisma.backgroundCheck.create({
      data: {
        organizationId: organization.id,
        userId: adminUser.id,
        type: checkTypes[i % checkTypes.length],
        status: checkStatuses[i % checkStatuses.length],
        provider: "Nigerian Police Background Check Services",
        referenceId: `BG-${Date.now()}-${i}`,
        completedAt: checkStatuses[i % checkStatuses.length] === "passed" ? new Date() : null,
        expiresAt: checkStatuses[i % checkStatuses.length] === "passed" ? new Date("2025-12-31") : null,
        notes: checkStatuses[i % checkStatuses.length] === "passed" ? "Cleared - No issues found" : "Pending verification"
      }
    });
  }

  // 18. CREATE DOCUMENTS
  console.log("\n📂 Creating documents...");
  const documents = [
    {
      title: "Club Constitution",
      description: "Official constitution and bylaws of McUnited FC",
      category: "other",
      fileName: "constitution.pdf",
      fileUrl: "https://example.com/docs/constitution.pdf",
      isConfidential: false,
      accessRoles: ["org_admin", "coach"]
    },
    {
      title: "Insurance Policy Document",
      description: "Club and player insurance coverage details",
      category: "insurance",
      fileName: "insurance-policy-2024.pdf",
      fileUrl: "https://example.com/docs/insurance.pdf",
      isConfidential: true,
      accessRoles: ["org_admin"]
    },
    {
      title: "Medical Emergency Procedures",
      description: "Protocol for handling medical emergencies during training and matches",
      category: "medical",
      fileName: "emergency-procedures.pdf",
      fileUrl: "https://example.com/docs/emergency.pdf",
      isConfidential: false,
      accessRoles: ["org_admin", "coach", "medical_staff"]
    },
    {
      title: "Coaching Certifications",
      description: "CAF and NFF coaching license certificates",
      category: "certification",
      fileName: "coaching-certs.pdf",
      fileUrl: "https://example.com/docs/coaching-certs.pdf",
      isConfidential: true,
      accessRoles: ["org_admin"]
    }
  ];

  for (const doc of documents) {
    await prisma.document.create({
      data: {
        organizationId: organization.id,
        userId: adminUser.id,
        fileSize: Math.floor(Math.random() * 2000000) + 50000,
        mimeType: "application/pdf",
        ...doc
      }
    });
  }

  // 19. CREATE AUDIT LOGS
  console.log("\n📊 Creating audit logs...");
  const actions = ["create", "update", "view", "delete", "export"];
  const entities = ["player", "contract", "invoice", "document", "event", "announcement"];

  for (let i = 0; i < 50; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const entity = entities[Math.floor(Math.random() * entities.length)];
    
    await prisma.auditLog.create({
      data: {
        organizationId: organization.id,
        userId: adminUser.id,
        action,
        entityType: entity,
        entityId: `entity-${i}`,
        changes: {
          action: action,
          timestamp: new Date(),
          details: `${action} operation performed on ${entity}`
        },
        ipAddress: `197.210.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        metadata: {
          browser: "Chrome",
          os: "Windows",
          location: "Lagos, Nigeria"
        },
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // 20. CREATE ANALYTICS DATA (via attendances and availabilities)
  console.log("\n📈 Creating analytics data...");
  
  // Create availabilities for events
  for (const event of events.slice(0, 20)) {
    if (event.teamId) {
      const teamPlayers = allPlayers.filter(p => p.team.id === event.teamId);
      
      for (const { player } of teamPlayers.slice(0, 18)) { // 18 out of 23 respond
        await prisma.availability.create({
          data: {
            eventId: event.id,
            playerId: player.id,
            teamId: event.teamId,
            status: Math.random() > 0.15 ? "available" : Math.random() > 0.5 ? "unavailable" : "maybe",
            respondedAt: new Date(event.startTime.getTime() - Math.random() * 48 * 60 * 60 * 1000),
            notes: Math.random() > 0.7 ? "Ready for match day!" : null
          }
        });
      }
    }
  }

  // Create attendances for completed events
  const completedEvents = events.filter(e => e.status === "completed");
  for (const event of completedEvents) {
    if (event.teamId) {
      const teamPlayers = allPlayers.filter(p => p.team.id === event.teamId);
      
      for (const { player } of teamPlayers) {
        const attended = Math.random() > 0.1; // 90% attendance rate
        
        await prisma.attendance.create({
          data: {
            eventId: event.id,
            playerId: player.id,
            status: attended ? (Math.random() > 0.8 ? "late" : "present") : "absent",
            checkedInAt: attended ? new Date(event.startTime.getTime() + Math.random() * 30 * 60 * 1000) : null,
            checkedInById: attended ? adminUser.id : null,
            healthCheck: attended ? {
              temperature: 36.5 + Math.random() * 0.8,
              symptoms: "None",
              cleared: true
            } : null
          }
        });
      }
    }
  }

  console.log("\n✅ McUnited FC seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   ✅ Organization: ${organization.name}`);
  console.log(`   ✅ Teams: 4 (Senior Men, Senior Women, U17 Men, U17 Women)`);
  console.log(`   ✅ Players: 92 (23 per team)`);
  console.log(`   ✅ Contracts: 92`);
  console.log(`   ✅ Venues: ${createdVenues.length}`);
  console.log(`   ✅ Season: 2024/2025 (Active)`);
  console.log(`   ✅ Tournament: Lagos State Premier League`);
  console.log(`   ✅ Calendar Events: ${events.length}`);
  console.log(`   ✅ Announcements: ${announcements.length}`);
  console.log(`   ✅ Assignments: ${assignments.length}`);
  console.log(`   ✅ Media Files: ${mediaFiles.length}`);
  console.log(`   ✅ Invoices: 15 with payments`);
  console.log(`   ✅ Waivers: ${createdWaivers.length} with 70 signatures`);
  console.log(`   ✅ Background Checks: 5`);
  console.log(`   ✅ Documents: ${documents.length}`);
  console.log(`   ✅ Audit Logs: 50`);
  console.log(`   ✅ Analytics Data: Availabilities & Attendances`);
  
  console.log("\n🔑 Login Credentials:");
  console.log(`   Admin: admin@mcunitedfc.ng / mcunited123`);
  console.log(`   Any Player: [player-email] / mcunited123`);
  console.log(`   Example: chukwuemeka_okonkwo_0@mcunited.test / mcunited123`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

