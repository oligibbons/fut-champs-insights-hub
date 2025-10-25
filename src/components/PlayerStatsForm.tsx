import { memo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Minus, Plus, Star, Goal, ShieldAlert, Footprints, Clock, Square, SquareCheck, SquareDot } from 'lucide-react'; // Added icons
import { PlayerPerformance } from '@/types/futChampions'; // Assuming Game includes PlayerPerformance array
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card'; // For better visual separation
import { Separator } from './ui/separator'; // To separate players

// Define the shape of player data within the form
type PlayerStatFormData = {
  id: string; // player_id or generated
  name: string;
  position: string; // Could be from squad or manual override
  minutes_played: number;
  goals: number;
  assists: number;
  rating: number;
  yellow_cards: number;
  red_cards: number;
  own_goals: number;
};

interface PlayerStatsFormProps {
  players: PlayerStatFormData[];
  onStatsChange: (players: PlayerStatFormData[]) => void;
  gameDuration: number; // To set max minutes
}

// Helper for number steppers within the player row
const PlayerNumberInput = memo(({ value, onChange, onAdjust, min, max, step = 1, label, icon: Icon, inputWidth = "w-12" }: {
    value: number;
    onChange: (value: number) => void;
    onAdjust: (delta: number) => void;
    min: number;
    max: number;
    step?: number;
    label: string; // For aria-label
    icon?: React.ElementType;
    inputWidth?: string;
}) => {
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        let valStr = e.target.value;
        let valNum = step < 1 ? parseFloat(valStr) : parseInt(valStr, 10);
        if (valStr === '' || isNaN(valNum)) { valNum = min; }
        valNum = Math.max(min, Math.min(max, valNum));
        onChange(valNum); // Update parent state directly on blur
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       let val = e.target.value;
        // Allow temporary empty or partial input
       if (val === '' || (step < 1 && /^\d*\.?\d*$/.test(val)) || (step >= 1 && /^\d*$/.test(val))) {
           // If it's valid format or empty, pass string up temporarily if needed, or parse if whole number
           if (step >= 1 && val !== '') {
               onChange(parseInt(val, 10)); // Parse integers immediately
           } else {
               // For decimals or empty, might need a different handler if parent expects number always
               // For now, let's try parsing, defaulting to min on failure (blur handles final validation)
               const parsed = parseFloat(val);
               if (!isNaN(parsed)) onChange(parsed);
               // If you need to handle the string state: (onChange as (v: string | number) => void)(val);
           }
       }
    };


    return (
        <div className="flex flex-col items-center space-y-1">
             {Icon && <Icon className="h-4 w-4 text-muted-foreground mb-0.5" aria-hidden="true" />}
             {/* Simple text label for smaller screens */}
            <Label htmlFor={`${label}-input`} className="text-xs font-medium sr-only">{label}</Label> {/* Screen reader only */}
            <div className="flex items-center gap-1">
                <Button
                    type="button" variant="ghost" size="icon" className="h-6 w-6 p-0"
                    onClick={() => onAdjust(-step)} disabled={value <= min} aria-label={`Decrease ${label}`}
                > <Minus className="h-3 w-3" /> </Button>
                <Input
                    id={`${label}-input`}
                    type="text" // Use text for better temp input handling
                    inputMode={step < 1 ? "decimal" : "numeric"}
                    value={String(value)} // Display value must be string
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn("h-7 text-center text-sm font-semibold px-1", inputWidth)}
                    min={min} max={max} step={step}
                    aria-label={label}
                />
                <Button
                    type="button" variant="ghost" size="icon" className="h-6 w-6 p-0"
                    onClick={() => onAdjust(step)} disabled={value >= max} aria-label={`Increase ${label}`}
                > <Plus className="h-3 w-3" /> </Button>
            </div>
        </div>
    );
});


