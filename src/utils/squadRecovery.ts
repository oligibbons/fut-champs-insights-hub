import { Squad, PlayerCard, SquadPosition } from '@/types/squads';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// Default squad data for Week 1
export const defaultSquad: Squad = {
  id: 'squad-default-recovery',
  name: 'Week 1 Squad',
  formation: '4-3-3',
  isDefault: true,
  totalRating: 85,
  chemistry: 100,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  gamesPlayed: 15,
  wins: 12,
  losses: 3,
  startingXI: [
    { id: 'starting-0', position: 'GK', x: 50, y: 85, player: createPlayer('Alisson', 'GK', 89, 'gold') },
    { id: 'starting-1', position: 'LB', x: 20, y: 65, player: createPlayer('Robertson', 'LB', 87, 'gold') },
    { id: 'starting-2', position: 'CB', x: 40, y: 65, player: createPlayer('Van Dijk', 'CB', 90, 'gold') },
    { id: 'starting-3', position: 'CB', x: 60, y: 65, player: createPlayer('Koulibaly', 'CB', 86, 'gold') },
    { id: 'starting-4', position: 'RB', x: 80, y: 65, player: createPlayer('Alexander-Arnold', 'RB', 87, 'gold') },
    { id: 'starting-5', position: 'CM', x: 35, y: 45, player: createPlayer('De Bruyne', 'CM', 91, 'gold') },
    { id: 'starting-6', position: 'CM', x: 50, y: 45, player: createPlayer('Rodri', 'CM', 89, 'gold') },
    { id: 'starting-7', position: 'CM', x: 65, y: 45, player: createPlayer('Bellingham', 'CM', 88, 'gold') },
    { id: 'starting-8', position: 'LW', x: 25, y: 15, player: createPlayer('Vinicius Jr', 'LW', 89, 'gold') },
    { id: 'starting-9', position: 'ST', x: 50, y: 15, player: createPlayer('Haaland', 'ST', 91, 'gold') },
    { id: 'starting-10', position: 'RW', x: 75, y: 15, player: createPlayer('Salah', 'RW', 89, 'gold') },
  ],
  substitutes: [
    { id: 'sub-0', position: 'SUB', x: 0, y: 0, player: createPlayer('Ederson', 'GK', 88, 'gold') },
    { id: 'sub-1', position: 'SUB', x: 0, y: 0, player: createPlayer('Dias', 'CB', 88, 'gold') },
    { id: 'sub-2', position: 'SUB', x: 0, y: 0, player: createPlayer('Casemiro', 'CDM', 87, 'gold') },
    { id: 'sub-3', position: 'SUB', x: 0, y: 0, player: createPlayer('Modric', 'CM', 87, 'gold') },
    { id: 'sub-4', position: 'SUB', x: 0, y: 0, player: createPlayer('Mbappe', 'ST', 91, 'gold') },
    { id: 'sub-5', position: 'SUB', x: 0, y: 0, player: createPlayer('Messi', 'RW', 90, 'gold') },
    { id: 'sub-6', position: 'SUB', x: 0, y: 0, player: createPlayer('Neymar', 'LW', 87, 'gold') },
  ],
  reserves: [
    { id: 'res-0', position: 'RES', x: 0, y: 0, player: createPlayer('Courtois', 'GK', 89, 'gold') },
    { id: 'res-1', position: 'RES', x: 0, y: 0, player: createPlayer('Marquinhos', 'CB', 87, 'gold') },
    { id: 'res-2', position: 'RES', x: 0, y: 0, player: createPlayer('Kimmich', 'CDM', 88, 'gold') },
    { id: 'res-3', position: 'RES', x: 0, y: 0, player: createPlayer('Benzema', 'ST', 90, 'gold') },
    { id: 'res-4', position: 'RES', x: 0, y: 0, player: createPlayer('Son', 'LW', 87, 'gold') },
  ]
};

