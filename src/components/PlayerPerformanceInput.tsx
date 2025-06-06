
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlayerPerformance } from '@/types/futChampions';
import { Users, Plus, Trash2, Minus } from 'lucide-react';

interface PlayerPerformanceInputProps {
  players: PlayerPerformance[];
  onChange: (players: PlayerPerformance[]) => void;
}

const PlayerPerformanceInput = ({ players, onChange }: PlayerPerformanceInputProps) => {
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
      minutesPlayed: 0,
      wasSubstituted: false
    };
    onChange([...players, newPlayer]);
  };

  const updatePlayer = (index: number, field: keyof PlayerPerformance, value: any) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    onChange(newPlayers);
  };

  const removePlayer = (index: number) => {
    const newPlayers = players.filter((_, i) => i !== index);
    onChange(newPlayers);
  };

  const handleInputChange = (index: number, field: keyof PlayerPerformance, value: string) => {
    let processedValue: any = value;
    
    if (field === 'name' || field === 'position') {
      processedValue = value;
    } else if (field === 'rating') {
      const num = parseFloat(value);
      processedValue = isNaN(num) ? 0 : Math.max(1, Math.min(10, num));
    } else {
      const num = parseInt(value);
      processedValue = isNaN(num) ? 0 : Math.max(0, num);
      if (field === 'minutesPlayed') {
        processedValue = Math.min(120, processedValue);
      }
    }
    
    updatePlayer(index, field, processedValue);
  };

  const adjustValue = (index: number, field: keyof PlayerPerformance, delta: number) => {
    const currentValue = players[index][field] as number;
    let newValue = currentValue + delta;
    
    if (field === 'rating') {
      newValue = Math.max(1, Math.min(10, newValue));
      newValue = Math.round(newValue * 10) / 10;
    } else if (field === 'minutesPlayed') {
      newValue = Math.max(0, Math.min(120, newValue));
    } else {
      newValue = Math.max(0, newValue);
    }
    
    updatePlayer(index, field, newValue);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-fifa-green" />
            Player Performances
          </CardTitle>
          <Button
            type="button"
            onClick={addPlayer}
            size="sm"
            className="bg-fifa-green hover:bg-fifa-green/80 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Substitute
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {players.length === 0 ? (
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
          players.map((player, index) => (
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
                    onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    placeholder="Enter player name"
                    className="bg-gray-800 border-gray-600 text-white h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Position</Label>
                  <Input
                    value={player.position}
                    onChange={(e) => handleInputChange(index, 'position', e.target.value)}
                    placeholder="e.g. ST, CM, CB, SUB"
                    className="bg-gray-800 border-gray-600 text-white h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Minutes Played</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'minutesPlayed', -5)}
                      className="w-10 h-10 p-0 border-gray-600 text-fifa-red hover:bg-fifa-red/10 flex-shrink-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      max="120"
                      value={player.minutesPlayed}
                      onChange={(e) => handleInputChange(index, 'minutesPlayed', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white text-center h-10 w-16 text-sm font-semibold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'minutesPlayed', 5)}
                      className="w-10 h-10 p-0 border-gray-600 text-fifa-green hover:bg-fifa-green/10 flex-shrink-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="space-y-2">
                  <Label className="text-white text-xs font-medium">Rating</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'rating', -0.1)}
                      className="w-8 h-8 p-0 border-gray-600 text-fifa-red hover:bg-fifa-red/10 flex-shrink-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={player.rating}
                      onChange={(e) => handleInputChange(index, 'rating', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white text-center h-8 w-14 text-xs font-semibold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'rating', 0.1)}
                      className="w-8 h-8 p-0 border-gray-600 text-fifa-green hover:bg-fifa-green/10 flex-shrink-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-xs font-medium">Goals</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'goals', -1)}
                      className="w-8 h-8 p-0 border-gray-600 text-fifa-red hover:bg-fifa-red/10 flex-shrink-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={player.goals}
                      onChange={(e) => handleInputChange(index, 'goals', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white text-center h-8 w-14 text-xs font-semibold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'goals', 1)}
                      className="w-8 h-8 p-0 border-gray-600 text-fifa-green hover:bg-fifa-green/10 flex-shrink-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-xs font-medium">Assists</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'assists', -1)}
                      className="w-8 h-8 p-0 border-gray-600 text-fifa-red hover:bg-fifa-red/10 flex-shrink-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={player.assists}
                      onChange={(e) => handleInputChange(index, 'assists', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white text-center h-8 w-14 text-xs font-semibold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'assists', 1)}
                      className="w-8 h-8 p-0 border-gray-600 text-fifa-green hover:bg-fifa-green/10 flex-shrink-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-xs font-medium">Yellow</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'yellowCards', -1)}
                      className="w-8 h-8 p-0 border-gray-600 text-fifa-red hover:bg-fifa-red/10 flex-shrink-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      max="2"
                      value={player.yellowCards}
                      onChange={(e) => handleInputChange(index, 'yellowCards', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white text-center h-8 w-14 text-xs font-semibold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'yellowCards', 1)}
                      className="w-8 h-8 p-0 border-gray-600 text-fifa-green hover:bg-fifa-green/10 flex-shrink-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-xs font-medium">Red</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'redCards', -1)}
                      className="w-8 h-8 p-0 border-gray-600 text-fifa-red hover:bg-fifa-red/10 flex-shrink-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      value={player.redCards}
                      onChange={(e) => handleInputChange(index, 'redCards', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white text-center h-8 w-14 text-xs font-semibold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'redCards', 1)}
                      className="w-8 h-8 p-0 border-gray-600 text-fifa-green hover:bg-fifa-green/10 flex-shrink-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-xs font-medium">Own Goals</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'ownGoals', -1)}
                      className="w-8 h-8 p-0 border-gray-600 text-fifa-red hover:bg-fifa-red/10 flex-shrink-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={player.ownGoals || 0}
                      onChange={(e) => handleInputChange(index, 'ownGoals', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white text-center h-8 w-14 text-xs font-semibold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustValue(index, 'ownGoals', 1)}
                      className="w-8 h-8 p-0 border-gray-600 text-fifa-green hover:bg-fifa-green/10 flex-shrink-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerPerformanceInput;
