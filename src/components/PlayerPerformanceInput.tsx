
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

  const incrementValue = (index: number, field: keyof PlayerPerformance, increment: number) => {
    const player = players[index];
    const currentValue = player[field] as number;
    let newValue = currentValue + increment;
    
    // Apply constraints based on field type
    if (field === 'rating') {
      newValue = Math.max(1, Math.min(10, newValue));
      newValue = Math.round(newValue * 10) / 10; // Round to 1 decimal place
    } else if (field === 'minutesPlayed') {
      newValue = Math.max(0, Math.min(120, newValue));
    } else {
      newValue = Math.max(0, newValue);
    }
    
    updatePlayer(index, field, newValue);
  };

  const handleDirectInput = (index: number, field: keyof PlayerPerformance, value: string) => {
    let parsedValue: any = value;
    
    if (field === 'rating') {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 6.0;
      parsedValue = Math.max(1, Math.min(10, parsedValue));
    } else if (['minutesPlayed', 'goals', 'assists', 'yellowCards', 'redCards', 'ownGoals'].includes(field)) {
      parsedValue = parseInt(value);
      if (isNaN(parsedValue)) parsedValue = 0;
      parsedValue = Math.max(0, parsedValue);
      if (field === 'minutesPlayed') {
        parsedValue = Math.min(120, parsedValue);
      }
    }
    
    updatePlayer(index, field, parsedValue);
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
                {player.position || `Player ${index + 1}`}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removePlayer(index);
                }}
                className="text-fifa-red hover:text-fifa-red hover:bg-fifa-red/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-white text-xs">Player Name</Label>
                <Input
                  value={player.name}
                  onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                  placeholder="Player name"
                  className="bg-gray-800 border-gray-600 text-white text-sm"
                />
              </div>
              
              <div>
                <Label className="text-white text-xs">Position</Label>
                <Input
                  value={player.position}
                  onChange={(e) => updatePlayer(index, 'position', e.target.value)}
                  placeholder="e.g. ST, CM"
                  className="bg-gray-800 border-gray-600 text-white text-sm"
                />
              </div>

              <div>
                <Label className="text-white text-xs">Minutes</Label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      incrementValue(index, 'minutesPlayed', -5);
                    }}
                    className="h-8 w-8 p-0 text-fifa-red hover:bg-fifa-red/10"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    max="120"
                    value={player.minutesPlayed}
                    onChange={(e) => handleDirectInput(index, 'minutesPlayed', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-center text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      incrementValue(index, 'minutesPlayed', 5);
                    }}
                    className="h-8 w-8 p-0 text-fifa-green hover:bg-fifa-green/10"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-white text-xs">Rating</Label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      incrementValue(index, 'rating', -0.1);
                    }}
                    className="h-8 w-8 p-0 text-fifa-red hover:bg-fifa-red/10"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={player.rating.toFixed(1)}
                    onChange={(e) => handleDirectInput(index, 'rating', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-center text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      incrementValue(index, 'rating', 0.1);
                    }}
                    className="h-8 w-8 p-0 text-fifa-green hover:bg-fifa-green/10"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-white text-xs">Goals</Label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      incrementValue(index, 'goals', -1);
                    }}
                    className="h-8 w-8 p-0 text-fifa-red hover:bg-fifa-red/10"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    value={player.goals}
                    onChange={(e) => handleDirectInput(index, 'goals', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-center text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      incrementValue(index, 'goals', 1);
                    }}
                    className="h-8 w-8 p-0 text-fifa-green hover:bg-fifa-green/10"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-white text-xs">Assists</Label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      incrementValue(index, 'assists', -1);
                    }}
                    className="h-8 w-8 p-0 text-fifa-red hover:bg-fifa-red/10"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    value={player.assists}
                    onChange={(e) => handleDirectInput(index, 'assists', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-center text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      incrementValue(index, 'assists', 1);
                    }}
                    className="h-8 w-8 p-0 text-fifa-green hover:bg-fifa-green/10"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-white text-xs">Yellow Cards</Label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      incrementValue(index, 'yellowCards', -1);
                    }}
                    className="h-8 w-8 p-0 text-fifa-red hover:bg-fifa-red/10"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    value={player.yellowCards}
                    onChange={(e) => handleDirectInput(index, 'yellowCards', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-center text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      incrementValue(index, 'yellowCards', 1);
                    }}
                    className="h-8 w-8 p-0 text-fifa-green hover:bg-fifa-green/10"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-white text-xs">Red Cards</Label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      incrementValue(index, 'redCards', -1);
                    }}
                    className="h-8 w-8 p-0 text-fifa-red hover:bg-fifa-red/10"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    value={player.redCards}
                    onChange={(e) => handleDirectInput(index, 'redCards', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-center text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      incrementValue(index, 'redCards', 1);
                    }}
                    className="h-8 w-8 p-0 text-fifa-green hover:bg-fifa-green/10"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <Button
          type="button"
          onClick={addPlayer}
          variant="outline"
          className="w-full border-fifa-blue text-fifa-blue hover:bg-fifa-blue/10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlayerPerformanceInput;