// Alternative squad with different formation
export const alternativeSquad: Squad = {
  id: 'squad-alternative-recovery',
  name: 'Attacking 4-2-3-1',
  formation: '4-2-3-1',
  isDefault: false,
  totalRating: 86,
  chemistry: 95,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  gamesPlayed: 5,
  wins: 3,
  losses: 2,
  startingXI: [
    { id: 'starting-0', position: 'GK', x: 50, y: 85, player: createPlayer('Alisson', 'GK', 89, 'gold') },
    { id: 'starting-1', position: 'LB', x: 20, y: 65, player: createPlayer('Davies', 'LB', 86, 'gold') },
    { id: 'starting-2', position: 'CB', x: 40, y: 65, player: createPlayer('Van Dijk', 'CB', 90, 'gold') },
    { id: 'starting-3', position: 'CB', x: 60, y: 65, player: createPlayer('Militao', 'CB', 85, 'gold') },
    { id: 'starting-4', position: 'RB', x: 80, y: 65, player: createPlayer('Hakimi', 'RB', 86, 'gold') },
    { id: 'starting-5', position: 'CDM', x: 40, y: 50, player: createPlayer('Rodri', 'CDM', 89, 'gold') },
    { id: 'starting-6', position: 'CDM', x: 60, y: 50, player: createPlayer('Kimmich', 'CDM', 88, 'gold') },
    { id: 'starting-7', position: 'CAM', x: 25, y: 25, player: createPlayer('Bruno Fernandes', 'CAM', 87, 'gold') },
    { id: 'starting-8', position: 'CAM', x: 50, y: 25, player: createPlayer('De Bruyne', 'CAM', 91, 'gold') },
    { id: 'starting-9', position: 'CAM', x: 75, y: 25, player: createPlayer('Bernardo Silva', 'CAM', 87, 'gold') },
    { id: 'starting-10', position: 'ST', x: 50, y: 15, player: createPlayer('Haaland', 'ST', 91, 'gold') },
  ],
  substitutes: [
    { id: 'sub-0', position: 'SUB', x: 0, y: 0, player: createPlayer('Ederson', 'GK', 88, 'gold') },
    { id: 'sub-1', position: 'SUB', x: 0, y: 0, player: createPlayer('Cancelo', 'RB', 86, 'gold') },
    { id: 'sub-2', position: 'SUB', x: 0, y: 0, player: createPlayer('Casemiro', 'CDM', 87, 'gold') },
    { id: 'sub-3', position: 'SUB', x: 0, y: 0, player: createPlayer('Modric', 'CM', 87, 'gold') },
    { id: 'sub-4', position: 'SUB', x: 0, y: 0, player: createPlayer('Mbappe', 'ST', 91, 'gold') },
    { id: 'sub-5', position: 'SUB', x: 0, y: 0, player: createPlayer('Messi', 'RW', 90, 'gold') },
    { id: 'sub-6', position: 'SUB', x: 0, y: 0, player: createPlayer('Neymar', 'LW', 87, 'gold') },
  ],
  reserves: [
    { id: 'res-0', position: 'RES', x: 0, y: 0, player: createPlayer('Courtois', 'GK', 89, 'gold') },
    { id: 'res-1', position: 'RES', x: 0, y: 0, player: createPlayer('Marquinhos', 'CB', 87, 'gold') },
    { id: 'res-2', position: 'RES', x: 0, y: 0, player: createPlayer('Kante', 'CDM', 87, 'gold') },
    { id: 'res-3', position: 'RES', x: 0, y: 0, player: createPlayer('Benzema', 'ST', 90, 'gold') },
    { id: 'res-4', position: 'RES', x: 0, y: 0, player: createPlayer('Son', 'LW', 87, 'gold') },
  ]
};

