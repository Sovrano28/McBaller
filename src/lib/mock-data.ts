export type Player = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  stats: {
    goals: number;
    assists: number;
    tackles: number;
  };
  bio: string;
  team: string;
  height: number;
  weight: number;
};

export type Post = {
  id: string;
  player: Player;
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    hint: string;
  };
  likes: number;
  comments: number;
  createdAt: string;
};

export type TrainingPlan = {
  id: string;
  title: string;
  description: string;
  author: string;
  authorTitle: string;
  image: {
    url: string;
    hint: string;
  };
};

export const players: Player[] = [
  {
    id: '1',
    name: 'Leo Martinez',
    username: 'leomartinez',
    email: 'leo@test.com',
    avatar: 'https://picsum.photos/seed/p1/100/100',
    position: 'Forward',
    stats: { goals: 28, assists: 12, tackles: 15 },
    bio: 'Pacy forward with a clinical finishing touch. A rising star from Buenos Aires.',
    team: 'Paris Saint-Germain',
    height: 170,
    weight: 68,
  },
  {
    id: '2',
    name: 'Samantha Kerr',
    username: 'samkerr',
    email: 'sam@test.com',
    avatar: 'https://picsum.photos/seed/p2/100/100',
    position: 'Forward',
    stats: { goals: 25, assists: 8, tackles: 10 },
    bio: 'World-renowned striker, famous for her acrobatic goals and leadership on the pitch.',
    team: 'Chelsea F.C. Women',
    height: 167,
    weight: 60,
  },
  {
    id: '3',
    name: 'Jamal Musiala',
    username: 'jamalmusiala',
    email: 'jamal@test.com',
    avatar: 'https://picsum.photos/seed/p3/100/100',
    position: 'Midfielder',
    stats: { goals: 12, assists: 18, tackles: 35 },
    bio: 'Creative attacking midfielder with incredible dribbling skills. A generational talent.',
    team: 'FC Bayern Munich',
    height: 183,
    weight: 72,
  },
  {
    id: '4',
    name: 'Folake Ojo',
    username: 'folake_ojo',
    email: 'folake@test.com',
    avatar: 'https://picsum.photos/seed/p4/100/100',
    position: 'Defender',
    stats: { goals: 3, assists: 5, tackles: 55 },
    bio: 'Rock-solid center-back, known for her tough tackling and aerial dominance. Hails from Lagos, Nigeria.',
    team: 'Lagos City Queens',
    height: 178,
    weight: 70,
  },
];

export const posts: Post[] = [
  {
    id: '1',
    player: players[0],
    content: 'What a match! Incredible atmosphere from the fans tonight. Three points in the bag. On to the next one! #HalaMadrid',
    media: {
      type: 'image',
      url: 'https://picsum.photos/seed/post1/600/400',
      hint: 'soccer goal',
    },
    likes: 1203,
    comments: 88,
    createdAt: '2h ago',
  },
  {
    id: '2',
    player: players[1],
    content: 'Drills in the rain. Building character and resilience. No excuses. ⚽️💧 #TrainHard',
    likes: 854,
    comments: 45,
    createdAt: '1d ago',
  },
  {
    id: '3',
    player: players[3],
    content: 'Proud to be named player of the match! Huge team effort today. We keep fighting together. 💪',
    media: {
      type: 'image',
      url: 'https://picsum.photos/seed/post3/600/500',
      hint: 'soccer tackle',
    },
    likes: 2500,
    comments: 150,
    createdAt: '3d ago',
  },
  {
    id: '4',
    player: players[2],
    content: 'Great session with the team. Perfecting those final passes. The beautiful game is all about connection. 🤝',
    likes: 9870,
    comments: 653,
    createdAt: '5d ago',
  },
];

export const trainingPlans: TrainingPlan[] = [
  {
    id: '1',
    title: 'Precision Finishing Drills',
    description: 'A 6-week program to sharpen your shooting accuracy and power in front of the goal.',
    author: 'Coach Jurgen Schmidt',
    authorTitle: 'UEFA Pro License Coach',
    image: { url: 'https://picsum.photos/seed/train1/400/250', hint: 'soccer training' },
  },
  {
    id: '2',
    title: 'Midfield Maestro Masterclass',
    description: 'Daily drills to improve your passing range, vision, and ball control under pressure.',
    author: 'Xavi Alonso',
    authorTitle: 'Legendary Midfielder',
    image: { url: 'https://picsum.photos/seed/train2/400/250', hint: 'soccer practice' },
  },
  {
    id: '3',
    title: 'Defensive Wall Workouts',
    description: 'Stay strong and agile throughout the season with workouts focused on tackling, positioning, and speed.',
    author: 'Chiara Bianchi',
    authorTitle: 'Lead Defensive Coach',
    image: { url: 'https://picsum.photos/seed/train3/400/250', hint: 'gym workout' },
  },
];

export const profileViewsData = [
  { date: 'Mon', views: 65 },
  { date: 'Tue', views: 88 },
  { date: 'Wed', views: 76 },
  { date: 'Thu', views: 102 },
  { date: 'Fri', views: 159 },
  { date: 'Sat', views: 250 },
  { date: 'Sun', views: 220 },
];

export const videoWatchesData = [
  { name: 'Highlight Reel', watches: 4000 },
  { name: 'Practice Drills', watches: 1800 },
  { name: 'Gameday Vlog', watches: 3200 },
];
