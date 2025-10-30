// src/types/squads.ts
// REMOVED: These hardcoded types are no longer needed as we fetch all card types from Supabase.
// export type PlayerCardType = 'bronze' | 'silver' | 'gold' | 'inform' | 'totw' | 'toty' | 'tots' | 'icon' | 'hero';
// export const CARD_TYPES: PlayerCardType[] = ['bronze', 'silver', 'gold', 'inform', 'totw', 'toty', 'tots', 'icon', 'hero'];

export interface PlayerCard {
  id: string;
  name: string;
  position: string;
  rating: number;
  card_type: string; // This matches your Supabase schema
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
  is_evolution?: boolean; // Matches schema
}

export interface SquadPosition {
  id: string; // e.g., 'gk', 'cb1', 'sub-0'
  position: string; // e.g., 'GK', 'CB', 'SUB'
  x: number;
  y: number;
}

// Interface for the 'squad_players' join table
export interface SquadPlayer {
  id: string; // This is the id of the join table row
  squad_id: string;
  player_id: string;
  position: string;
  slot_id: string; // This should match a SquadPosition['id']
}

// Interface for the 'squad_players' row when joined with 'players'
export interface SquadPlayerJoin extends SquadPlayer {
  players: PlayerCard;
}

export interface Squad {
  id: string;
  name: string;
  formation: string;
  is_default: boolean; // Matches schema
  total_rating: number;
  chemistry?: number; // Kept optional
  created_at: string;
  updated_at: string;
  games_played: number;
  wins: number;
  losses: number;
  game_version?: string;
  user_id?: string;
  // This is the correct, joined data structure
  squad_players: SquadPlayerJoin[]; 
  
  //--- Deprecated fields from old type? ---
  // If you are no longer using these, you can remove them.
  // If your new `squad_players` logic replaces them, definitely remove them.
  // startingXI?: SquadPosition[];
  // substitutes?: SquadPosition[];
  // reserves?: SquadPosition[];
  // lastModified?: string;
  // created?: string; 
  total_value?: number;
  average_age?: number;
  key_players?: string[];
  description?: string;
  last_used?: string;
}

export type Formation = string;

export interface FormationData {
  name: string;
  positions: SquadPosition[]; // Use the SquadPosition interface
}