// Function to create a player card
function createPlayer(name: string, position: string, rating: number, cardType: string): PlayerCard {
  return {
    id: `player-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    name,
    position,
    rating,
    cardType: cardType as any,
    club: 'Various',
    league: 'Various',
    nationality: 'Various',
    pace: 80,
    shooting: 80,
    passing: 80,
    dribbling: 80,
    defending: 80,
    physical: 80,
    price: 0,
    goals: 0,
    assists: 0,
    averageRating: 0,
    yellowCards: 0,
    redCards: 0,
    minutesPlayed: 0,
    wins: 0,
    losses: 0,
    cleanSheets: 0,
    imageUrl: '',
    lastUsed: new Date().toISOString()
  };
}

// Function to save squads to localStorage and Supabase
export async function recoverSquads(userId?: string) {
  // Save to localStorage
  const squads = [defaultSquad, alternativeSquad];
  localStorage.setItem('fc25-squads-null', JSON.stringify(squads));
  
  // If user is logged in, save to Supabase
  if (userId) {
    try {
      // First, check if squads already exist
      const { data: existingSquads } = await supabase
        .from('squads')
        .select('id')
        .eq('user_id', userId);
      
      if (!existingSquads || existingSquads.length === 0) {
        // Save squads to Supabase
        for (const squad of squads) {
          const squadData = { ...squad };
          delete squadData.id; // Remove id to avoid duplication
          
          await supabase
            .from('squads')
            .upsert({
              id: squad.id,
              user_id: userId,
              name: squad.name,
              formation: squad.formation,
              is_default: squad.isDefault,
              description: JSON.stringify(squadData),
              last_used: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_at: squad.createdAt
            });
        }
      }
      
      // Save players to Supabase
      const allPlayers: PlayerCard[] = [];
      
      // Collect all players from both squads
      squads.forEach(squad => {
        squad.startingXI.forEach(pos => {
          if (pos.player) allPlayers.push(pos.player);
        });
        
        squad.substitutes.forEach(pos => {
          if (pos.player) allPlayers.push(pos.player);
        });
        
        squad.reserves.forEach(pos => {
          if (pos.player) allPlayers.push(pos.player);
        });
      });
      
      // Remove duplicates by name
      const uniquePlayers = allPlayers.filter((player, index, self) =>
        index === self.findIndex(p => p.name === player.name)
      );
      
      // Save to localStorage
      localStorage.setItem('fc25-players-null', JSON.stringify(uniquePlayers));
      
      // Save to Supabase
      for (const player of uniquePlayers) {
        await supabase
          .from('players')
          .upsert({
            id: player.id,
            user_id: userId,
            name: player.name,
            position: player.position,
            rating: player.rating,
            card_type: player.cardType,
            club: player.club,
            league: player.league,
            nationality: player.nationality,
            pace: player.pace,
            shooting: player.shooting,
            passing: player.passing,
            dribbling: player.dribbling,
            defending: player.defending,
            physical: player.physical,
            price: player.price,
            last_used: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error saving recovered squads to Supabase:', error);
    }
  }
  
  return squads;
}

// Squad Selection Dialog Component
export const SquadSelectionDialog = ({ 
  isOpen, 
  onClose, 
  squads, 
  onSelectSquad 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  squads: Squad[]; 
  onSelectSquad: (squad: Squad) => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Select Squad to Restore</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <p className="text-gray-400">Choose a squad to restore from the available options:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {squads.map((squad) => (
              <div 
                key={squad.id}
                className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-fifa-blue cursor-pointer transition-colors"
                onClick={() => onSelectSquad(squad)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-medium">{squad.name}</h3>
                  <Badge className="bg-fifa-blue">{squad.formation}</Badge>
                </div>
                
                <div className="text-sm text-gray-400 mb-3">
                  {squad.startingXI.filter(pos => pos.player).length}/11 players
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {squad.startingXI
                    .filter(pos => pos.player)
                    .slice(0, 5)
                    .map((pos) => (
                      <Badge key={pos.id} variant="outline" className="text-xs text-gray-300 border-gray-600">
                        {pos.player?.name}
                      </Badge>
                    ))}
                  {squad.startingXI.filter(pos => pos.player).length > 5 && (
                    <Badge variant="outline" className="text-xs text-gray-300 border-gray-600">
                      +{squad.startingXI.filter(pos => pos.player).length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-400">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};