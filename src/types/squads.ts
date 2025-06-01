
export type Formation = 
  | '3-4-3' | '3-4-1-2' | '3-4-2-1' | '3-5-2' | '3-1-4-2'
  | '4-3-3' | '4-3-2-1' | '4-3-1-2' | '4-2-3-1' | '4-1-4-1'
  | '4-4-2' | '4-4-1-1' | '4-2-2-2' | '4-1-3-2' | '4-5-1'
  | '5-3-2' | '5-2-3' | '5-4-1' | '5-2-1-2' | '5-1-2-2'
  | '3-3-1-3' | '4-1-2-1-2' | '3-2-2-3' | '3-6-1' | '4-6-0'
  | '3-3-4' | '4-2-4' | '3-1-3-3' | '5-2-2-1';

export interface FormationData {
  name: Formation;
  positions: Array<{
    position: string;
    x: number;
    y: number;
  }>;
}

export const FORMATIONS: FormationData[] = [
  {
    name: '3-4-3',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'CB', x: 25, y: 75 }, { position: 'CB', x: 50, y: 75 }, { position: 'CB', x: 75, y: 75 },
      { position: 'LM', x: 15, y: 55 }, { position: 'CM', x: 35, y: 55 }, { position: 'CM', x: 65, y: 55 }, { position: 'RM', x: 85, y: 55 },
      { position: 'LW', x: 20, y: 25 }, { position: 'ST', x: 50, y: 20 }, { position: 'RW', x: 80, y: 25 }
    ]
  },
  {
    name: '3-4-1-2',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'CB', x: 25, y: 75 }, { position: 'CB', x: 50, y: 75 }, { position: 'CB', x: 75, y: 75 },
      { position: 'LM', x: 15, y: 55 }, { position: 'CM', x: 35, y: 55 }, { position: 'CM', x: 65, y: 55 }, { position: 'RM', x: 85, y: 55 },
      { position: 'CAM', x: 50, y: 35 },
      { position: 'ST', x: 40, y: 20 }, { position: 'ST', x: 60, y: 20 }
    ]
  },
  {
    name: '3-4-2-1',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'CB', x: 25, y: 75 }, { position: 'CB', x: 50, y: 75 }, { position: 'CB', x: 75, y: 75 },
      { position: 'LM', x: 15, y: 55 }, { position: 'CM', x: 35, y: 55 }, { position: 'CM', x: 65, y: 55 }, { position: 'RM', x: 85, y: 55 },
      { position: 'CAM', x: 35, y: 35 }, { position: 'CAM', x: 65, y: 35 },
      { position: 'ST', x: 50, y: 20 }
    ]
  },
  {
    name: '3-5-2',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'CB', x: 25, y: 75 }, { position: 'CB', x: 50, y: 75 }, { position: 'CB', x: 75, y: 75 },
      { position: 'LM', x: 15, y: 50 }, { position: 'CM', x: 30, y: 50 }, { position: 'CM', x: 50, y: 50 }, { position: 'CM', x: 70, y: 50 }, { position: 'RM', x: 85, y: 50 },
      { position: 'ST', x: 40, y: 20 }, { position: 'ST', x: 60, y: 20 }
    ]
  },
  {
    name: '3-1-4-2',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'CB', x: 25, y: 75 }, { position: 'CB', x: 50, y: 75 }, { position: 'CB', x: 75, y: 75 },
      { position: 'CDM', x: 50, y: 60 },
      { position: 'LM', x: 20, y: 45 }, { position: 'CM', x: 40, y: 45 }, { position: 'CM', x: 60, y: 45 }, { position: 'RM', x: 80, y: 45 },
      { position: 'ST', x: 40, y: 20 }, { position: 'ST', x: 60, y: 20 }
    ]
  },
  {
    name: '4-3-3',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 35, y: 75 }, { position: 'CB', x: 65, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'CM', x: 30, y: 50 }, { position: 'CM', x: 50, y: 50 }, { position: 'CM', x: 70, y: 50 },
      { position: 'LW', x: 20, y: 25 }, { position: 'ST', x: 50, y: 20 }, { position: 'RW', x: 80, y: 25 }
    ]
  },
  {
    name: '4-3-2-1',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 35, y: 75 }, { position: 'CB', x: 65, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'CM', x: 30, y: 50 }, { position: 'CM', x: 50, y: 50 }, { position: 'CM', x: 70, y: 50 },
      { position: 'CAM', x: 35, y: 30 }, { position: 'CAM', x: 65, y: 30 },
      { position: 'ST', x: 50, y: 15 }
    ]
  },
  {
    name: '4-3-1-2',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 35, y: 75 }, { position: 'CB', x: 65, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'CM', x: 30, y: 50 }, { position: 'CM', x: 50, y: 50 }, { position: 'CM', x: 70, y: 50 },
      { position: 'CAM', x: 50, y: 30 },
      { position: 'ST', x: 40, y: 15 }, { position: 'ST', x: 60, y: 15 }
    ]
  },
  {
    name: '4-2-3-1',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 35, y: 75 }, { position: 'CB', x: 65, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'CDM', x: 40, y: 55 }, { position: 'CDM', x: 60, y: 55 },
      { position: 'LW', x: 20, y: 30 }, { position: 'CAM', x: 50, y: 35 }, { position: 'RW', x: 80, y: 30 },
      { position: 'ST', x: 50, y: 15 }
    ]
  },
  {
    name: '4-1-4-1',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 35, y: 75 }, { position: 'CB', x: 65, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'CDM', x: 50, y: 60 },
      { position: 'LM', x: 20, y: 45 }, { position: 'CM', x: 40, y: 45 }, { position: 'CM', x: 60, y: 45 }, { position: 'RM', x: 80, y: 45 },
      { position: 'ST', x: 50, y: 20 }
    ]
  },
  {
    name: '4-4-2',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 35, y: 75 }, { position: 'CB', x: 65, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'LM', x: 20, y: 50 }, { position: 'CM', x: 40, y: 50 }, { position: 'CM', x: 60, y: 50 }, { position: 'RM', x: 80, y: 50 },
      { position: 'ST', x: 40, y: 20 }, { position: 'ST', x: 60, y: 20 }
    ]
  },
  {
    name: '4-4-1-1',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 35, y: 75 }, { position: 'CB', x: 65, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'LM', x: 20, y: 50 }, { position: 'CM', x: 40, y: 50 }, { position: 'CM', x: 60, y: 50 }, { position: 'RM', x: 80, y: 50 },
      { position: 'CAM', x: 50, y: 30 },
      { position: 'ST', x: 50, y: 15 }
    ]
  },
  {
    name: '4-2-2-2',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 35, y: 75 }, { position: 'CB', x: 65, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'CDM', x: 40, y: 55 }, { position: 'CDM', x: 60, y: 55 },
      { position: 'CAM', x: 35, y: 35 }, { position: 'CAM', x: 65, y: 35 },
      { position: 'ST', x: 40, y: 15 }, { position: 'ST', x: 60, y: 15 }
    ]
  },
  {
    name: '4-1-3-2',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 35, y: 75 }, { position: 'CB', x: 65, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'CDM', x: 50, y: 60 },
      { position: 'LM', x: 25, y: 40 }, { position: 'CM', x: 50, y: 40 }, { position: 'RM', x: 75, y: 40 },
      { position: 'ST', x: 40, y: 20 }, { position: 'ST', x: 60, y: 20 }
    ]
  },
  {
    name: '4-5-1',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 35, y: 75 }, { position: 'CB', x: 65, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'LM', x: 15, y: 45 }, { position: 'CM', x: 30, y: 50 }, { position: 'CM', x: 50, y: 50 }, { position: 'CM', x: 70, y: 50 }, { position: 'RM', x: 85, y: 45 },
      { position: 'ST', x: 50, y: 20 }
    ]
  },
  {
    name: '5-3-2',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LWB', x: 10, y: 70 }, { position: 'CB', x: 25, y: 80 }, { position: 'CB', x: 50, y: 80 }, { position: 'CB', x: 75, y: 80 }, { position: 'RWB', x: 90, y: 70 },
      { position: 'CM', x: 30, y: 50 }, { position: 'CM', x: 50, y: 50 }, { position: 'CM', x: 70, y: 50 },
      { position: 'ST', x: 40, y: 20 }, { position: 'ST', x: 60, y: 20 }
    ]
  },
  {
    name: '5-2-3',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LWB', x: 10, y: 70 }, { position: 'CB', x: 25, y: 80 }, { position: 'CB', x: 50, y: 80 }, { position: 'CB', x: 75, y: 80 }, { position: 'RWB', x: 90, y: 70 },
      { position: 'CM', x: 40, y: 50 }, { position: 'CM', x: 60, y: 50 },
      { position: 'LW', x: 20, y: 25 }, { position: 'ST', x: 50, y: 20 }, { position: 'RW', x: 80, y: 25 }
    ]
  },
  {
    name: '5-4-1',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LWB', x: 10, y: 70 }, { position: 'CB', x: 25, y: 80 }, { position: 'CB', x: 50, y: 80 }, { position: 'CB', x: 75, y: 80 }, { position: 'RWB', x: 90, y: 70 },
      { position: 'LM', x: 20, y: 50 }, { position: 'CM', x: 40, y: 50 }, { position: 'CM', x: 60, y: 50 }, { position: 'RM', x: 80, y: 50 },
      { position: 'ST', x: 50, y: 20 }
    ]
  },
  {
    name: '5-2-1-2',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LWB', x: 10, y: 70 }, { position: 'CB', x: 25, y: 80 }, { position: 'CB', x: 50, y: 80 }, { position: 'CB', x: 75, y: 80 }, { position: 'RWB', x: 90, y: 70 },
      { position: 'CM', x: 40, y: 55 }, { position: 'CM', x: 60, y: 55 },
      { position: 'CAM', x: 50, y: 35 },
      { position: 'ST', x: 40, y: 20 }, { position: 'ST', x: 60, y: 20 }
    ]
  },
  {
    name: '5-1-2-2',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LWB', x: 10, y: 70 }, { position: 'CB', x: 25, y: 80 }, { position: 'CB', x: 50, y: 80 }, { position: 'CB', x: 75, y: 80 }, { position: 'RWB', x: 90, y: 70 },
      { position: 'CDM', x: 50, y: 60 },
      { position: 'CAM', x: 40, y: 35 }, { position: 'CAM', x: 60, y: 35 },
      { position: 'ST', x: 40, y: 20 }, { position: 'ST', x: 60, y: 20 }
    ]
  },
  {
    name: '3-3-1-3',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'CB', x: 25, y: 75 }, { position: 'CB', x: 50, y: 75 }, { position: 'CB', x: 75, y: 75 },
      { position: 'CM', x: 30, y: 55 }, { position: 'CM', x: 50, y: 55 }, { position: 'CM', x: 70, y: 55 },
      { position: 'CAM', x: 50, y: 35 },
      { position: 'LW', x: 20, y: 20 }, { position: 'ST', x: 50, y: 15 }, { position: 'RW', x: 80, y: 20 }
    ]
  },
  {
    name: '4-1-2-1-2',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 35, y: 75 }, { position: 'CB', x: 65, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'CDM', x: 50, y: 60 },
      { position: 'CM', x: 35, y: 45 }, { position: 'CM', x: 65, y: 45 },
      { position: 'CAM', x: 50, y: 30 },
      { position: 'ST', x: 40, y: 15 }, { position: 'ST', x: 60, y: 15 }
    ]
  },
  {
    name: '3-2-2-3',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'CB', x: 25, y: 75 }, { position: 'CB', x: 50, y: 75 }, { position: 'CB', x: 75, y: 75 },
      { position: 'CM', x: 40, y: 55 }, { position: 'CM', x: 60, y: 55 },
      { position: 'CAM', x: 35, y: 35 }, { position: 'CAM', x: 65, y: 35 },
      { position: 'LW', x: 20, y: 20 }, { position: 'ST', x: 50, y: 15 }, { position: 'RW', x: 80, y: 20 }
    ]
  },
  {
    name: '3-6-1',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'CB', x: 25, y: 75 }, { position: 'CB', x: 50, y: 75 }, { position: 'CB', x: 75, y: 75 },
      { position: 'LM', x: 15, y: 45 }, { position: 'CM', x: 30, y: 50 }, { position: 'CM', x: 45, y: 50 }, { position: 'CM', x: 55, y: 50 }, { position: 'CM', x: 70, y: 50 }, { position: 'RM', x: 85, y: 45 },
      { position: 'ST', x: 50, y: 20 }
    ]
  },
  {
    name: '4-6-0',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 35, y: 75 }, { position: 'CB', x: 65, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'LM', x: 15, y: 40 }, { position: 'CM', x: 30, y: 45 }, { position: 'CM', x: 45, y: 45 }, { position: 'CM', x: 55, y: 45 }, { position: 'CM', x: 70, y: 45 }, { position: 'RM', x: 85, y: 40 }
    ]
  },
  {
    name: '3-3-4',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'CB', x: 25, y: 75 }, { position: 'CB', x: 50, y: 75 }, { position: 'CB', x: 75, y: 75 },
      { position: 'CM', x: 30, y: 55 }, { position: 'CM', x: 50, y: 55 }, { position: 'CM', x: 70, y: 55 },
      { position: 'LW', x: 15, y: 25 }, { position: 'ST', x: 40, y: 20 }, { position: 'ST', x: 60, y: 20 }, { position: 'RW', x: 85, y: 25 }
    ]
  },
  {
    name: '4-2-4',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 35, y: 75 }, { position: 'CB', x: 65, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'CM', x: 40, y: 50 }, { position: 'CM', x: 60, y: 50 },
      { position: 'LW', x: 20, y: 25 }, { position: 'ST', x: 40, y: 15 }, { position: 'ST', x: 60, y: 15 }, { position: 'RW', x: 80, y: 25 }
    ]
  },
  {
    name: '3-1-3-3',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'CB', x: 25, y: 75 }, { position: 'CB', x: 50, y: 75 }, { position: 'CB', x: 75, y: 75 },
      { position: 'CDM', x: 50, y: 60 },
      { position: 'LM', x: 25, y: 40 }, { position: 'CM', x: 50, y: 40 }, { position: 'RM', x: 75, y: 40 },
      { position: 'LW', x: 20, y: 20 }, { position: 'ST', x: 50, y: 15 }, { position: 'RW', x: 80, y: 20 }
    ]
  },
  {
    name: '5-2-2-1',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LWB', x: 10, y: 70 }, { position: 'CB', x: 25, y: 80 }, { position: 'CB', x: 50, y: 80 }, { position: 'CB', x: 75, y: 80 }, { position: 'RWB', x: 90, y: 70 },
      { position: 'CM', x: 40, y: 50 }, { position: 'CM', x: 60, y: 50 },
      { position: 'CAM', x: 35, y: 30 }, { position: 'CAM', x: 65, y: 30 },
      { position: 'ST', x: 50, y: 15 }
    ]
  }
];

export interface PlayerCard {
  id: string;
  name: string;
  position: string;
  rating: number;
  cardType: 'bronze' | 'silver' | 'gold' | 'inform' | 'totw' | 'toty' | 'tots' | 'icon' | 'hero';
  club: string;
  nationality: string;
  league: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  averageRating: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  minutesPlayed: number;
  wins: number;
  losses: number;
  lastUsed: string;
}

export interface SquadPosition {
  id: string;
  position: string;
  player?: PlayerCard;
  x: number;
  y: number;
}

export interface Squad {
  id: string;
  name: string;
  formation: Formation;
  startingXI: SquadPosition[];
  substitutes: SquadPosition[];
  reserves: SquadPosition[];
  created: string;
  lastModified: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  isDefault?: boolean;
}
