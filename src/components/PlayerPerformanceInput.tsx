
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

  const StatInput = ({ 
    label, 
    value, 
    onIncrement, 
    onDecrement, 
    onChange, 
    min = 0, 
    max = 999, 
    step = 1,
    type = "number"
  }: {
    label: string;
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    onChange: (value: string) => void;
    min?: number;
    max?: number;
    step?: number;
    type?: string;
  }) => (
    <div className="space-y-1">
      <Label className="text-white text-xs font-medium">{label}</Label>
      <div className="flex items-center rounded-lg border border-gray-600 bg-gray-800 overflow-hidden">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDecrement();
          }}
          className="h-8 w-8 p-0 text-fifa-red hover:bg-fifa-red/10 hover:text-fifa-red rounded-none border-r border-gray-600"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type={type}
          min={min}
          max={max}
          step={step}
          value={type === "number" && value % 1 !== 0 ? value.toFixed(1) : value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent border-0 text-white text-center text-sm h-8 flex-1 focus:ring-0 focus:border-0"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onIncrement();
          }}
          className="h-8 w-8 p-0 text-fifa-green hover:bg-fifa-green/10 hover:text-fifa-green rounded-none border-l border-gray-600"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

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
            Add Player
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {players.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-medium text-white mb-2">No Players Added</h3>
            <p className="text-gray-400 mb-4">Add players to track their performance</p>
            <Button onClick={addPlayer} className="bg-fifa-green hover:bg-fifa-green/80">
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
              
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-white text-xs font-medium">Player Name</Label>
                  <Input
                    value={player.name}
                    onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                    placeholder="Enter player name"
                    className="bg-gray-800 border-gray-600 text-white text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-white text-xs font-medium">Position</Label>
                  <Input
                    value={player.position}
                    onChange={(e) => updatePlayer(index, 'position', e.target.value)}
                    placeholder="e.g. ST, CM, CB"
                    className="bg-gray-800 border-gray-600 text-white text-sm"
                  />
                </div>

                <StatInput
                  label="Minutes Played"
                  value={player.minutesPlayed}
                  onIncrement={() => incrementValue(index, 'minutesPlayed', 5)}
                  onDecrement={() => incrementValue(index, 'minutesPlayed', -5)}
                  onChange={(value) => handleDirectInput(index, 'minutesPlayed', value)}
                  min={0}
                  max={120}
                />
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatInput
                  label="Rating"
                  value={player.rating}
                  onIncrement={() => incrementValue(index, 'rating', 0.1)}
                  onDecrement={() => incrementValue(index, 'rating', -0.1)}
                  onChange={(value) => handleDirectInput(index, 'rating', value)}
                  min={1}
                  max={10}
                  step={0.1}
                />

                <StatInput
                  label="Goals"
                  value={player.goals}
                  onIncrement={() => incrementValue(index, 'goals', 1)}
                  onDecrement={() => incrementValue(index, 'goals', -1)}
                  onChange={(value) => handleDirectInput(index, 'goals', value)}
                />

                <StatInput
                  label="Assists"
                  value={player.assists}
                  onIncrement={() => incrementValue(index, 'assists', 1)}
                  onDecrement={() => incrementValue(index, 'assists', -1)}
                  onChange={(value) => handleDirectInput(index, 'assists', value)}
                />

                <StatInput
                  label="Yellow Cards"
                  value={player.yellowCards}
                  onIncrement={() => incrementValue(index, 'yellowCards', 1)}
                  onDecrement={() => incrementValue(index, 'yellowCards', -1)}
                  onChange={(value) => handleDirectInput(index, 'yellowCards', value)}
                  max={2}
                />

                <StatInput
                  label="Red Cards"
                  value={player.redCards}
                  onIncrement={() => incrementValue(index, 'redCards', 1)}
                  onDecrement={() => incrementValue(index, 'redCards', -1)}
                  onChange={(value) => handleDirectInput(index, 'redCards', value)}
                  max={1}
                />

                <StatInput
                  label="Own Goals"
                  value={player.ownGoals || 0}
                  onIncrement={() => incrementValue(index, 'ownGoals', 1)}
                  onDecrement={() => incrementValue(index, 'ownGoals', -1)}
                  onChange={(value) => handleDirectInput(index, 'ownGoals', value)}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerPerformanceInput;
