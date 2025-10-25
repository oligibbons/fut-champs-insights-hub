import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCallback, memo } from 'react';

// Define the structure of a player performance object used within this form
interface PlayerPerformanceFormData {
    id: string; // player_id
    name: string;
    position: string;
    minutes_played: number | string; // Allow string temporarily during input
    goals: number | string;
    assists: number | string;
    rating: number | string;
    yellow_cards: number | string;
    red_cards: number | string;
    own_goals: number | string;
}


interface PlayerStatsFormProps {
    players: PlayerPerformanceFormData[];
    onStatsChange: (players: PlayerPerformanceFormData[]) => void;
    gameDuration: number;
}

// Helper: Safely parse input to number, defaulting to 0
const safeParseNumber = (value: string | number | undefined | null, isDecimal = false): number => {
    if (value === '' || value === null || value === undefined) return 0;
    const num = isDecimal ? parseFloat(String(value)) : parseInt(String(value), 10);
    return isNaN(num) ? 0 : num;
};

const PlayerStatsForm = ({ players, onStatsChange, gameDuration }: PlayerStatsFormProps) => {

    const updatePlayer = useCallback((index: number, field: keyof PlayerPerformanceFormData, value: any) => {
        const newPlayers = [...players];
        newPlayers[index] = { ...newPlayers[index], [field]: value };
        onStatsChange(newPlayers);
    }, [players, onStatsChange]);

    const removePlayer = useCallback((index: number) => {
        const newPlayers = players.filter((_, i) => i !== index);
        onStatsChange(newPlayers);
    }, [players, onStatsChange]);

    // Handle direct input changes, allow temporary invalid/empty states
    const handleInputChange = useCallback((index: number, field: keyof PlayerPerformanceFormData, value: string) => {
        if (field === 'name' || field === 'position') {
            updatePlayer(index, field, value);
        } else {
             // Allow empty string or valid number format
             const isDecimal = field === 'rating';
             if (value === '' || (isDecimal && /^\d*\.?\d*$/.test(value)) || (!isDecimal && /^\d*$/.test(value)) ) {
                 updatePlayer(index, field, value);
             }
        }
    }, [updatePlayer]);

    // Coerce to valid number on blur
    const handleBlur = useCallback((index: number, field: keyof PlayerPerformanceFormData) => {
        const player = players[index];
        const value = player[field];
        const isDecimal = field === 'rating';
        let num = safeParseNumber(value, isDecimal);

        // Apply constraints
        if (field === 'rating') num = Math.max(0, Math.min(10, num));
        else if (field === 'minutes_played') num = Math.max(0, Math.min(gameDuration, num));
        else if (field === 'red_cards') num = Math.max(0, Math.min(1, num));
        else if (field === 'yellow_cards') num = Math.max(0, Math.min(2, num));
        else num = Math.max(0, num); // General non-negative

        // Format rating to one decimal place
        if (isDecimal) num = parseFloat(num.toFixed(1));

        // Update only if the coerced value is different
        if (player[field] !== num) {
            updatePlayer(index, field, num);
        }
    }, [players, gameDuration, updatePlayer]);

    // Adjust numeric value with steppers
    const adjustValue = useCallback((index: number, field: keyof PlayerPerformanceFormData, delta: number) => {
        const isDecimal = field === 'rating';
        const currentValue = safeParseNumber(players[index][field], isDecimal);
        let newValue = currentValue + delta;

        // Apply constraints and precision
        if (field === 'rating') {
             newValue = Math.max(0, Math.min(10, newValue));
             newValue = Math.round(newValue * 10) / 10; // Use Math.round for better precision
        } else if (field === 'minutes_played') {
            newValue = Math.max(0, Math.min(gameDuration, Math.round(newValue))); // Ensure integer minutes
        } else if (field === 'red_cards') {
             newValue = Math.max(0, Math.min(1, Math.round(newValue)));
        } else if (field === 'yellow_cards') {
             newValue = Math.max(0, Math.min(2, Math.round(newValue)));
        } else {
            newValue = Math.max(0, Math.round(newValue)); // Ensure non-negative integer
        }

        updatePlayer(index, field, newValue);
    }, [players, gameDuration, updatePlayer]);


    return (
        <div className="space-y-3">
            {players.map((player, index) => (
                <Card key={player.id || index} className="p-3 bg-card/50 border border-border/50 space-y-3"> {/* Use theme colors */}
                    {/* Player Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex-grow grid grid-cols-2 gap-2">
                            {/* Name (Readonly unless SUB) */}
                             <div className="space-y-1">
                                <Label htmlFor={`player-${index}-name`} className="text-xs text-muted-foreground">Name</Label>
                                <Input
                                    id={`player-${index}-name`}
                                    value={player.name}
                                    onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                    placeholder="Player Name"
                                    className="h-8 text-sm"
                                    readOnly={player.position !== 'SUB'}
                                    disabled={player.position !== 'SUB'} // Visually indicate readonly
                                />
                            </div>
                            {/* Position (Readonly unless SUB) */}
                             <div className="space-y-1">
                                <Label htmlFor={`player-${index}-pos`} className="text-xs text-muted-foreground">Position</Label>
                                <Input
                                    id={`player-${index}-pos`}
                                    value={player.position}
                                    onChange={(e) => handleInputChange(index, 'position', e.target.value)}
                                    placeholder="e.g. SUB"
                                    className="h-8 text-sm"
                                    readOnly={player.position !== 'SUB'}
                                     disabled={player.position !== 'SUB'}
                                />
                            </div>
                        </div>
                         {/* Remove Button (Only for Subs potentially?) */}
                         {player.position === 'SUB' && (
                             <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-destructive/10 h-8 w-8 self-end sm:self-center shrink-0" onClick={() => removePlayer(index)} aria-label="Remove Substitute"> <Trash2 className="h-4 w-4" /> </Button>
                         )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-3 gap-y-2">
                         {/* Helper function to render a stat input field */}
                         {(['minutes_played', 'rating', 'goals', 'assists', 'yellow_cards', 'red_cards', 'own_goals'] as const).map(field => {
                             const isDecimal = field === 'rating';
                             const step = isDecimal ? 0.1 : 1;
                             const min = 0;
                             let max = field === 'rating' ? 10 : (field === 'minutes_played' ? gameDuration : (field === 'red_cards' ? 1 : (field === 'yellow_cards' ? 2 : 99)));
                             const labelText = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                             return (
                                <div key={field} className="space-y-1">
                                    <Label htmlFor={`player-${index}-${field}`} className="text-xs text-muted-foreground">{labelText}</Label>
                                    <div className="flex items-center gap-1">
                                        <Button type="button" variant="outline" size="icon" className="w-7 h-7 p-0 shrink-0" onClick={() => adjustValue(index, field, -step)} disabled={(player[field] ?? 0) <= min} aria-label={`Decrease ${labelText}`}><Minus className="h-3 w-3" /></Button>
                                        <Input
                                            id={`player-${index}-${field}`}
                                            type="text"
                                            inputMode={isDecimal ? "decimal" : "numeric"}
                                            className="h-7 text-sm font-semibold text-center w-full min-w-[30px] px-1" // Min width
                                            value={player[field] ?? ''}
                                            onChange={(e) => handleInputChange(index, field, e.target.value)}
                                            onBlur={() => handleBlur(index, field)}
                                        />
                                        <Button type="button" variant="outline" size="icon" className="w-7 h-7 p-0 shrink-0" onClick={() => adjustValue(index, field, step)} disabled={(player[field] ?? 0) >= max} aria-label={`Increase ${labelText}`}><Plus className="h-3 w-3" /></Button>
                                    </div>
                                </div>
                             );
                         })}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default memo(PlayerStatsForm); // Memoize for performance
