export interface Artist {
  id: string;
  name: string;
  day: 'Thu' | 'Fri' | 'Sat' | 'Sun';
  time: string;
  startTime: number; // Minutes from midnight for conflict detection
  endTime: number;
  stage: string;
  genre: string;
  imageUrl: string;
  friendsGoing: string[];
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  members: string[];
}

export interface MeetupPoint {
  id: string;
  name: string;
  type: 'food' | 'water' | 'stage' | 'exit';
  location: string;
  description?: string;
}

export interface Meetup {
  id: string;
  location: string;
  time: string;
  timestamp: number; // Minutes from midnight
  day: 'Thu' | 'Fri' | 'Sat' | 'Sun';
  description: string;
}

export interface Festival {
  id: string;
  name: string;
  location: string;
  date: string;
  accent: string;
  bg: string;
  secondary: string;
  isDark?: boolean;
  artists: Artist[];
}

export const FESTIVALS: Festival[] = [
  {
    id: 'coachella-2026',
    name: 'Coachella Valley Music & Arts Festival',
    location: 'Empire Polo Club',
    date: 'April 2026',
    accent: '#FFB3D9', // Pastel Pink
    bg: '#FFF5F9', // Soft Pink
    secondary: '#B2CEFE', // Pastel Blue
    isDark: false,
    artists: [
      { id: 'c1', name: 'Lana Del Rey', day: 'Fri', time: '23:00 - 00:30', startTime: 1380, endTime: 30, stage: 'Coachella Stage', genre: 'Dream Pop', imageUrl: 'https://picsum.photos/seed/lana/400/400', friendsGoing: ['Alice', 'Eve'] },
      { id: 'c2', name: 'Tyler, The Creator', day: 'Sat', time: '23:30 - 01:00', startTime: 1410, endTime: 60, stage: 'Coachella Stage', genre: 'Hip Hop', imageUrl: 'https://picsum.photos/seed/tyler/400/400', friendsGoing: ['Bob', 'Charlie'] },
      { id: 'c3', name: 'Doja Cat', day: 'Sun', time: '22:30 - 00:00', startTime: 1350, endTime: 0, stage: 'Coachella Stage', genre: 'Pop', imageUrl: 'https://picsum.photos/seed/doja/400/400', friendsGoing: ['Dave', 'Frank'] },
      { id: 'c4', name: 'Justice', day: 'Fri', time: '21:00 - 22:30', startTime: 1260, endTime: 1350, stage: 'Outdoor Theatre', genre: 'Electronic', imageUrl: 'https://picsum.photos/seed/justice/400/400', friendsGoing: ['Alice', 'Bob'] },
      { id: 'c5', name: 'No Doubt', day: 'Sat', time: '20:00 - 21:30', startTime: 1200, endTime: 1290, stage: 'Coachella Stage', genre: 'Ska Punk', imageUrl: 'https://picsum.photos/seed/nodoubt/400/400', friendsGoing: ['Charlie', 'Dave'] },
    ]
  },
  {
    id: 'desert-vibes',
    name: 'Desert Vibes',
    location: 'Palm Springs',
    date: 'April 2026',
    accent: '#FFB3B3', // Pastel Red
    bg: '#FFF5F5', // Soft Pink
    secondary: '#B2D8B2', // Pastel Green
    isDark: false,
    artists: [
      { id: 'd1', name: 'Sandstorm', day: 'Fri', time: '18:00 - 19:30', startTime: 1080, endTime: 1170, stage: 'Oasis Stage', genre: 'Electronic', imageUrl: 'https://picsum.photos/seed/sand/400/400', friendsGoing: ['Alice', 'Bob'] },
      { id: 'd2', name: 'Cactus Jack', day: 'Sat', time: '20:00 - 21:30', startTime: 1200, endTime: 1290, stage: 'Main Stage', genre: 'Hip Hop', imageUrl: 'https://picsum.photos/seed/cactus/400/400', friendsGoing: ['Charlie', 'Dave'] },
      { id: 'd3', name: 'Mirage', day: 'Sun', time: '16:00 - 17:00', startTime: 960, endTime: 1020, stage: 'Sunset Stage', genre: 'Indie', imageUrl: 'https://picsum.photos/seed/mirage/400/400', friendsGoing: ['Eve', 'Frank'] },
    ]
  },
  {
    id: 'mountain-high',
    name: 'Mountain High',
    location: 'Aspen Peaks',
    date: 'August 2026',
    accent: '#B2D8B2', // Pastel Green
    bg: '#F5FFF5', // Soft Green
    secondary: '#B2CEFE', // Pastel Blue
    isDark: false,
    artists: [
      { id: 'm1', name: 'Peak Performance', day: 'Thu', time: '14:00 - 15:00', startTime: 840, endTime: 900, stage: 'Summit Stage', genre: 'Folk', imageUrl: 'https://picsum.photos/seed/peak/400/400', friendsGoing: ['Alice', 'Charlie'] },
      { id: 'm2', name: 'Alpine Glow', day: 'Fri', time: '19:00 - 20:30', startTime: 1140, endTime: 1230, stage: 'Valley Stage', genre: 'Acoustic', imageUrl: 'https://picsum.photos/seed/alpine/400/400', friendsGoing: ['Bob', 'Eve'] },
      { id: 'm3', name: 'Snow Cap', day: 'Sat', time: '21:00 - 22:30', startTime: 1260, endTime: 1350, stage: 'Summit Stage', genre: 'Rock', imageUrl: 'https://picsum.photos/seed/snow/400/400', friendsGoing: ['Dave', 'Frank'] },
    ]
  },
  {
    id: 'edc-vegas-25',
    name: 'EDC Vegas 25',
    location: 'Las Vegas Motor Speedway',
    date: 'May 2025',
    accent: '#FFB3B3', // Pastel Pink
    bg: '#FFF5F5', // Light Pink
    secondary: '#FDFD96', // Pastel Yellow
    isDark: false,
    artists: [
      // Friday
      { id: 'e1', name: 'Tiësto', day: 'Fri', time: '22:00 - 23:30', startTime: 1320, endTime: 1410, stage: 'Kinetic Field', genre: 'Trance', imageUrl: 'https://picsum.photos/seed/tiesto/400/400', friendsGoing: ['Alice', 'Bob', 'Charlie'] },
      { id: 'e2', name: 'David Guetta', day: 'Fri', time: '00:00 - 01:30', startTime: 0, endTime: 90, stage: 'Kinetic Field', genre: 'Dance', imageUrl: 'https://picsum.photos/seed/guetta/400/400', friendsGoing: ['Eve', 'Frank'] },
      { id: 'e3', name: 'Zedd', day: 'Fri', time: '00:00 - 01:30', startTime: 0, endTime: 90, stage: 'Circuit Grounds', genre: 'Electro House', imageUrl: 'https://picsum.photos/seed/zedd/400/400', friendsGoing: ['Dave', 'Eve'] },
      { id: 'e4', name: 'Eric Prydz', day: 'Fri', time: '01:30 - 03:00', startTime: 90, endTime: 180, stage: 'Circuit Grounds', genre: 'Progressive', imageUrl: 'https://picsum.photos/seed/prydz/400/400', friendsGoing: ['Alice', 'Charlie'] },
      { id: 'e5', name: 'Charlotte de Witte', day: 'Fri', time: '02:00 - 03:30', startTime: 120, endTime: 210, stage: 'Neon Garden', genre: 'Techno', imageUrl: 'https://picsum.photos/seed/charlotte/400/400', friendsGoing: ['Frank', 'Grace'] },
      
      // Saturday
      { id: 'e6', name: 'Martin Garrix', day: 'Sat', time: '23:30 - 01:00', startTime: 1410, endTime: 60, stage: 'Kinetic Field', genre: 'Progressive House', imageUrl: 'https://picsum.photos/seed/garrix/400/400', friendsGoing: ['Alice', 'Dave', 'Frank'] },
      { id: 'e7', name: 'Afrojack', day: 'Sat', time: '01:00 - 02:30', startTime: 60, endTime: 150, stage: 'Kinetic Field', genre: 'Electro', imageUrl: 'https://picsum.photos/seed/afrojack/400/400', friendsGoing: ['Bob', 'Eve'] },
      { id: 'e8', name: 'Excision', day: 'Sat', time: '01:30 - 03:00', startTime: 90, endTime: 180, stage: 'Basspod', genre: 'Dubstep', imageUrl: 'https://picsum.photos/seed/excision/400/400', friendsGoing: ['Bob', 'Charlie', 'Eve'] },
      { id: 'e9', name: 'Fisher', day: 'Sat', time: '21:00 - 22:30', startTime: 1260, endTime: 1350, stage: 'Cosmic Meadow', genre: 'Tech House', imageUrl: 'https://picsum.photos/seed/fisher/400/400', friendsGoing: ['Grace', 'Alice'] },
      { id: 'e10', name: 'Dom Dolla', day: 'Sat', time: '22:30 - 00:00', startTime: 1350, endTime: 0, stage: 'Cosmic Meadow', genre: 'House', imageUrl: 'https://picsum.photos/seed/dom/400/400', friendsGoing: ['Charlie', 'Dave'] },
      
      // Sunday
      { id: 'e11', name: 'Armin van Buuren', day: 'Sun', time: '23:00 - 00:30', startTime: 1380, endTime: 30, stage: 'Kinetic Field', genre: 'Trance', imageUrl: 'https://picsum.photos/seed/armin/400/400', friendsGoing: ['Charlie', 'Eve', 'Frank'] },
      { id: 'e12', name: 'Kaskade', day: 'Sun', time: '00:30 - 02:00', startTime: 30, endTime: 120, stage: 'Kinetic Field', genre: 'House', imageUrl: 'https://picsum.photos/seed/kaskade/400/400', friendsGoing: ['Alice', 'Bob'] },
      { id: 'e13', name: 'Subtronics', day: 'Sun', time: '01:00 - 02:30', startTime: 60, endTime: 150, stage: 'Circuit Grounds', genre: 'Dubstep', imageUrl: 'https://picsum.photos/seed/subtronics/400/400', friendsGoing: ['Alice', 'Bob', 'Dave'] },
      { id: 'e14', name: 'Vintage Culture', day: 'Sun', time: '19:30 - 21:00', startTime: 1170, endTime: 1260, stage: 'Stereo Bloom', genre: 'House', imageUrl: 'https://picsum.photos/seed/vintage/400/400', friendsGoing: ['Grace', 'Eve'] },
      { id: 'e15', name: 'James Hype', day: 'Sun', time: '21:00 - 22:30', startTime: 1260, endTime: 1350, stage: 'Stereo Bloom', genre: 'Tech House', imageUrl: 'https://picsum.photos/seed/hype/400/400', friendsGoing: ['Frank', 'Dave'] },
    ]
  },
  {
    id: 'lavender-fields',
    name: 'Lavender Fields',
    location: 'Provence Valley',
    date: 'June 2026',
    accent: '#D1B3FF', // Pastel Purple
    bg: '#F8F4FF', // Soft Lavender
    secondary: '#B2CEFE', // Pastel Blue
    isDark: false,
    artists: [
      { id: 'lv1', name: 'Purple Haze', day: 'Fri', time: '16:00 - 17:30', startTime: 960, endTime: 1050, stage: 'Garden Stage', genre: 'Dream Pop', imageUrl: 'https://picsum.photos/seed/purple/400/400', friendsGoing: ['Alice', 'Charlie'] },
      { id: 'lv2', name: 'Violet Sky', day: 'Sat', time: '19:00 - 20:30', startTime: 1140, endTime: 1230, stage: 'Meadow Stage', genre: 'Ambient', imageUrl: 'https://picsum.photos/seed/violet/400/400', friendsGoing: ['Eve', 'Grace'] },
    ]
  },
  {
    id: 'peach-paradise',
    name: 'Peach Paradise',
    location: 'Georgia Orchards',
    date: 'July 2026',
    accent: '#FFD1B3', // Pastel Peach
    bg: '#FFF9F5', // Soft Peach
    secondary: '#FDFD96', // Pastel Yellow
    isDark: false,
    artists: [
      { id: 'pp1', name: 'Sunset Glow', day: 'Sat', time: '18:00 - 19:30', startTime: 1080, endTime: 1170, stage: 'Orchard Stage', genre: 'Indie Pop', imageUrl: 'https://picsum.photos/seed/sunset/400/400', friendsGoing: ['Bob', 'Dave'] },
      { id: 'pp2', name: 'Sweet Nectar', day: 'Sun', time: '14:00 - 15:30', startTime: 840, endTime: 930, stage: 'Main Stage', genre: 'Soul', imageUrl: 'https://picsum.photos/seed/nectar/400/400', friendsGoing: ['Frank', 'Alice'] },
    ]
  },
  {
    id: 'minty-meadows',
    name: 'Minty Meadows',
    location: 'Vermont Hills',
    date: 'September 2026',
    accent: '#B3FFE6', // Pastel Mint
    bg: '#F5FFFA', // Soft Mint
    secondary: '#B2CEFE', // Pastel Blue
    isDark: false,
    artists: [
      { id: 'mm1', name: 'Cool Breeze', day: 'Fri', time: '15:00 - 16:30', startTime: 900, endTime: 990, stage: 'Valley Stage', genre: 'Chillwave', imageUrl: 'https://picsum.photos/seed/breeze/400/400', friendsGoing: ['Charlie', 'Eve'] },
      { id: 'mm2', name: 'Fresh Cut', day: 'Sat', time: '17:00 - 18:30', startTime: 1020, endTime: 1110, stage: 'Hilltop Stage', genre: 'Folk Rock', imageUrl: 'https://picsum.photos/seed/fresh/400/400', friendsGoing: ['Grace', 'Bob'] },
    ]
  },
  {
    id: 'lemon-zest',
    name: 'Lemon Zest',
    location: 'Amalfi Coast',
    date: 'August 2026',
    accent: '#FFFAB3', // Pastel Lemon
    bg: '#FFFFF5', // Soft Lemon
    secondary: '#FFB3B3', // Pastel Pink
    isDark: false,
    artists: [
      { id: 'lz1', name: 'Citrus Sun', day: 'Sat', time: '13:00 - 14:30', startTime: 780, endTime: 870, stage: 'Coast Stage', genre: 'Tropical House', imageUrl: 'https://picsum.photos/seed/citrus/400/400', friendsGoing: ['Dave', 'Frank'] },
      { id: 'lz2', name: 'Yellow Sub', day: 'Sun', time: '20:00 - 21:30', startTime: 1200, endTime: 1290, stage: 'Main Stage', genre: 'Psychedelic', imageUrl: 'https://picsum.photos/seed/yellow/400/400', friendsGoing: ['Alice', 'Bob'] },
    ]
  }
];

export const MEETUP_POINTS: MeetupPoint[] = [
  { id: 'm1', name: 'Giant Ferris Wheel', type: 'stage', location: 'South Entrance' },
  { id: 'm2', name: 'Hydration Station A', type: 'water', location: 'Near Main Stage' },
  { id: 'm3', name: 'Chow Town East', type: 'food', location: 'Main Walkway' },
];

export const MEETUPS: Meetup[] = [
  { id: 'mt1', location: 'Giant Ferris Wheel', time: '18:00', timestamp: 1080, day: 'Fri', description: 'Sunset group photo!' },
  { id: 'mt2', location: 'Hydration Station A', time: '20:30', timestamp: 1230, day: 'Sat', description: 'Refill and regroup before headliner' },
  { id: 'mt3', location: 'Chow Town East', time: '14:00', timestamp: 840, day: 'Sun', description: 'Late lunch / early dinner' },
];
