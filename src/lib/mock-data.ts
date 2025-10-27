export type Player = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  position: 'Point Guard' | 'Shooting Guard' | 'Small Forward' | 'Power Forward' | 'Center';
  stats: {
    points: number;
    rebounds: number;
    assists: number;
  };
  bio: string;
  team: string;
  height: string;
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
    name: 'Jalen Green',
    username: 'jalengreen',
    avatar: 'https://picsum.photos/seed/p1/100/100',
    position: 'Shooting Guard',
    stats: { points: 28.5, rebounds: 5.2, assists: 3.5 },
    bio: 'Explosive shooting guard with a knack for scoring. 2nd year pro out of the G-League Ignite.',
    team: 'Houston Rockets',
    height: "6'4\"",
    weight: 186,
  },
  {
    id: '2',
    name: 'Arike Ogunbowale',
    username: 'arikeo',
    avatar: 'https://picsum.photos/seed/p2/100/100',
    position: 'Point Guard',
    stats: { points: 22.8, rebounds: 3.4, assists: 4.5 },
    bio: 'Clutch player with deep range. Known for hitting big shots in big moments.',
    team: 'Dallas Wings',
    height: "5'8\"",
    weight: 145,
  },
  {
    id: '3',
    name: 'Victor Wembanyama',
    username: 'wemby',
    avatar: 'https://picsum.photos/seed/p3/100/100',
    position: 'Center',
    stats: { points: 21.4, rebounds: 10.6, assists: 3.9 },
    bio: 'Generational talent with unprecedented size and skill. Rookie of the Year.',
    team: 'San Antonio Spurs',
    height: "7'4\"",
    weight: 209,
  },
  {
    id: '4',
    name: 'Chioma Okonkwo',
    username: 'chioma_o',
    avatar: 'https://picsum.photos/seed/p4/100/100',
    position: 'Power Forward',
    stats: { points: 18.2, rebounds: 11.1, assists: 2.1 },
    bio: 'Dominant force in the paint, leading the league in rebounding. Hails from Lagos, Nigeria.',
    team: 'Lagos City Ballers',
    height: "6'2\"",
    weight: 180,
  },
];

export const posts: Post[] = [
  {
    id: '1',
    player: players[0],
    content: 'Great team win tonight! Felt good to be back on the court. The energy in the building was electric. 🔥 #OnTheRise',
    media: {
      type: 'image',
      url: 'https://picsum.photos/seed/post1/600/400',
      hint: 'basketball dunk',
    },
    likes: 1203,
    comments: 88,
    createdAt: '2h ago',
  },
  {
    id: '2',
    player: players[1],
    content: 'Putting in the work day in, day out. The season is a marathon, not a sprint. Trust the process. 💪 #GrindNeverStops',
    likes: 854,
    comments: 45,
    createdAt: '1d ago',
  },
  {
    id: '3',
    player: players[3],
    content: 'Honored to be named player of the week! Couldn\'t have done it without my amazing teammates and coaches. We keep building!',
    media: {
      type: 'image',
      url: 'https://picsum.photos/seed/post3/600/500',
      hint: 'basketball shooting',
    },
    likes: 2500,
    comments: 150,
    createdAt: '3d ago',
  },
  {
    id: '4',
    player: players[2],
    content: 'Learning so much in my rookie year. Every game is a new challenge. Appreciate all the fan support!',
    likes: 9870,
    comments: 653,
    createdAt: '5d ago',
  },
];

export const trainingPlans: TrainingPlan[] = [
  {
    id: '1',
    title: 'Explosive Vertical Leap Program',
    description: 'A 6-week program designed to increase your vertical jump through plyometrics and strength training.',
    author: 'Dr. Mike Idowu',
    authorTitle: 'Sports Performance PhD',
    image: { url: 'https://picsum.photos/seed/train1/400/250', hint: 'stretching workout' },
  },
  {
    id: '2',
    title: 'Ball Handling Mastery',
    description: 'Daily drills to improve your dribbling skills, hand-eye coordination, and confidence with the ball.',
    author: 'Coach Ayo Balogun',
    authorTitle: 'Professional Skills Trainer',
    image: { url: 'https://picsum.photos/seed/train2/400/250', hint: 'basketball practice' },
  },
  {
    id: '3',
    title: 'In-Season Strength Maintenance',
    description: 'Maintain your strength and prevent injuries during the long season with this curated workout plan.',
    author: 'Femi Adebayo',
    authorTitle: 'Certified Strength Coach',
    image: { url: 'https://picsum.photos/seed/train3/400/250', hint: 'weight lifting' },
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
