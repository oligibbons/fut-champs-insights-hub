
export interface PlayerCard {
  id: string;
  name: string;
  rating: number;
  position: string;
  club: string;
  nationality: string;
  league: string;
  cardType: 'gold' | 'rare_gold' | 'totw' | 'hero' | 'icon' | 'special';
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  physical?: number;
  price?: number;
  imageUrl?: string;
  // Performance tracking properties
  gamesPlayed: number;
  goals: number;
  assists: number;
  averageRating: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  minutesPlayed: number;
  wins: number;
  losses: number;
  cleanSheets: number;
  lastUsed: string;
}

export interface SquadPosition {
  id: string;
  position: string;
  x: number;
  y: number;
  player?: PlayerCard;
}

export interface Squad {
  id: string;
  name: string;
  formation: string;
  startingXI: SquadPosition[];
  substitutes: SquadPosition[];
  reserves: SquadPosition[];
  created: string;
  lastModified: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  isDefault?: boolean;
  description?: string;
  totalRating?: number;
  averageAge?: number;
  totalValue?: number;
  keyPlayers?: string[];
}

export interface FormationData {
  name: string;
  positions: { position: string; x: number; y: number; }[];
}

export const FORMATIONS: FormationData[] = [
  {
    name: '4-3-3',
    positions: [
      { position: 'GK', x: 50, y: 85 },
      { position: 'RB', x: 80, y: 65 },
      { position: 'RCB', x: 65, y: 70 },
      { position: 'LCB', x: 35, y: 70 },
      { position: 'LB', x: 20, y: 65 },
      { position: 'RCM', x: 70, y: 45 },
      { position: 'CM', x: 50, y: 50 },
      { position: 'LCM', x: 30, y: 45 },
      { position: 'RW', x: 80, y: 25 },
      { position: 'ST', x: 50, y: 15 },
      { position: 'LW', x: 20, y: 25 }
    ]
  },
  {
    name: '4-4-2',
    positions: [
      { position: 'GK', x: 50, y: 85 },
      { position: 'RB', x: 80, y: 65 },
      { position: 'RCB', x: 65, y: 70 },
      { position: 'LCB', x: 35, y: 70 },
      { position: 'LB', x: 20, y: 65 },
      { position: 'RM', x: 80, y: 45 },
      { position: 'RCM', x: 65, y: 50 },
      { position: 'LCM', x: 35, y: 50 },
      { position: 'LM', x: 20, y: 45 },
      { position: 'RST', x: 60, y: 15 },
      { position: 'LST', x: 40, y: 15 }
    ]
  },
  {
    name: '3-5-2',
    positions: [
      { position: 'GK', x: 50, y: 85 },
      { position: 'RCB', x: 70, y: 70 },
      { position: 'CB', x: 50, y: 72 },
      { position: 'LCB', x: 30, y: 70 },
      { position: 'RWB', x: 85, y: 50 },
      { position: 'RCM', x: 65, y: 45 },
      { position: 'CM', x: 50, y: 50 },
      { position: 'LCM', x: 35, y: 45 },
      { position: 'LWB', x: 15, y: 50 },
      { position: 'RST', x: 60, y: 15 },
      { position: 'LST', x: 40, y: 15 }
    ]
  }
];

export const SUBSTITUTE_POSITIONS = [
  { position: 'SUB', x: 20, y: 20 },
  { position: 'SUB', x: 30, y: 20 },
  { position: 'SUB', x: 40, y: 20 },
  { position: 'SUB', x: 50, y: 20 },
  { position: 'SUB', x: 60, y: 20 },
  { position: 'SUB', x: 70, y: 20 },
  { position: 'SUB', x: 80, y: 20 }
];

export const RESERVE_POSITIONS = [
  { position: 'RES', x: 20, y: 10 },
  { position: 'RES', x: 30, y: 10 },
  { position: 'RES', x: 40, y: 10 },
  { position: 'RES', x: 50, y: 10 },
  { position: 'RES', x: 60, y: 10 },
  { position: 'RES', x: 70, y: 10 },
  { position: 'RES', x: 80, y: 10 }
];
