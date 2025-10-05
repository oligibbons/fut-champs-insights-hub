export interface PlayerCard {
  id: string;
  name: string;
  position: string;
  rating: number;
  card_type: string; // CORRECTED: Was cardType
  club: string;
  league: string;
  nationality: string;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  price?: number;
  goals: number;
  assists: number;
  averageRating: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  wins: number;
  losses: number;
  cleanSheets: number;
  imageUrl: string;
  lastUsed?: string;
  isEvolution?: boolean;
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
  isDefault: boolean;
  totalRating: number;
  chemistry: number;
  createdAt: string;
  updatedAt: string;
  lastModified: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  created?: string; // legacy field
  game_version?: string; // Added to match filter
  user_id?: string;
}

export type Formation = string;

export interface FormationData {
  name: string;
  positions: SquadPosition[];
}

// Your full list of FORMATIONS is preserved here...
export const FORMATIONS: FormationData[] = [
    { name: '3-1-4-2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'cb1', position: 'CB', x: 30, y: 65 }, { id: 'cb2', position: 'CB', x: 50, y: 65 }, { id: 'cb3', position: 'CB', x: 70, y: 65 }, { id: 'cdm', position: 'CDM', x: 50, y: 50 }, { id: 'lm', position: 'LM', x: 15, y: 40 }, { id: 'cm1', position: 'CM', x: 35, y: 35 }, { id: 'cm2', position: 'CM', x: 65, y: 35 }, { id: 'rm', position: 'RM', x: 85, y: 40 }, { id: 'st1', position: 'ST', x: 40, y: 15 }, { id: 'st2', position: 'ST', x: 60, y: 15 } ] },
    { name: '3-4-1-2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'cb1', position: 'CB', x: 30, y: 65 }, { id: 'cb2', position: 'CB', x: 50, y: 65 }, { id: 'cb3', position: 'CB', x: 70, y: 65 }, { id: 'lm', position: 'LM', x: 15, y: 45 }, { id: 'cm1', position: 'CM', x: 35, y: 45 }, { id: 'cm2', position: 'CM', x: 65, y: 45 }, { id: 'rm', position: 'RM', x: 85, y: 45 }, { id: 'cam', position: 'CAM', x: 50, y: 30 }, { id: 'st1', position: 'ST', x: 40, y: 15 }, { id: 'st2', position: 'ST', x: 60, y: 15 } ] },
    { name: '3-4-2-1', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'cb1', position: 'CB', x: 30, y: 65 }, { id: 'cb2', position: 'CB', x: 50, y: 65 }, { id: 'cb3', position: 'CB', x: 70, y: 65 }, { id: 'lm', position: 'LM', x: 15, y: 45 }, { id: 'cm1', position: 'CM', x: 35, y: 45 }, { id: 'cm2', position: 'CM', x: 65, y: 45 }, { id: 'rm', position: 'RM', x: 85, y: 45 }, { id: 'cam1', position: 'CAM', x: 35, y: 25 }, { id: 'cam2', position: 'CAM', x: 65, y: 25 }, { id: 'st', position: 'ST', x: 50, y: 15 } ] },
    { name: '3-4-3', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'cb1', position: 'CB', x: 30, y: 65 }, { id: 'cb2', position: 'CB', x: 50, y: 65 }, { id: 'cb3', position: 'CB', x: 70, y: 65 }, { id: 'lm', position: 'LM', x: 15, y: 45 }, { id: 'cm1', position: 'CM', x: 35, y: 45 }, { id: 'cm2', position: 'CM', x: 65, y: 45 }, { id: 'rm', position: 'RM', x: 85, y: 45 }, { id: 'lw', position: 'LW', x: 25, y: 15 }, { id: 'st', position: 'ST', x: 50, y: 15 }, { id: 'rw', position: 'RW', x: 75, y: 15 } ] },
    { name: '3-5-2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'cb1', position: 'CB', x: 30, y: 65 }, { id: 'cb2', position: 'CB', x: 50, y: 65 }, { id: 'cb3', position: 'CB', x: 70, y: 65 }, { id: 'cdm1', position: 'CDM', x: 35, y: 50 }, { id: 'cdm2', position: 'CDM', x: 65, y: 50 }, { id: 'lm', position: 'LM', x: 15, y: 35 }, { id: 'cam', position: 'CAM', x: 50, y: 35 }, { id: 'rm', position: 'RM', x: 85, y: 35 }, { id: 'st1', position: 'ST', x: 40, y: 15 }, { id: 'st2', position: 'ST', x: 60, y: 15 } ] },
    { name: '4-1-2-1-2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cdm', position: 'CDM', x: 50, y: 50 }, { id: 'lm', position: 'LM', x: 25, y: 35 }, { id: 'rm', position: 'RM', x: 75, y: 35 }, { id: 'cam', position: 'CAM', x: 50, y: 30 }, { id: 'st1', position: 'ST', x: 40, y: 15 }, { id: 'st2', position: 'ST', x: 60, y: 15 } ] },
    { name: '4-1-2-1-2 2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cdm', position: 'CDM', x: 50, y: 50 }, { id: 'cm1', position: 'CM', x: 35, y: 35 }, { id: 'cm2', position: 'CM', x: 65, y: 35 }, { id: 'cam', position: 'CAM', x: 50, y: 25 }, { id: 'st1', position: 'ST', x: 40, y: 15 }, { id: 'st2', position: 'ST', x: 60, y: 15 } ] },
    { name: '4-1-3-2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cdm', position: 'CDM', x: 50, y: 50 }, { id: 'lm', position: 'LM', x: 25, y: 35 }, { id: 'cm', position: 'CM', x: 50, y: 35 }, { id: 'rm', position: 'RM', x: 75, y: 35 }, { id: 'st1', position: 'ST', x: 40, y: 15 }, { id: 'st2', position: 'ST', x: 60, y: 15 } ] },
    { name: '4-1-4-1', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cdm', position: 'CDM', x: 50, y: 50 }, { id: 'lm', position: 'LM', x: 20, y: 35 }, { id: 'cm1', position: 'CM', x: 40, y: 35 }, { id: 'cm2', position: 'CM', x: 60, y: 35 }, { id: 'rm', position: 'RM', x: 80, y: 35 }, { id: 'st', position: 'ST', x: 50, y: 15 } ] },
    { name: '4-2-1-3', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cdm1', position: 'CDM', x: 40, y: 50 }, { id: 'cdm2', position: 'CDM', x: 60, y: 50 }, { id: 'cam', position: 'CAM', x: 50, y: 30 }, { id: 'lw', position: 'LW', x: 25, y: 15 }, { id: 'st', position: 'ST', x: 50, y: 15 }, { id: 'rw', position: 'RW', x: 75, y: 15 } ] },
    { name: '4-2-2-2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cdm1', position: 'CDM', x: 40, y: 50 }, { id: 'cdm2', position: 'CDM', x: 60, y: 50 }, { id: 'cam1', position: 'CAM', x: 35, y: 30 }, { id: 'cam2', position: 'CAM', x: 65, y: 30 }, { id: 'st1', position: 'ST', x: 40, y: 15 }, { id: 'st2', position: 'ST', x: 60, y: 15 } ] },
    { name: '4-2-3-1', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cdm1', position: 'CDM', x: 40, y: 50 }, { id: 'cdm2', position: 'CDM', x: 60, y: 50 }, { id: 'cam1', position: 'CAM', x: 25, y: 25 }, { id: 'cam2', position: 'CAM', x: 50, y: 25 }, { id: 'cam3', position: 'CAM', x: 75, y: 25 }, { id: 'st', position: 'ST', x: 50, y: 15 } ] },
    { name: '4-2-3-1 2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cdm1', position: 'CDM', x: 40, y: 50 }, { id: 'cdm2', position: 'CDM', x: 60, y: 50 }, { id: 'lm', position: 'LM', x: 25, y: 25 }, { id: 'cam', position: 'CAM', x: 50, y: 25 }, { id: 'rm', position: 'RM', x: 75, y: 25 }, { id: 'st', position: 'ST', x: 50, y: 15 } ] },
    { name: '4-2-4', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cm1', position: 'CM', x: 40, y: 45 }, { id: 'cm2', position: 'CM', x: 60, y: 45 }, { id: 'lw', position: 'LW', x: 25, y: 15 }, { id: 'st1', position: 'ST', x: 40, y: 15 }, { id: 'st2', position: 'ST', x: 60, y: 15 }, { id: 'rw', position: 'RW', x: 75, y: 15 } ] },
    { name: '4-3-1-2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cm1', position: 'CM', x: 35, y: 45 }, { id: 'cm2', position: 'CM', x: 50, y: 45 }, { id: 'cm3', position: 'CM', x: 65, y: 45 }, { id: 'cam', position: 'CAM', x: 50, y: 25 }, { id: 'st1', position: 'ST', x: 40, y: 15 }, { id: 'st2', position: 'ST', x: 60, y: 15 } ] },
    { name: '4-3-2-1', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cm1', position: 'CM', x: 35, y: 45 }, { id: 'cm2', position: 'CM', x: 50, y: 45 }, { id: 'cm3', position: 'CM', x: 65, y: 45 }, { id: 'cam1', position: 'CAM', x: 40, y: 25 }, { id: 'cam2', position: 'CAM', x: 60, y: 25 }, { id: 'st', position: 'ST', x: 50, y: 15 } ] },
    { name: '4-3-3', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cm1', position: 'CM', x: 35, y: 45 }, { id: 'cm2', position: 'CM', x: 50, y: 45 }, { id: 'cm3', position: 'CM', x: 65, y: 45 }, { id: 'lw', position: 'LW', x: 25, y: 15 }, { id: 'st', position: 'ST', x: 50, y: 15 }, { id: 'rw', position: 'RW', x: 75, y: 15 } ] },
    { name: '4-3-3 2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cdm', position: 'CDM', x: 50, y: 50 }, { id: 'cm1', position: 'CM', x: 35, y: 40 }, { id: 'cm2', position: 'CM', x: 65, y: 40 }, { id: 'lw', position: 'LW', x: 25, y: 15 }, { id: 'st', position: 'ST', x: 50, y: 15 }, { id: 'rw', position: 'RW', x: 75, y: 15 } ] },
    { name: '4-3-3 3', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cdm1', position: 'CDM', x: 40, y: 50 }, { id: 'cdm2', position: 'CDM', x: 60, y: 50 }, { id: 'cm', position: 'CM', x: 50, y: 40 }, { id: 'lw', position: 'LW', x: 25, y: 15 }, { id: 'st', position: 'ST', x: 50, y: 15 }, { id: 'rw', position: 'RW', x: 75, y: 15 } ] },
    { name: '4-3-3 4', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cm1', position: 'CM', x: 35, y: 45 }, { id: 'cm2', position: 'CM', x: 65, y: 45 }, { id: 'cam', position: 'CAM', x: 50, y: 35 }, { id: 'lw', position: 'LW', x: 25, y: 15 }, { id: 'st', position: 'ST', x: 50, y: 15 }, { id: 'rw', position: 'RW', x: 75, y: 15 } ] },
    { name: '4-4-1-1 2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cm1', position: 'CM', x: 35, y: 45 }, { id: 'cm2', position: 'CM', x: 65, y: 45 }, { id: 'lm', position: 'LM', x: 20, y: 35 }, { id: 'rm', position: 'RM', x: 80, y: 35 }, { id: 'cam', position: 'CAM', x: 50, y: 25 }, { id: 'st', position: 'ST', x: 50, y: 15 } ] },
    { name: '4-4-2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cm1', position: 'CM', x: 35, y: 45 }, { id: 'cm2', position: 'CM', x: 65, y: 45 }, { id: 'lm', position: 'LM', x: 20, y: 35 }, { id: 'rm', position: 'RM', x: 80, y: 35 }, { id: 'st1', position: 'ST', x: 40, y: 15 }, { id: 'st2', position: 'ST', x: 60, y: 15 } ] },
    { name: '4-4-2 2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cdm1', position: 'CDM', x: 35, y: 45 }, { id: 'cdm2', position: 'CDM', x: 65, y: 45 }, { id: 'lm', position: 'LM', x: 20, y: 35 }, { id: 'rm', position: 'RM', x: 80, y: 35 }, { id: 'st1', position: 'ST', x: 40, y: 15 }, { id: 'st2', position: 'ST', x: 60, y: 15 } ] },
    { name: '4-5-1', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cm', position: 'CM', x: 50, y: 45 }, { id: 'lm', position: 'LM', x: 20, y: 35 }, { id: 'cam1', position: 'CAM', x: 35, y: 30 }, { id: 'cam2', position: 'CAM', x: 65, y: 30 }, { id: 'rm', position: 'RM', x: 80, y: 35 }, { id: 'st', position: 'ST', x: 50, y: 15 } ] },
    { name: '4-5-1 2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 20, y: 65 }, { id: 'cb1', position: 'CB', x: 40, y: 65 }, { id: 'cb2', position: 'CB', x: 60, y: 65 }, { id: 'rb', position: 'RB', x: 80, y: 65 }, { id: 'cm1', position: 'CM', x: 35, y: 40 }, { id: 'cm2', position: 'CM', x: 50, y: 40 }, { id: 'cm3', position: 'CM', x: 65, y: 40 }, { id: 'lm', position: 'LM', x: 20, y: 30 }, { id: 'rm', position: 'RM', x: 80, y: 30 }, { id: 'st', position: 'ST', x: 50, y: 15 } ] },
    { name: '5-2-1-2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 15, y: 65 }, { id: 'cb1', position: 'CB', x: 35, y: 65 }, { id: 'cb2', position: 'CB', x: 50, y: 65 }, { id: 'cb3', position: 'CB', x: 65, y: 65 }, { id: 'rb', position: 'RB', x: 85, y: 65 }, { id: 'cm1', position: 'CM', x: 40, y: 45 }, { id: 'cm2', position: 'CM', x: 60, y: 45 }, { id: 'cam', position: 'CAM', x: 50, y: 25 }, { id: 'st1', position: 'ST', x: 40, y: 15 }, { id: 'st2', position: 'ST', x: 60, y: 15 } ] },
    { name: '5-2-3', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 15, y: 65 }, { id: 'cb1', position: 'CB', x: 35, y: 65 }, { id: 'cb2', position: 'CB', x: 50, y: 65 }, { id: 'cb3', position: 'CB', x: 65, y: 65 }, { id: 'rb', position: 'RB', x: 85, y: 65 }, { id: 'cm1', position: 'CM', x: 40, y: 45 }, { id: 'cm2', position: 'CM', x: 60, y: 45 }, { id: 'lw', position: 'LW', x: 25, y: 15 }, { id: 'st', position: 'ST', x: 50, y: 15 }, { id: 'rw', position: 'RW', x: 75, y: 15 } ] },
    { name: '5-3-2', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 15, y: 65 }, { id: 'cb1', position: 'CB', x: 35, y: 65 }, { id: 'cb2', position: 'CB', x: 50, y: 65 }, { id: 'cb3', position: 'CB', x: 65, y: 65 }, { id: 'rb', position: 'RB', x: 85, y: 65 }, { id: 'cdm', position: 'CDM', x: 50, y: 50 }, { id: 'cm1', position: 'CM', x: 35, y: 35 }, { id: 'cm2', position: 'CM', x: 65, y: 35 }, { id: 'st1', position: 'ST', x: 40, y: 15 }, { id: 'st2', position: 'ST', x: 60, y: 15 } ] },
    { name: '5-4-1', positions: [ { id: 'gk', position: 'GK', x: 50, y: 85 }, { id: 'lb', position: 'LB', x: 15, y: 65 }, { id: 'cb1', position: 'CB', x: 35, y: 65 }, { id: 'cb2', position: 'CB', x: 50, y: 65 }, { id: 'cb3', position: 'CB', x: 65, y: 65 }, { id: 'rb', position: 'RB', x: 85, y: 65 }, { id: 'cm1', position: 'CM', x: 35, y: 40 }, { id: 'cm2', position: 'CM', x: 65, y: 40 }, { id: 'lm', position: 'LM', x: 20, y: 30 }, { id: 'rm', position: 'RM', x: 80, y: 30 }, { id: 'st', position: 'ST', x: 50, y: 15 } ] }
];

export interface CardType {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  highlight_color: string;
  user_id: string;
  game_version: string;
  is_default?: boolean; // Added for better default handling
}
