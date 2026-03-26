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
}

export interface Festival {
  id: string;
  name: string;
  location: string;
  date: string;
  accent: string;
  bg: string;
  secondary: string;
  artists: Artist[];
}

export const LOLLA_FEST: Festival = {
  id: 'lolla',
  name: 'Lollapalooza',
  location: 'Chicago, IL',
  date: 'August 1-4, 2026',
  accent: '#B2CEFE', // Pastel Blue
  bg: '#F0F4FF', // Ice Blue
  secondary: '#FDFD96', // Pastel Yellow
  artists: [
    { id: 'l1', name: 'Skyline Echo', day: 'Thu', time: '13:00 - 14:00', startTime: 780, endTime: 840, stage: 'Bud Light', genre: 'Rock', imageUrl: 'https://picsum.photos/seed/skyline/400/400', friendsGoing: ['Alice', 'Eve'] },
    { id: 'l2', name: 'Grant Park', day: 'Thu', time: '14:30 - 15:30', startTime: 870, endTime: 930, stage: 'T-Mobile', genre: 'Alternative', imageUrl: 'https://picsum.photos/seed/park/400/400', friendsGoing: ['Bob', 'Dave'] },
    { id: 'l3', name: 'Windy City', day: 'Fri', time: '15:00 - 16:30', startTime: 900, endTime: 990, stage: 'Perry\'s', genre: 'EDM', imageUrl: 'https://picsum.photos/seed/windy/400/400', friendsGoing: ['Charlie', 'Frank', 'Grace'] },
    { id: 'l4', name: 'The Loop', day: 'Sat', time: '17:00 - 18:00', startTime: 1020, endTime: 1080, stage: 'Bud Light', genre: 'Indie', imageUrl: 'https://picsum.photos/seed/loop/400/400', friendsGoing: ['Alice', 'Bob', 'Charlie'] },
    { id: 'l5', name: 'Navy Pier', day: 'Sun', time: '17:30 - 19:00', startTime: 1050, endTime: 1140, stage: 'T-Mobile', genre: 'Pop', imageUrl: 'https://picsum.photos/seed/pier/400/400', friendsGoing: ['Dave', 'Eve', 'Frank'] },
  ]
};

export const MEETUP_POINTS: MeetupPoint[] = [
  { id: 'm1', name: 'Giant Ferris Wheel', type: 'stage', location: 'South Entrance' },
  { id: 'm2', name: 'Hydration Station A', type: 'water', location: 'Near Perry\'s' },
  { id: 'm3', name: 'Chow Town East', type: 'food', location: 'Main Walkway' },
];
