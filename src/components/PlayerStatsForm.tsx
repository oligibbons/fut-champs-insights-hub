import React from 'react';
import { PlayerPerformance } from '@/types/futChampions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2 } from 'lucide-react';
import MobileNumberInput from './MobileNumberInput';
import { Input } from './ui/input';

interface PlayerStatsFormProps {
  playerStats: PlayerPerformance[];
  onPlayerStatsChange: (players: PlayerPerformance[]) => void;
  gameDuration?: number;
}

const PlayerStatsForm = ({ playerStats, onPlayerStatsChange, gameDuration = 90 }: PlayerStatsFormProps) => {
  const addPlayer = () => {
    const newPlayer: PlayerPerformance = {
      id: `player-${Date.now()}`,
      name: '',
      position: 'SUB',
      rating: 6.0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      ownGoals: 0,
      minutesPlayed: 0, // Default to 0 minutes for new players
      wasSubstituted: false
    };
    onPlayerStatsChange([...playerStats, newPlayer]);
  };

  const updatePlayer = (index: number, field: keyof PlayerPerformance, value: any) => {
    const newPlayers = [...playerStats];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    onPlayerStatsChange(newPlayers);
  };

  const removePlayer = (index: number) => {
    const newPlayers = playerStats.filter((_, i) => i !== index);
    onPlayerStatsChange(newPlayers);
  };

  return (
    <Card className="glass-card">
      <CardContent className="space-y-6 pt-6">
        {playerStats.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-medium text-white mb-2">No Players Added</h3>
            <p className="text-gray-400 mb-4">Add players to track their performance</p>
            <Button 
              onClick={addPlayer} 
              className="bg-fifa-green hover:bg-fifa-green/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Player
            </Button>
          </div>
        ) : (
          playerStats.map((player, index) => (
            <div key={player.id} className="p-4 bg-white/5 rounded-xl space-y-4 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-fifa-blue border-fifa-blue">
                  {player.position || `Player ${index + 1}`}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePlayer(index)}
                  className="text-fifa-red hover:text-fifa-red hover:bg-fifa-red/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Player Name</Label>
                  <Input
                    value={player.name}
                    onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                    placeholder="Enter player name"
                    className="bg-gray-800 border-gray-600 text-white h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Position</Label>
                  <Input
                    value={player.position}
                    onChange={(e) => updatePlayer(index, 'position', e.target.value)}
                    placeholder="e.g. ST, CM, CB, SUB"
                    className="bg-gray-800 border-gray-600 text-white h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Minutes Played</Label>
                  <MobileNumberInput
                    label=""
                    value={player.minutesPlayed}
                    onChange={(value) => updatePlayer(index, 'minutesPlayed', value)}
                    min={0}
                    max={gameDuration}
                    step={1}
                  />
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="space-y-2">
                  <Label className="text-white text-xs font-medium">Rating</Label>
                  <MobileNumberInput
                    label=""
                    value={player.rating}
                    onChange={(value) => updatePlayer(index, 'rating', value)}
                    min={1}
                    max={10}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-xs font-medium">Goals</Label>
                  <MobileNumberInput
                    label=""
                    value={player.goals}
                    onChange={(value) => updatePlayer(index, 'goals', value)}
                    min={0}
                    max={20}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-xs font-medium">Assists</Label>
                  <MobileNumberInput
                    label=""
                    value={player.assists}
                    onChange={(value) => updatePlayer(index, 'assists', value)}
                    min={0}
                    max={20}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-xs font-medium">Yellow</Label>
                  <MobileNumberInput
                    label=""
                    value={player.yellowCards}
                    onChange={(value) => updatePlayer(index, 'yellowCards', value)}
                    min={0}
                    max={2}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-xs font-medium">Red</Label>
                  <MobileNumberInput
                    label=""
                    value={player.redCards}
                    onChange={(value) => updatePlayer(index, 'redCards', value)}
                    min={0}
                    max={1}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-xs font-medium">Own Goals</Label>
                  <MobileNumberInput
                    label=""
                    value={player.ownGoals || 0}
                    onChange={(value) => updatePlayer(index, 'ownGoals', value)}
                    min={0}
                    max={10}
                    step={1}
                  />
                </div>
              </div>
            </div>
          ))
        )}

        {playerStats.length > 0 && (
          <Button
            type="button"
            onClick={addPlayer}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Player
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerStatsForm;