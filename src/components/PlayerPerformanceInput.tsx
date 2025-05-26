
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlayerPerformance } from '@/types/futChampions';
import { Users, Plus, Trash2 } from 'lucide-react';

interface PlayerPerformanceInputProps {
  players: PlayerPerformance[];
  onChange: (players: PlayerPerformance[]) => void;
}

const PlayerPerformanceInput = ({ players, onChange }: PlayerPerformanceInputProps) => {
  const addPlayer = () => {
    const newPlayer: PlayerPerformance = {
      id: `player-${Date.now()}`,
      name: '',
      position: '',
      rating: 6.0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      ownGoals: 0,
      minutesPlayed: 90,
      wasSubstituted: false
    };
    onChange([...players, newPlayer]);
  };

  const updatePlayer = (index: number, field: keyof PlayerPerformance, value: any) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };
    onChange(updatedPlayers);
  };

  const removePlayer = (index: number) => {
    onChange(players.filter((_, i) => i !== index));
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="h-5 w-5 text-fifa-green" />
          Player Performances
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {players.map((player, index) => (
          <div key={player.id} className="p-4 bg-white/5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-fifa-blue border-fifa-blue">
                Player {index + 1}
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
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-gray-300 text-xs">Name</Label>
                <Input
                  placeholder="Player name"
                  value={player.name}
                  onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                  className="bg-white/10 border-white/20 text-white h-8"
                />
              </div>
              
              <div>
                <Label className="text-gray-300 text-xs">Position</Label>
                <Input
                  placeholder="e.g. ST, CM"
                  value={player.position}
                  onChange={(e) => updatePlayer(index, 'position', e.target.value)}
                  className="bg-white/10 border-white/20 text-white h-8"
                />
              </div>
              
              <div>
                <Label className="text-gray-300 text-xs">Rating (0-10)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={player.rating}
                  onChange={(e) => updatePlayer(index, 'rating', parseFloat(e.target.value) || 0)}
                  className="bg-white/10 border-white/20 text-white h-8"
                />
              </div>
              
              <div>
                <Label className="text-gray-300 text-xs">Goals</Label>
                <Input
                  type="number"
                  min="0"
                  value={player.goals}
                  onChange={(e) => updatePlayer(index, 'goals', parseInt(e.target.value) || 0)}
                  className="bg-white/10 border-white/20 text-white h-8"
                />
              </div>
              
              <div>
                <Label className="text-gray-300 text-xs">Assists</Label>
                <Input
                  type="number"
                  min="0"
                  value={player.assists}
                  onChange={(e) => updatePlayer(index, 'assists', parseInt(e.target.value) || 0)}
                  className="bg-white/10 border-white/20 text-white h-8"
                />
              </div>
              
              <div>
                <Label className="text-gray-300 text-xs">Minutes</Label>
                <Input
                  type="number"
                  min="0"
                  max="120"
                  value={player.minutesPlayed}
                  onChange={(e) => updatePlayer(index, 'minutesPlayed', parseInt(e.target.value) || 0)}
                  className="bg-white/10 border-white/20 text-white h-8"
                />
              </div>
              
              <div>
                <Label className="text-gray-300 text-xs">Yellow Cards</Label>
                <Input
                  type="number"
                  min="0"
                  max="2"
                  value={player.yellowCards}
                  onChange={(e) => updatePlayer(index, 'yellowCards', parseInt(e.target.value) || 0)}
                  className="bg-white/10 border-white/20 text-white h-8"
                />
              </div>
              
              <div>
                <Label className="text-gray-300 text-xs">Red Cards</Label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  value={player.redCards}
                  onChange={(e) => updatePlayer(index, 'redCards', parseInt(e.target.value) || 0)}
                  className="bg-white/10 border-white/20 text-white h-8"
                />
              </div>
              
              <div>
                <Label className="text-gray-300 text-xs">Own Goals</Label>
                <Input
                  type="number"
                  min="0"
                  value={player.ownGoals}
                  onChange={(e) => updatePlayer(index, 'ownGoals', parseInt(e.target.value) || 0)}
                  className="bg-white/10 border-white/20 text-white h-8"
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addPlayer}
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlayerPerformanceInput;
