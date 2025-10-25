import { memo } from 'react';
// Removed unused imports: useForm, Controller, useFieldArray
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Minus, Plus, Star, Goal, ShieldAlert, Footprints, Clock, Square, SquareCheck } from 'lucide-react'; // Removed SquareDot
import { PlayerPerformance } from '@/types/futChampions';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
// Removed Separator import

// Define the shape of player data within the form
type PlayerStatFormData = {
  id: string; // player_id or generated unique ID
  name: string;
  position: string;
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
  gameDuration: number;
}

// Helper for number steppers within the player row
const PlayerNumberInput = memo(({
    playerId, // Added playerId for unique ID generation
    index,    // Added index for unique ID generation
    field,    // Added field name for unique ID generation
    value,
    onChange,
    onAdjust,
    min, max, step = 1, label, icon: Icon, inputWidth = "w-12"
}: {
    playerId: string;
    index: number;
    field: keyof PlayerStatFormData;
    value: number;
    onChange: (value: number) => void;
    onAdjust: (delta: number) => void;
    min: number;
    max: number;
    step?: number;
    label: string;
    icon?: React.ElementType;
    inputWidth?: string;
}) => {
    // --- FIX: Create unique ID using index and field name ---
    const uniqueId = `player-${index}-${playerId}-${field}`;

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        let valStr = e.target.value;
        let valNum = step < 1 ? parseFloat(valStr) : parseInt(valStr, 10);
        if (valStr === '' || isNaN(valNum)) { valNum = min; }
        valNum = Math.max(min, Math.min(max, valNum));
        // Ensure rating is formatted correctly
        if (field === 'rating') {
             onChange(parseFloat(valNum.toFixed(1)));
        } else {
             onChange(valNum);
        }
    };

    // Keep handleChange simple, blur handles final validation
     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const val = e.target.value;
        // Basic check for numeric input pattern (allows empty, numbers, one decimal)
       const numRegex = step < 1 ? /^\d*\.?\d*$/ : /^\d*$/;
        if (numRegex.test(val)) {
            // Directly pass the string value up, let the main component/blur handle parsing
            // This allows intermediate states like "1." or ""
             (onChange as (v: string | number) => void)(val);
        }
    };


    return (
        <div className="flex flex-col items-center space-y-1">
             {Icon && <Icon className="h-4 w-4 text-muted-foreground mb-0.5" aria-hidden="true" />}
             {/* --- FIX: Use uniqueId for htmlFor --- */}
            <Label htmlFor={uniqueId} className="text-xs font-medium">{label}</Label>
            <div className="flex items-center gap-1">
                <Button
                    type="button" variant="ghost" size="icon" className="h-6 w-6 p-0"
                    onClick={() => onAdjust(-step)} disabled={value <= min} aria-label={`Decrease ${label}`}
                > <Minus className="h-3 w-3" /> </Button>
                {/* --- FIX: Use uniqueId for id --- */}
                <Input
                    id={uniqueId}
                    type="text"
                    inputMode={step < 1 ? "decimal" : "numeric"}
                    // Ensure value passed to input is always a string
                    value={String(value ?? '')}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn("h-7 text-center text-sm font-semibold px-1", inputWidth)}
                    min={min} max={max} step={step}
                    aria-label={`${label} input`} // More specific aria-label for the input itself
                />
                <Button
                    type="button" variant="ghost" size="icon" className="h-6 w-6 p-0"
                    onClick={() => onAdjust(step)} disabled={value >= max} aria-label={`Increase ${label}`}
                > <Plus className="h-3 w-3" /> </Button>
            </div>
        </div>
    );
});
PlayerNumberInput.displayName = 'PlayerNumberInput'; // Add display name for React DevTools