// Your full list of FORMATIONS is preserved here...
// Note: The 'id' in positions should match the 'slot_id' in 'squad_players'
export const FORMATIONS: FormationData[] = [
  { name: '3-1-4-2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'CB', x: 30, y: 65 }, { id: 'starting-2', position: 'CB', x: 50, y: 65 }, { id: 'starting-3', position: 'CB', x: 70, y: 65 }, { id: 'starting-4', position: 'CDM', x: 50, y: 50 }, { id: 'starting-5', position: 'LM', x: 15, y: 40 }, { id: 'starting-6', position: 'CM', x: 35, y: 35 }, { id: 'starting-7', position: 'CM', x: 65, y: 35 }, { id: 'starting-8', position: 'RM', x: 85, y: 40 }, { id: 'starting-9', position: 'ST', x: 40, y: 15 }, { id: 'starting-10', position: 'ST', x: 60, y: 15 } ] },
  { name: '3-4-1-2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'CB', x: 30, y: 65 }, { id: 'starting-2', position: 'CB', x: 50, y: 65 }, { id: 'starting-3', position: 'CB', x: 70, y: 65 }, { id: 'starting-4', position: 'LM', x: 15, y: 45 }, { id: 'starting-5', position: 'CM', x: 35, y: 45 }, { id: 'starting-6', position: 'CM', x: 65, y: 45 }, { id: 'starting-7', position: 'RM', x: 85, y: 45 }, { id: 'starting-8', position: 'CAM', x: 50, y: 30 }, { id: 'starting-9', position: 'ST', x: 40, y: 15 }, { id: 'starting-10', position: 'ST', x: 60, y: 15 } ] },
  { name: '3-4-2-1', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'CB', x: 30, y: 65 }, { id: 'starting-2', position: 'CB', x: 50, y: 65 }, { id: 'starting-3', position: 'CB', x: 70, y: 65 }, { id: 'starting-4', position: 'LM', x: 15, y: 45 }, { id: 'starting-5', position: 'CM', x: 35, y: 45 }, { id: 'starting-6', position: 'CM', x: 65, y: 45 }, { id: 'starting-7', position: 'RM', x: 85, y: 45 }, { id: 'starting-8', position: 'CAM', x: 35, y: 25 }, { id: 'starting-9', position: 'CAM', x: 65, y: 25 }, { id: 'starting-10', position: 'ST', x: 50, y: 15 } ] },
  { name: '3-4-3', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'CB', x: 30, y: 65 }, { id: 'starting-2', position: 'CB', x: 50, y: 65 }, { id: 'starting-3', position: 'CB', x: 70, y: 65 }, { id: 'starting-4', position: 'LM', x: 15, y: 45 }, { id: 'starting-5', position: 'CM', x: 35, y: 45 }, { id: 'starting-6', position: 'CM', x: 65, y: 45 }, { id: 'starting-7', position: 'RM', x: 85, y: 45 }, { id: 'starting-8', position: 'LW', x: 25, y: 15 }, { id: 'starting-9', position: 'ST', x: 50, y: 15 }, { id: 'starting-10', position: 'RW', x: 75, y: 15 } ] },
  { name: '3-5-2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'CB', x: 30, y: 65 }, { id: 'starting-2', position: 'CB', x: 50, y: 65 }, { id: 'starting-3', position: 'CB', x: 70, y: 65 }, { id: 'starting-4', position: 'CDM', x: 35, y: 50 }, { id: 'starting-5', position: 'CDM', x: 65, y: 50 }, { id: 'starting-6', position: 'LM', x: 15, y: 35 }, { id: 'starting-7', position: 'CAM', x: 50, y: 35 }, { id: 'starting-8', position: 'RM', x: 85, y: 35 }, { id: 'starting-9', position: 'ST', x: 40, y: 15 }, { id: 'starting-10', position: 'ST', x: 60, y: 15 } ] },
  { name: '4-1-2-1-2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CDM', x: 50, y: 50 }, { id: 'starting-6', position: 'LM', x: 25, y: 35 }, { id: 'starting-7', position: 'RM', x: 75, y: 35 }, { id: 'starting-8', position: 'CAM', x: 50, y: 30 }, { id: 'starting-9', position: 'ST', x: 40, y: 15 }, { id: 'starting-10', position: 'ST', x: 60, y: 15 } ] },
  { name: '4-1-2-1-2 2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CDM', x: 50, y: 50 }, { id: 'starting-6', position: 'CM', x: 35, y: 35 }, { id: 'starting-7', position: 'CM', x: 65, y: 35 }, { id: 'starting-8', position: 'CAM', x: 50, y: 25 }, { id: 'starting-9', position: 'ST', x: 40, y: 15 }, { id: 'starting-10', position: 'ST', x: 60, y: 15 } ] },
  { name: '4-1-3-2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CDM', x: 50, y: 50 }, { id: 'starting-6', position: 'LM', x: 25, y: 35 }, { id: 'starting-7', position: 'CM', x: 50, y: 35 }, { id: 'starting-8', position: 'RM', x: 75, y: 35 }, { id: 'starting-9', position: 'ST', x: 40, y: 15 }, { id: 'starting-10', position: 'ST', x: 60, y: 15 } ] },
  { name: '4-1-4-1', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CDM', x: 50, y: 50 }, { id: 'starting-6', position: 'LM', x: 20, y: 35 }, { id: 'starting-7', position: 'CM', x: 40, y: 35 }, { id: 'starting-8', position: 'CM', x: 60, y: 35 }, { id: 'starting-9', position: 'RM', x: 80, y: 35 }, { id: 'starting-10', position: 'ST', x: 50, y: 15 } ] },
  { name: '4-2-1-3', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CDM', x: 40, y: 50 }, { id: 'starting-6', position: 'CDM', x: 60, y: 50 }, { id: 'starting-7', position: 'CAM', x: 50, y: 30 }, { id: 'starting-8', position: 'LW', x: 25, y: 15 }, { id: 'starting-9', position: 'ST', x: 50, y: 15 }, { id: 'starting-10', position: 'RW', x: 75, y: 15 } ] },
  { name: '4-2-2-2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CDM', x: 40, y: 50 }, { id: 'starting-6', position: 'CDM', x: 60, y: 50 }, { id: 'starting-7', position: 'CAM', x: 35, y: 30 }, { id: 'starting-8', position: 'CAM', x: 65, y: 30 }, { id: 'starting-9', position: 'ST', x: 40, y: 15 }, { id: 'starting-10', position: 'ST', x: 60, y: 15 } ] },
  { name: '4-2-3-1', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CDM', x: 40, y: 50 }, { id: 'starting-6', position: 'CDM', x: 60, y: 50 }, { id: 'starting-7', position: 'CAM', x: 25, y: 25 }, { id: 'starting-8', position: 'CAM', x: 50, y: 25 }, { id: 'starting-9', position: 'CAM', x: 75, y: 25 }, { id: 'starting-10', position: 'ST', x: 50, y: 15 } ] },
  { name: '4-2-3-1 2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CDM', x: 40, y: 50 }, { id: 'starting-6', position: 'CDM', x: 60, y: 50 }, { id: 'starting-7', position: 'LM', x: 25, y: 25 }, { id: 'starting-8', position: 'CAM', x: 50, y: 25 }, { id: 'starting-9', position: 'RM', x: 75, y: 25 }, { id: 'starting-10', position: 'ST', x: 50, y: 15 } ] },
  { name: '4-2-4', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CM', x: 40, y: 45 }, { id: 'starting-6', position: 'CM', x: 60, y: 45 }, { id: 'starting-7', position: 'LW', x: 25, y: 15 }, { id: 'starting-8', position: 'ST', x: 40, y: 15 }, { id: 'starting-9', position: 'ST', x: 60, y: 15 }, { id: 'starting-10', position: 'RW', x: 75, y: 15 } ] },
  { name: '4-3-1-2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CM', x: 35, y: 45 }, { id: 'starting-6', position: 'CM', x: 50, y: 45 }, { id: 'starting-7', position: 'CM', x: 65, y: 45 }, { id: 'starting-8', position: 'CAM', x: 50, y: 25 }, { id: 'starting-9', position: 'ST', x: 40, y: 15 }, { id: 'starting-10', position: 'ST', x: 60, y: 15 } ] },
  { name: '4-3-2-1', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CM', x: 35, y: 45 }, { id: 'starting-6', position: 'CM', x: 50, y: 45 }, { id: 'starting-7', position: 'CM', x: 65, y: 45 }, { id: 'starting-8', position: 'CAM', x: 40, y: 25 }, { id: 'starting-9', position: 'CAM', x: 60, y: 25 }, { id: 'starting-10', position: 'ST', x: 50, y: 15 } ] },
  { name: '4-3-3', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CM', x: 35, y: 45 }, { id: 'starting-6', position: 'CM', x: 50, y: 45 }, { id: 'starting-7', position: 'CM', x: 65, y: 45 }, { id: 'starting-8', position: 'LW', x: 25, y: 15 }, { id: 'starting-9', position: 'ST', x: 50, y: 15 }, { id: 'starting-10', position: 'RW', x: 75, y: 15 } ] },
  { name: '4-3-3 2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CDM', x: 50, y: 50 }, { id: 'starting-6', position: 'CM', x: 35, y: 40 }, { id: 'starting-7', position: 'CM', x: 65, y: 40 }, { id: 'starting-8', position: 'LW', x: 25, y: 15 }, { id: 'starting-9', position: 'ST', x: 50, y: 15 }, { id: 'starting-10', position: 'RW', x: 75, y: 15 } ] },
  { name: '4-3-3 3', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CDM', x: 40, y: 50 }, { id: 'starting-6', position: 'CDM', x: 60, y: 50 }, { id: 'starting-7', position: 'CM', x: 50, y: 40 }, { id: 'starting-8', position: 'LW', x: 25, y: 15 }, { id: 'starting-9', position: 'ST', x: 50, y: 15 }, { id: 'starting-10', position: 'RW', x: 75, y: 15 } ] },
  { name: '4-3-3 4', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CM', x: 35, y: 45 }, { id: 'starting-6', position: 'CM', x: 65, y: 45 }, { id: 'starting-7', position: 'CAM', x: 50, y: 35 }, { id: 'starting-8', position: 'LW', x: 25, y: 15 }, { id: 'starting-9', position: 'ST', x: 50, y: 15 }, { id: 'starting-10', position: 'RW', x: 75, y: 15 } ] },
  { name: '4-4-1-1 2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CM', x: 35, y: 45 }, { id: 'starting-6', position: 'CM', x: 65, y: 45 }, { id: 'starting-7', position: 'LM', x: 20, y: 35 }, { id: 'starting-8', position: 'RM', x: 80, y: 35 }, { id: 'starting-9', position: 'CAM', x: 50, y: 25 }, { id: 'starting-10', position: 'ST', x: 50, y: 15 } ] },
  { name: '4-4-2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CM', x: 35, y: 45 }, { id: 'starting-6', position: 'CM', x: 65, y: 45 }, { id: 'starting-7', position: 'LM', x: 20, y: 35 }, { id: 'starting-8', position: 'RM', x: 80, y: 35 }, { id: 'starting-9', position: 'ST', x: 40, y: 15 }, { id: 'starting-10', position: 'ST', x: 60, y: 15 } ] },
  { name: '4-4-2 2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CDM', x: 35, y: 45 }, { id: 'starting-6', position: 'CDM', x: 65, y: 45 }, { id: 'starting-7', position: 'LM', x: 20, y: 35 }, { id: 'starting-8', position: 'RM', x: 80, y: 35 }, { id: 'starting-9', position: 'ST', x: 40, y: 15 }, { id: 'starting-10', position: 'ST', x: 60, y: 15 } ] },
  { name: '4-5-1', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CM', x: 50, y: 45 }, { id: 'starting-6', position: 'LM', x: 20, y: 35 }, { id: 'starting-7', position: 'CAM', x: 35, y: 30 }, { id: 'starting-8', position: 'CAM', x: 65, y: 30 }, { id: 'starting-9', position: 'RM', x: 80, y: 35 }, { id: 'starting-10', position: 'ST', x: 50, y: 15 } ] },
  { name: '4-5-1 2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 20, y: 65 }, { id: 'starting-2', position: 'CB', x: 40, y: 65 }, { id: 'starting-3', position: 'CB', x: 60, y: 65 }, { id: 'starting-4', position: 'RB', x: 80, y: 65 }, { id: 'starting-5', position: 'CM', x: 35, y: 40 }, { id: 'starting-6', position: 'CM', x: 50, y: 40 }, { id: 'starting-7', position: 'CM', x: 65, y: 40 }, { id: 'starting-8', position: 'LM', x: 20, y: 30 }, { id: 'starting-9', position: 'RM', x: 80, y: 30 }, { id: 'starting-10', position: 'ST', x: 50, y: 15 } ] },
  { name: '5-2-1-2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 15, y: 65 }, { id: 'starting-2', position: 'CB', x: 35, y: 65 }, { id: 'starting-3', position: 'CB', x: 50, y: 65 }, { id: 'starting-4', position: 'CB', x: 65, y: 65 }, { id: 'starting-5', position: 'RB', x: 85, y: 65 }, { id: 'starting-6', position: 'CM', x: 40, y: 45 }, { id: 'starting-7', position: 'CM', x: 60, y: 45 }, { id: 'starting-8', position: 'CAM', x: 50, y: 25 }, { id: 'starting-9', position: 'ST', x: 40, y: 15 }, { id: 'starting-10', position: 'ST', x: 60, y: 15 } ] },
  { name: '5-2-3', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 15, y: 65 }, { id: 'starting-2', position: 'CB', x: 35, y: 65 }, { id: 'starting-3', position: 'CB', x: 50, y: 65 }, { id: 'starting-4', position: 'CB', x: 65, y: 65 }, { id: 'starting-5', position: 'RB', x: 85, y: 65 }, { id: 'starting-6', position: 'CM', x: 40, y: 45 }, { id: 'starting-7', position: 'CM', x: 60, y: 45 }, { id: 'starting-8', position: 'LW', x: 25, y: 15 }, { id: 'starting-9', position: 'ST', x: 50, y: 15 }, { id: 'starting-10', position: 'RW', x: 75, y: 15 } ] },
  { name: '5-3-2', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 15, y: 65 }, { id: 'starting-2', position: 'CB', x: 35, y: 65 }, { id: 'starting-3', position: 'CB', x: 50, y: 65 }, { id: 'starting-4', position: 'CB', x: 65, y: 65 }, { id: 'starting-5', position: 'RB', x: 85, y: 65 }, { id: 'starting-6', position: 'CDM', x: 50, y: 50 }, { id: 'starting-7', position: 'CM', x: 35, y: 35 }, { id: 'starting-8', position: 'CM', x: 65, y: 35 }, { id: 'starting-9', position: 'ST', x: 40, y: 15 }, { id: 'starting-10', position: 'ST', x: 60, y: 15 } ] },
  { name: '5-4-1', positions: [ { id: 'starting-0', position: 'GK', x: 50, y: 85 }, { id: 'starting-1', position: 'LB', x: 15, y: 65 }, { id: 'starting-2', position: 'CB', x: 35, y: 65 }, { id: 'starting-3', position: 'CB', x: 50, y: 65 }, { id: 'starting-4', position: 'CB', x: 65, y: 65 }, { id: 'starting-5', position: 'RB', x: 85, y: 65 }, { id: 'starting-6', position: 'CM', x: 35, y: 40 }, { id: 'starting-7', position: 'CM', x: 65, y: 40 }, { id: 'starting-8', position: 'LM', x: 20, y: 30 }, { id: 'starting-9', position: 'RM', x: 80, y: 30 }, { id: 'starting-10', position: 'ST', x: 50, y: 15 } ] }
];

export interface CardType {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  highlight_color: string;
  user_id: string;
  game_version: string;
  is_default?: boolean;
}