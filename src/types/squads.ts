
export interface PlayerCard {
  id: string;
  name: string;
  position: string;
  overall: number;
  cardType: string; // e.g., "Gold", "TOTW", "Icon", etc.
  rating: number;
  gamesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  averageRating: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  wins: number;
  losses: number;
  lastUsed: string;
}

export interface SquadPosition {
  id: string;
  position: string;
  player: PlayerCard | null;
  x: number; // Position on formation grid (0-100)
  y: number; // Position on formation grid (0-100)
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
}

export interface Formation {
  name: string;
  positions: {
    position: string;
    x: number;
    y: number;
  }[];
}

export const FORMATIONS: Formation[] = [
  {
    name: "4-3-3",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 50, y: 45 },
      { position: "CM", x: 65, y: 50 },
      { position: "LW", x: 25, y: 75 },
      { position: "ST", x: 50, y: 80 },
      { position: "RW", x: 75, y: 75 }
    ]
  },
  {
    name: "4-4-2",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "LM", x: 20, y: 55 },
      { position: "CM", x: 40, y: 50 },
      { position: "CM", x: 60, y: 50 },
      { position: "RM", x: 80, y: 55 },
      { position: "ST", x: 40, y: 80 },
      { position: "ST", x: 60, y: 80 }
    ]
  },
  {
    name: "4-2-3-1",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CDM", x: 40, y: 40 },
      { position: "CDM", x: 60, y: 40 },
      { position: "LAM", x: 25, y: 65 },
      { position: "CAM", x: 50, y: 65 },
      { position: "RAM", x: 75, y: 65 },
      { position: "ST", x: 50, y: 85 }
    ]
  }
];