const PlayerStatsForm = ({ players, onStatsChange, gameDuration }: PlayerStatsFormProps) => {

    // Function to update a specific player's stat
    const updatePlayerStat = (index: number, field: keyof PlayerStatFormData, value: number) => {
        const updatedPlayers = [...players];
        updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };
        onStatsChange(updatedPlayers);
    };

     // Function to adjust a specific player's stat using delta
     const adjustPlayerStat = (index: number, field: keyof PlayerStatFormData, delta: number, min: number, max: number, step: number = 1) => {
        const currentVal = players[index][field] as number;
        let newVal = currentVal + delta;

        // Handle floating point for ratings
        if (field === 'rating' || step < 1) {
             const precision = 1; // Assuming rating is 1 decimal place
             newVal = parseFloat(newVal.toFixed(precision));
        }

        newVal = Math.max(min, Math.min(max, newVal));
        updatePlayerStat(index, field, newVal);
    };


    return (
        <div className="space-y-3">
            {players.map((player, index) => (
                <Card key={player.id || index} className="bg-background/40 p-3 shadow-sm">
                    <CardContent className="p-0">
                        {/* Player Info Row */}
                        <div className="flex justify-between items-center mb-2">
                             <div className='flex flex-col'>
                                <p className="font-semibold text-sm truncate">{player.name || `Player ${index + 1}`}</p>
                                <p className="text-xs text-muted-foreground">{player.position || 'N/A'}</p>
                             </div>
                             {/* Optional: Add button to remove player? */}
                        </div>

                        {/* Stats Grid - Adjusted for Mobile */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-2 gap-y-3 items-end">
                            {/* Minutes Played */}
                             <div className="col-span-3 sm:col-span-2"> {/* Takes more space */}
                                <Label htmlFor={`minutes-${index}`} className="text-xs font-medium mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Mins Played</Label>
                                <div className="flex items-center gap-1">
                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => adjustPlayerStat(index, 'minutes_played', -5, 0, gameDuration, 5)} disabled={player.minutes_played <= 0}><Minus className="h-3 w-3" /></Button>
                                    <Input
                                        id={`minutes-${index}`}
                                        type="number"
                                        value={player.minutes_played}
                                        onChange={(e) => updatePlayerStat(index, 'minutes_played', Math.max(0, Math.min(gameDuration, parseInt(e.target.value) || 0)))}
                                        className="h-7 w-16 text-center text-sm font-semibold px-1"
                                        min={0} max={gameDuration} step={1}
                                        aria-label={`${player.name} Minutes Played`}
                                    />
                                     <Button type="button" variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => adjustPlayerStat(index, 'minutes_played', 5, 0, gameDuration, 5)} disabled={player.minutes_played >= gameDuration}><Plus className="h-3 w-3" /></Button>
                                </div>
                            </div>

                            {/* Goals */}
                            <PlayerNumberInput
                                value={player.goals}
                                onChange={(val) => updatePlayerStat(index, 'goals', val)}
                                onAdjust={(delta) => adjustPlayerStat(index, 'goals', delta, 0, 20)}
                                min={0} max={20} label={`${player.name} Goals`} icon={Goal} inputWidth='w-12'
                            />

                            {/* Assists */}
                            <PlayerNumberInput
                                value={player.assists}
                                onChange={(val) => updatePlayerStat(index, 'assists', val)}
                                onAdjust={(delta) => adjustPlayerStat(index, 'assists', delta, 0, 20)}
                                min={0} max={20} label={`${player.name} Assists`} icon={Footprints} inputWidth='w-12'
                            />

                             {/* Rating */}
                             <div className="col-span-3 sm:col-span-2"> {/* Takes more space */}
                                <Label htmlFor={`rating-${index}`} className="text-xs font-medium mb-1 flex items-center gap-1"><Star className="h-3 w-3" />Rating ({player.rating.toFixed(1)})</Label>
                                <div className="flex items-center gap-1">
                                     <Button type="button" variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => adjustPlayerStat(index, 'rating', -0.1, 0, 10, 0.1)} disabled={player.rating <= 0}><Minus className="h-3 w-3" /></Button>
                                    <Slider
                                        id={`rating-${index}`}
                                        value={[player.rating]}
                                        onValueChange={(value) => updatePlayerStat(index, 'rating', value[0])}
                                        min={0} max={10} step={0.1}
                                        className="flex-1 mx-1"
                                        aria-label={`${player.name} Rating`}
                                    />
                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => adjustPlayerStat(index, 'rating', 0.1, 0, 10, 0.1)} disabled={player.rating >= 10}><Plus className="h-3 w-3" /></Button>
                                </div>
                            </div>


                            {/* Yellow Cards */}
                             <PlayerNumberInput
                                value={player.yellow_cards}
                                onChange={(val) => updatePlayerStat(index, 'yellow_cards', val)}
                                onAdjust={(delta) => adjustPlayerStat(index, 'yellow_cards', delta, 0, 2)}
                                min={0} max={2} label={`${player.name} Yellow Cards`} icon={Square} inputWidth='w-12'
                            />
                            {/* Red Card Toggle */}
                            <div className="flex flex-col items-center space-y-1">
                                <SquareCheck className="h-4 w-4 text-muted-foreground mb-0.5" aria-hidden="true" />
                                <Label htmlFor={`red-${index}`} className="text-xs font-medium sr-only">{`${player.name} Red Card`}</Label>
                                <Button
                                    id={`red-${index}`}
                                    type='button' variant='ghost' size='icon'
                                    className={cn("h-7 w-7 p-0", player.red_cards > 0 ? "bg-red-500/20 text-red-500" : "")}
                                    onClick={() => updatePlayerStat(index, 'red_cards', player.red_cards > 0 ? 0 : 1)}
                                    aria-pressed={player.red_cards > 0}
                                    aria-label={`${player.name} Red Card Toggle`}
                                >
                                    <SquareCheck className="h-4 w-4" />
                                </Button>
                            </div>

                             {/* Own Goals */}
                             <PlayerNumberInput
                                value={player.own_goals}
                                onChange={(val) => updatePlayerStat(index, 'own_goals', val)}
                                onAdjust={(delta) => adjustPlayerStat(index, 'own_goals', delta, 0, 5)}
                                min={0} max={5} label={`${player.name} Own Goals`} icon={ShieldAlert} inputWidth='w-12'
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default memo(PlayerStatsForm);
