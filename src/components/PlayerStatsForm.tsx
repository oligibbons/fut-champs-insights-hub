import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlayerPerformance } from '@/types/futChampions';
import { Trash2, Minus, Plus } from 'lucide-react';

interface PlayerStatsFormProps {
  players: PlayerPerformance[];
  onStatsChange: (players: PlayerPerformance[]) => void;
  gameDuration: number;
}

const PlayerStatsForm = ({ players, onStatsChange, gameDuration }: PlayerStatsFormProps) => {

  const updatePlayer = (index: number, field: keyof PlayerPerformance, value: any) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    onStatsChange(newPlayers);
  };

  const removePlayer = (index: number) => {
    const newPlayers = players.filter((_, i) => i !== index);
    onStatsChange(newPlayers);
  };

  const handleInputChange = (index: number, field: keyof PlayerPerformance, value: string) => {
    if (field === 'name' || field === 'position') {
      updatePlayer(index, field, value);
      return;
    }
    
    // For numeric fields, allow temporarily empty string for user input
    if (value === '') {
      updatePlayer(index, field, '');
      return;
    }

    const num = field === 'rating' ? parseFloat(value) : parseInt(value, 10);
    if (!isNaN(num)) {
      updatePlayer(index, field, num);
    }
  };
  
  const handleBlur = (index: number, field: keyof PlayerPerformance) => {
      const player = players[index];
      const value = player[field];
      if(value === '' || value === null || (typeof value === 'number' && isNaN(value))) {
          updatePlayer(index, field, 0);
      }
  }

  const adjustValue = (index: number, field: keyof PlayerPerformance, delta: number) => {
    const currentValue = players[index][field];
    const numValue = (typeof currentValue === 'number' && !isNaN(currentValue)) ? currentValue : 0;
    let newValue = numValue + delta;
    
    if (field === 'rating') {
      newValue = Math.max(0, Math.min(10, newValue));
      newValue = Math.round(newValue * 10) / 10; // Round to one decimal place
    } else if (field === 'minutesPlayed') {
      newValue = Math.max(0, Math.min(gameDuration, newValue));
    } else {
      newValue = Math.max(0, newValue);
    }
    
    updatePlayer(index, field, newValue);
  };

  return (
    <div className="space-y-4">
      {players.map((player, index) => (
        <Card key={player.id || index} className="p-4 bg-white/5 border-white/10 space-y-4">
          {/* Player Header: Name, Position, Remove Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-grow grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <Label className="text-white text-xs">Player Name</Label>
                <Input
                    value={player.name}
                    onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                    placeholder="Enter player name"
                    className="modern-input"
                    readOnly={player.position !== 'SUB'} // Only allow editing name for manual subs
                />
               </div>
               <div className="space-y-1">
                <Label className="text-white text-xs">Position</Label>
                 <Input
                    value={player.position}
                    onChange={(e) => updatePlayer(index, 'position', e.target.value)}
                    placeholder="e.g. SUB"
                    className="modern-input"
                    readOnly={player.position !== 'SUB'}
                />
               </div>
            </div>
            <Button
                type="button" variant="ghost" size="sm"
                onClick={() => removePlayer(index)}
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 self-end sm:self-center"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Player Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Minutes Played */}
            <div className="space-y-1">
              <Label className="text-white text-xs font-medium">Minutes</Label>
              <div className="flex items-center gap-1">
                <Button type="button" variant="outline" size="icon" onClick={() => adjustValue(index, 'minutesPlayed', -5)} className="h-8 w-8 modern-button-secondary">-</Button>
                <Input type="number" value={player.minutesPlayed} onChange={(e) => handleInputChange(index, 'minutesPlayed', e.target.value)} onBlur={() => handleBlur(index, 'minutesPlayed')} className="modern-input text-center w-full" />
                <Button type="button" variant="outline" size="icon" onClick={() => adjustValue(index, 'minutesPlayed', 5)} className="h-8 w-8 modern-button-secondary">+</Button>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-1">
              <Label className="text-white text-xs font-medium">Rating</Label>
              <div className="flex items-center gap-1">
                <Button type="button" variant="outline" size="icon" onClick={() => adjustValue(index, 'rating', -0.1)} className="h-8 w-8 modern-button-secondary">-</Button>
                <Input type="number" step="0.1" value={player.rating} onChange={(e) => handleInputChange(index, 'rating', e.target.value)} onBlur={() => handleBlur(index, 'rating')} className="modern-input text-center w-full" />
                <Button type="button" variant="outline" size="icon" onClick={() => adjustValue(index, 'rating', 0.1)} className="h-8 w-8 modern-button-secondary">+</Button>
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-1">
              <Label className="text-white text-xs font-medium">Goals</Label>
              <div className="flex items-center gap-1">
                <Button type="button" variant="outline" size="icon" onClick={() => adjustValue(index, 'goals', -1)} className="h-8 w-8 modern-button-secondary">-</Button>
                <Input type="number" value={player.goals} onChange={(e) => handleInputChange(index, 'goals', e.target.value)} onBlur={() => handleBlur(index, 'goals')} className="modern-input text-center w-full" />
                <Button type="button" variant="outline" size="icon" onClick={() => adjustValue(index, 'goals', 1)} className="h-8 w-8 modern-button-secondary">+</Button>
              </div>
            </div>

            {/* Assists */}
            <div className="space-y-1">
              <Label className="text-white text-xs font-medium">Assists</Label>
              <div className="flex items-center gap-1">
                <Button type="button" variant="outline" size="icon" onClick={() => adjustValue(index, 'assists', -1)} className="h-8 w-8 modern-button-secondary">-</Button>
                <Input type="number" value={player.assists} onChange={(e) => handleInputChange(index, 'assists', e.target.value)} onBlur={() => handleBlur(index, 'assists')} className="modern-input text-center w-full" />
                <Button type="button" variant="outline" size="icon" onClick={() => adjustValue(index, 'assists', 1)} className="h-8 w-8 modern-button-secondary">+</Button>
              </div>
            </div>

             {/* Yellow Cards (Optional, based on your type) */}
            {player.yellowCards !== undefined && (
                <div className="space-y-1">
                    <Label className="text-white text-xs font-medium">Yellows</Label>
                    <div className="flex items-center gap-1">
                        <Button type="button" variant="outline" size="icon" onClick={() => adjustValue(index, 'yellowCards', -1)} className="h-8 w-8 modern-button-secondary">-</Button>
                        <Input type="number" value={player.yellowCards} onChange={(e) => handleInputChange(index, 'yellowCards', e.target.value)} onBlur={() => handleBlur(index, 'yellowCards')} className="modern-input text-center w-full" />
                        <Button type="button" variant="outline" size="icon" onClick={() => adjustValue(index, 'yellowCards', 1)} className="h-8 w-8 modern-button-secondary">+</Button>
                    </div>
                </div>
            )}
             {/* Red Cards (Optional) */}
            {player.redCards !== undefined && (
                <div className="space-y-1">
                    <Label className="text-white text-xs font-medium">Reds</Label>
                    <div className="flex items-center gap-1">
                        <Button type="button" variant="outline" size="icon" onClick={() => adjustValue(index, 'redCards', -1)} className="h-8 w-8 modern-button-secondary">-</Button>
                        <Input type="number" value={player.redCards} onChange={(e) => handleInputChange(index, 'redCards', e.target.value)} onBlur={() => handleBlur(index, 'redCards')} className="modern-input text-center w-full" />
                        <Button type="button" variant="outline" size="icon" onClick={() => adjustValue(index, 'redCards', 1)} className="h-8 w-8 modern-button-secondary">+</Button>
                    </div>
                </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PlayerStatsForm;
