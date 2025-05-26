
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
    name: "3-1-4-2",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "CB", x: 30, y: 25 },
      { position: "CB", x: 50, y: 20 },
      { position: "CB", x: 70, y: 25 },
      { position: "CDM", x: 50, y: 40 },
      { position: "LM", x: 15, y: 55 },
      { position: "CM", x: 35, y: 55 },
      { position: "CM", x: 65, y: 55 },
      { position: "RM", x: 85, y: 55 },
      { position: "ST", x: 40, y: 80 },
      { position: "ST", x: 60, y: 80 }
    ]
  },
  {
    name: "3-4-1-2",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "CB", x: 30, y: 25 },
      { position: "CB", x: 50, y: 20 },
      { position: "CB", x: 70, y: 25 },
      { position: "LM", x: 15, y: 45 },
      { position: "CM", x: 35, y: 45 },
      { position: "CM", x: 65, y: 45 },
      { position: "RM", x: 85, y: 45 },
      { position: "CAM", x: 50, y: 65 },
      { position: "ST", x: 40, y: 85 },
      { position: "ST", x: 60, y: 85 }
    ]
  },
  {
    name: "3-4-2-1",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "CB", x: 30, y: 25 },
      { position: "CB", x: 50, y: 20 },
      { position: "CB", x: 70, y: 25 },
      { position: "LM", x: 15, y: 45 },
      { position: "CM", x: 35, y: 45 },
      { position: "CM", x: 65, y: 45 },
      { position: "RM", x: 85, y: 45 },
      { position: "CAM", x: 35, y: 70 },
      { position: "CAM", x: 65, y: 70 },
      { position: "ST", x: 50, y: 85 }
    ]
  },
  {
    name: "3-4-3",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "CB", x: 30, y: 25 },
      { position: "CB", x: 50, y: 20 },
      { position: "CB", x: 70, y: 25 },
      { position: "LM", x: 15, y: 45 },
      { position: "CM", x: 35, y: 45 },
      { position: "CM", x: 65, y: 45 },
      { position: "RM", x: 85, y: 45 },
      { position: "LW", x: 25, y: 75 },
      { position: "ST", x: 50, y: 80 },
      { position: "RW", x: 75, y: 75 }
    ]
  },
  {
    name: "3-5-2",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "CB", x: 30, y: 25 },
      { position: "CB", x: 50, y: 20 },
      { position: "CB", x: 70, y: 25 },
      { position: "LWB", x: 15, y: 45 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 50, y: 45 },
      { position: "CM", x: 65, y: 50 },
      { position: "RWB", x: 85, y: 45 },
      { position: "ST", x: 40, y: 80 },
      { position: "ST", x: 60, y: 80 }
    ]
  },
  {
    name: "4-1-2-1-2 (2)",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CDM", x: 50, y: 40 },
      { position: "CM", x: 35, y: 55 },
      { position: "CM", x: 65, y: 55 },
      { position: "CAM", x: 50, y: 70 },
      { position: "ST", x: 40, y: 85 },
      { position: "ST", x: 60, y: 85 }
    ]
  },
  {
    name: "4-1-2-1-2",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CDM", x: 50, y: 40 },
      { position: "LM", x: 25, y: 55 },
      { position: "RM", x: 75, y: 55 },
      { position: "CAM", x: 50, y: 70 },
      { position: "ST", x: 40, y: 85 },
      { position: "ST", x: 60, y: 85 }
    ]
  },
  {
    name: "4-1-3-2",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CDM", x: 50, y: 40 },
      { position: "CM", x: 30, y: 55 },
      { position: "CAM", x: 50, y: 60 },
      { position: "CM", x: 70, y: 55 },
      { position: "ST", x: 40, y: 80 },
      { position: "ST", x: 60, y: 80 }
    ]
  },
  {
    name: "4-1-4-1",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CDM", x: 50, y: 40 },
      { position: "LM", x: 20, y: 55 },
      { position: "CM", x: 40, y: 55 },
      { position: "CM", x: 60, y: 55 },
      { position: "RM", x: 80, y: 55 },
      { position: "ST", x: 50, y: 80 }
    ]
  },
  {
    name: "4-2-2-2",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CDM", x: 40, y: 40 },
      { position: "CDM", x: 60, y: 40 },
      { position: "CAM", x: 35, y: 65 },
      { position: "CAM", x: 65, y: 65 },
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
  },
  {
    name: "4-2-3-1 (2)",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CDM", x: 40, y: 40 },
      { position: "CDM", x: 60, y: 40 },
      { position: "LW", x: 25, y: 65 },
      { position: "CAM", x: 50, y: 65 },
      { position: "RW", x: 75, y: 65 },
      { position: "ST", x: 50, y: 85 }
    ]
  },
  {
    name: "4-2-4",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CM", x: 40, y: 45 },
      { position: "CM", x: 60, y: 45 },
      { position: "LW", x: 20, y: 75 },
      { position: "ST", x: 40, y: 80 },
      { position: "ST", x: 60, y: 80 },
      { position: "RW", x: 80, y: 75 }
    ]
  },
  {
    name: "4-3-1-2",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 50, y: 45 },
      { position: "CM", x: 65, y: 50 },
      { position: "CAM", x: 50, y: 65 },
      { position: "ST", x: 40, y: 80 },
      { position: "ST", x: 60, y: 80 }
    ]
  },
  {
    name: "4-3-2-1",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 50, y: 45 },
      { position: "CM", x: 65, y: 50 },
      { position: "LF", x: 35, y: 70 },
      { position: "RF", x: 65, y: 70 },
      { position: "ST", x: 50, y: 85 }
    ]
  },
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
    name: "4-3-3 (2)",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CDM", x: 50, y: 40 },
      { position: "CM", x: 35, y: 55 },
      { position: "CM", x: 65, y: 55 },
      { position: "LW", x: 25, y: 75 },
      { position: "ST", x: 50, y: 80 },
      { position: "RW", x: 75, y: 75 }
    ]
  },
  {
    name: "4-3-3 (3)",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CM", x: 35, y: 50 },
      { position: "CAM", x: 50, y: 55 },
      { position: "CM", x: 65, y: 50 },
      { position: "LW", x: 25, y: 75 },
      { position: "ST", x: 50, y: 80 },
      { position: "RW", x: 75, y: 75 }
    ]
  },
  {
    name: "4-3-3 (4)",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CM", x: 35, y: 50 },
      { position: "CAM", x: 50, y: 55 },
      { position: "CM", x: 65, y: 50 },
      { position: "LF", x: 30, y: 75 },
      { position: "CF", x: 50, y: 80 },
      { position: "RF", x: 70, y: 75 }
    ]
  },
  {
    name: "4-3-3 (5)",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "CDM", x: 40, y: 40 },
      { position: "CDM", x: 60, y: 40 },
      { position: "CAM", x: 50, y: 55 },
      { position: "LW", x: 25, y: 75 },
      { position: "ST", x: 50, y: 80 },
      { position: "RW", x: 75, y: 75 }
    ]
  },
  {
    name: "4-4-1-1",
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
      { position: "CAM", x: 50, y: 70 },
      { position: "ST", x: 50, y: 85 }
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
    name: "4-4-2 (2)",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "LM", x: 20, y: 55 },
      { position: "CDM", x: 40, y: 40 },
      { position: "CDM", x: 60, y: 40 },
      { position: "RM", x: 80, y: 55 },
      { position: "ST", x: 40, y: 80 },
      { position: "ST", x: 60, y: 80 }
    ]
  },
  {
    name: "4-5-1",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "LM", x: 15, y: 50 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 50, y: 45 },
      { position: "CM", x: 65, y: 50 },
      { position: "RM", x: 85, y: 50 },
      { position: "ST", x: 50, y: 80 }
    ]
  },
  {
    name: "4-5-1 (2)",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LB", x: 20, y: 25 },
      { position: "CB", x: 35, y: 25 },
      { position: "CB", x: 65, y: 25 },
      { position: "RB", x: 80, y: 25 },
      { position: "LM", x: 15, y: 50 },
      { position: "CDM", x: 35, y: 40 },
      { position: "CAM", x: 50, y: 55 },
      { position: "CDM", x: 65, y: 40 },
      { position: "RM", x: 85, y: 50 },
      { position: "ST", x: 50, y: 80 }
    ]
  },
  {
    name: "5-2-1-2",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LWB", x: 15, y: 25 },
      { position: "CB", x: 30, y: 20 },
      { position: "CB", x: 50, y: 18 },
      { position: "CB", x: 70, y: 20 },
      { position: "RWB", x: 85, y: 25 },
      { position: "CM", x: 40, y: 45 },
      { position: "CM", x: 60, y: 45 },
      { position: "CAM", x: 50, y: 65 },
      { position: "ST", x: 40, y: 80 },
      { position: "ST", x: 60, y: 80 }
    ]
  },
  {
    name: "5-2-2-1",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LWB", x: 15, y: 25 },
      { position: "CB", x: 30, y: 20 },
      { position: "CB", x: 50, y: 18 },
      { position: "CB", x: 70, y: 20 },
      { position: "RWB", x: 85, y: 25 },
      { position: "CM", x: 40, y: 45 },
      { position: "CM", x: 60, y: 45 },
      { position: "LF", x: 35, y: 70 },
      { position: "RF", x: 65, y: 70 },
      { position: "ST", x: 50, y: 85 }
    ]
  },
  {
    name: "5-3-2",
    positions: [
      { position: "GK", x: 50, y: 10 },
      { position: "LWB", x: 15, y: 25 },
      { position: "CB", x: 30, y: 20 },
      { position: "CB", x: 50, y: 18 },
      { position: "CB", x: 70, y: 20 },
      { position: "RWB", x: 85, y: 25 },
      { position: "CM", x: 35, y: 50 },
      { position: "CM", x: 50, y: 45 },
      { position: "CM", x: 65, y: 50 },
      { position: "ST", x: 40, y: 80 },
      { position: "ST", x: 60, y: 80 }
    ]
  }
];