const PlayerStatsForm = ({ players, onStatsChange, gameDuration }: PlayerStatsFormProps) => {

    // Function to update a specific player's stat
    // Handles parsing from potential string input during onChange
    const updatePlayerStat = (index: number, field: keyof PlayerStatFormData, value: number | string) => {
        const updatedPlayers = [...players];
        let numValue: number;

        // Attempt to parse if it's a string, default/clamp on failure or if empty
        if (typeof value === 'string') {
            numValue = field === 'rating' ? parseFloat(value) : parseInt(value, 10);
            if (value === '' || isNaN(numValue)) {
                // Determine appropriate default (usually min, like 0)
                numValue = 0; // Adjust if min is different for some fields
            }
        } else {
            numValue = value;
        }

         // Clamp based on field - Add more clamps if needed
        if (field === 'rating') numValue = Math.max(0, Math.min(10, numValue));
        if (field === 'minutes_played') numValue = Math.max(0, Math.min(gameDuration, numValue));
        if (field === 'yellow_cards') numValue = Math.max(0, Math.min(2, numValue));
        // Add clamps for goals, assists etc. if desired, e.g., Math.max(0, numValue)

        updatedPlayers[index] = { ...updatedPlayers[index], [field]: numValue };
        onStatsChange(updatedPlayers);
    };

     // Function to adjust a specific player's stat using delta (called by +/- buttons)
     const adjustPlayerStat = (index: number, field: keyof PlayerStatFormData, delta: number, min: number, max: number, step: number = 1) => {
        const currentVal = players[index][field] as number;
        // Ensure currentVal is treated as a number, defaulting to 0 if undefined/null
        const currentNum = typeof currentVal === 'number' ? currentVal : 0;
        let newVal = currentNum + delta;

        // Handle floating point for ratings
        if (field === 'rating' || step < 1) {
             const precision = 1;
             newVal = parseFloat(newVal.toFixed(precision));
        } else {
            newVal = Math.round(newVal); // Ensure integer for other fields
        }

        newVal = Math.max(min, Math.min(max, newVal));
        // We know newVal is a number here, so direct update is fine
        updatePlayerStat(index, field, newVal);
    };


    return (
        <div className="space-y-3">
            {players.map((player, index) => (
                // Use player.id for the key for stability
                <Card key={player.id} className="bg-background/40 p-3 shadow-sm">
                    <CardContent className="p-0">
                        <div className="flex justify-between items-center mb-2">
                             <div className='flex flex-col'>
                                <p className="font-semibold text-sm truncate">{player.name || `Player ${index + 1}`}</p>
                                <p className="text-xs text-muted-foreground">{player.position || 'N/A'}</p>
                             </div>
                        </div>

                        {/* Stats Grid - Adjusted for Mobile & ID Fix */}
                        {/* --- FIX: Use items-center for vertical alignment --- */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-2 gap-y-4 items-center">
                            {/* Minutes Played */}
                             <div className="col-span-3 sm:col-span-2">
                                {/* --- FIX: Unique ID/For --- */}
                                <Label htmlFor={`player-${index}-${player.id}-minutes_played`} className="text-xs font-medium mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Mins Played</Label>
                                <div className="flex items-center gap-1">
                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => adjustPlayerStat(index, 'minutes_played', -5, 0, gameDuration, 5)} disabled={player.minutes_played <= 0}><Minus className="h-3 w-3" /></Button>
                                    {/* --- FIX: Unique ID --- */}
                                    <Input
                                        id={`player-${index}-${player.id}-minutes_played`}
                                        type="number" // Use number here since we parse int directly
                                        value={player.minutes_played}
                                        onChange={(e) => updatePlayerStat(index, 'minutes_played', parseInt(e.target.value) || 0)} // Basic parsing
                                        onBlur={(e) => updatePlayerStat(index, 'minutes_played', Math.max(0, Math.min(gameDuration, parseInt(e.target.value) || 0)))} // Clamp on blur
                                        className="h-7 w-16 text-center text-sm font-semibold px-1"
                                        min={0} max={gameDuration} step={1}
                                        aria-label={`${player.name} Minutes Played`}
                                    />
                                     <Button type="button" variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => adjustPlayerStat(index, 'minutes_played', 5, 0, gameDuration, 5)} disabled={player.minutes_played >= gameDuration}><Plus className="h-3 w-3" /></Button>
                                </div>
                            </div>

                            {/* Goals */}
                            <PlayerNumberInput
                                playerId={player.id} index={index} field="goals" // Pass props for unique ID
                                value={player.goals}
                                onChange={(val) => updatePlayerStat(index, 'goals', val)}
                                onAdjust={(delta) => adjustPlayerStat(index, 'goals', delta, 0, 20)}
                                min={0} max={20} label={`G`} icon={Goal} inputWidth='w-12'
                            />

                            {/* Assists */}
                            <PlayerNumberInput
                                playerId={player.id} index={index} field="assists" // Pass props for unique ID
                                value={player.assists}
                                onChange={(val) => updatePlayerStat(index, 'assists', val)}
                                onAdjust={(delta) => adjustPlayerStat(index, 'assists', delta, 0, 20)}
                                min={0} max={20} label={`A`} icon={Footprints} inputWidth='w-12'
                            />

                             {/* Rating */}
                             <div className="col-span-3 sm:col-span-2">
                                {/* --- FIX: Unique ID/For --- */}
                                <Label htmlFor={`player-${index}-${player.id}-rating`} className="text-xs font-medium mb-1 flex items-center gap-1"><Star className="h-3 w-3" />Rating ({player.rating?.toFixed(1) ?? '?.?'})</Label>
                                <div className="flex items-center gap-1">
                                     <Button type="button" variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => adjustPlayerStat(index, 'rating', -0.1, 0, 10, 0.1)} disabled={player.rating <= 0}><Minus className="h-3 w-3" /></Button>
                                    {/* --- FIX: Unique ID --- */}
                                    <Slider
                                        id={`player-${index}-${player.id}-rating`}
                                        value={[player.rating ?? 0]} // Ensure value is array and handle nullish
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
                                playerId={player.id} index={index} field="yellow_cards" // Pass props for unique ID
                                value={player.yellow_cards}
                                onChange={(val) => updatePlayerStat(index, 'yellow_cards', val)}
                                onAdjust={(delta) => adjustPlayerStat(index, 'yellow_cards', delta, 0, 2)}
                                min={0} max={2} label={`Y`} icon={Square} inputWidth='w-12'
                            />
                            {/* Red Card Toggle */}
                            <div className="flex flex-col items-center space-y-1">
                                <SquareCheck className="h-4 w-4 text-muted-foreground mb-0.5" aria-hidden="true" />
                                {/* --- FIX: Unique ID/For --- */}
                                <Label htmlFor={`player-${index}-${player.id}-red_cards`} className="text-xs font-medium">R</Label>
                                {/* --- FIX: Unique ID --- */}
                                <Button
                                    id={`player-${index}-${player.id}-red_cards`}
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
                                playerId={player.id} index={index} field="own_goals" // Pass props for unique ID
                                value={player.own_goals}
                                onChange={(val) => updatePlayerStat(index, 'own_goals', val)}
                                onAdjust={(delta) => adjustPlayerStat(index, 'own_goals', delta, 0, 5)}
                                min={0} max={5} label={`OG`} icon={ShieldAlert} inputWidth='w-12'
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default memo(PlayerStatsForm);
