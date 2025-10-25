import { useCallback, memo, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Star, Goal, Footprints, Clock, Square, SquareCheck, ShieldAlert } from 'lucide-react';
import { PlayerPerformance } from '@/types/futChampions'; // Use the main type
import { cn } from '@/lib/utils';

// Type specifically for the data structure used within this form component
type PlayerStatFormData = {
  id: string; // player_id (UUID)
  name: string;
  position: string;
  isSub: boolean; // --- FIX: Added to know if player is a sub ---
  minutes_played: number | string; // Allow string for intermediate input state
  goals: number | string;
  assists: number | string;
  rating: number | string;
  yellow_cards: number | string;
  red_cards: number | string;
  own_goals: number | string;
};

interface PlayerStatsFormProps {
  players: PlayerStatFormData[];
  onStatsChange: (players: PlayerStatFormData[]) => void;
  gameDuration: number;
}

// --- FIX: Define the logical sort order for positions ---
const positionOrder: { [key: string]: number } = {
  'GK': 1,
  'CB': 2,
  'LB': 3,
  'RB': 4,
  'CDM': 5,
  'CM': 6,
  'LM': 7,
  'RM': 8,
  'CAM': 9,
  'LW': 10,
  'RW': 11,
  'ST': 12,
  // Note: SUB and RES are removed, we now use the 'isSub' boolean flag
};

// Reusable Input Component for Player Stats
const PlayerStatInput = memo(({
  playerId, field, value, onChange, onAdjust, label, Icon, min, max, step, inputWidth = 'w-14', showButtons = true
}: {
  playerId: string;
  field: keyof PlayerStatFormData;
  value: number | string;
  onChange: (playerId: string, field: keyof PlayerStatFormData, value: string) => void;
  onAdjust: (playerId: string, field: keyof PlayerStatFormData, delta: number, step: number, min: number, max: number) => void;
  label: string;
  Icon: React.ElementType;
  min: number;
  max: number;
  step: number;
  inputWidth?: string;
  showButtons?: boolean;
}) => {
    // Determine disabled state based on parsed numeric value
    const numValue = step < 1 ? parseFloat(String(value)) : parseInt(String(value), 10);
    const safeNumValue = isNaN(numValue) ? min : numValue; // Default to min if NaN
    const isMin = safeNumValue <= min;
    const isMax = safeNumValue >= max;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        const numRegex = step < 1 ? /^\d*\.?\d*$/ : /^\d*$/;
        if (numRegex.test(val)) {
            onChange(playerId, field, val); // Pass valid string or empty string
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        let valStr = e.target.value;
        let valNum = step < 1 ? parseFloat(valStr) : parseInt(valStr, 10);

        if (valStr === '' || isNaN(valNum)) { valNum = min; } // Default to min if empty/invalid
        valNum = Math.max(min, Math.min(max, valNum)); // Clamp

        const finalValue = step < 1 ? parseFloat(valNum.toFixed(1)) : Math.round(valNum);
        onChange(playerId, field, String(finalValue)); // Update with validated number as string
    };

    return (
        <div className="flex flex-col items-center space-y-1">
            <Label htmlFor={`${playerId}-${field}`} className="text-xs font-medium text-muted-foreground flex items-center">
                <Icon className="h-3 w-3 mr-1" />
                {label}
            </Label>
            <div className="flex items-center gap-1">
                {showButtons && (
                     <Button type="button" variant="outline" size="icon"
                        // --- FIX: Use theme-agnostic glass styling ---
                        className="w-6 h-6 p-0 shrink-0 border-white/20 bg-white/5 hover:bg-white/20"
                        onClick={() => onAdjust(playerId, field, -1, step, min, max)} disabled={isMin} aria-label={`Decrease ${label}`}>
                        <Minus className="h-3 w-3" />
                     </Button>
                 )}
                <Input
                    id={`${playerId}-${field}`}
                    type="text"
                    inputMode={step < 1 ? "decimal" : "numeric"}
                    value={value} // Directly use the string value
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    // --- FIX: Use theme-agnostic glass styling ---
                    className={cn("h-7 text-xs font-semibold text-center px-1 text-foreground bg-white/10 border-white/20 focus:border-primary focus:ring-primary", inputWidth)}
                    placeholder={String(min)}
                    aria-label={label}
                />
                 {showButtons && (
                    <Button type="button" variant="outline" size="icon"
                        // --- FIX: Use theme-agnostic glass styling ---
                        className="w-6 h-6 p-0 shrink-0 border-white/20 bg-white/5 hover:bg-white/20"
                        onClick={() => onAdjust(playerId, field, 1, step, min, max)} disabled={isMax} aria-label={`Increase ${label}`}>
                         <Plus className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </div>
    );
});
PlayerStatInput.displayName = 'PlayerStatInput';


// --- MAIN COMPONENT ---
const PlayerStatsForm: React.FC<PlayerStatsFormProps> = ({ players = [], onStatsChange, gameDuration }) => {

  // Handle direct input change (string value)
  const handleInputChange = useCallback((playerId: string, field: keyof PlayerStatFormData, value: string) => {
    onStatsChange(
      players.map(p => p.id === playerId ? { ...p, [field]: value } : p)
    );
  }, [players, onStatsChange]);

  // Handle adjustments via buttons (+/-)
  const handleAdjustValue = useCallback((playerId: string, field: keyof PlayerStatFormData, delta: number, step: number, min: number, max: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const currentValue = player[field];
    let currentNum = step < 1 ? parseFloat(String(currentValue)) : parseInt(String(currentValue), 10);
    if (isNaN(currentNum)) { currentNum = min; } // Default if current is invalid

    let newValue = currentNum + (delta * step);

    // Precision for floats
    if (step < 1) {
      const precision = String(step).includes('.') ? String(step).split('.')[1].length : 1;
      newValue = parseFloat(newValue.toFixed(precision));
    } else {
      newValue = Math.round(newValue);
    }

    newValue = Math.max(min, Math.min(max, newValue)); // Clamp

    onStatsChange(
      players.map(p => p.id === playerId ? { ...p, [field]: newValue } : p) // Store as number after adjustment
    );
  }, [players, onStatsChange]);

  // Set all players' minutes to game duration
  const setAllMinutes = useCallback(() => {
    onStatsChange(
      // Only set for starters, not subs
      players.map(p => p.isSub ? p : { ...p, minutes_played: gameDuration })
    );
  }, [players, onStatsChange, gameDuration]);

  // --- FIX: Sort players based on starter/sub status, then position ---
  const sortedPlayers = useMemo(() => {
    const getOrder = (position: string) => positionOrder[position.toUpperCase()] || 99; // 99 for unknowns
    return [...players].sort((a, b) => {
      // 1. Sort by isSub (subs last)
      if (a.isSub && !b.isSub) return 1;
      if (!a.isSub && b.isSub) return -1;

      // 2. If both are starters or both are subs, sort by position
      return getOrder(a.position) - getOrder(b.position);
    });
  }, [players]);

  // --- RENDER ---
  return (
    <div className="space-y-3">
        {/* --- FIX: Use theme-agnostic glass styling --- */}
       <Button type="button" variant="outline" size="sm" onClick={setAllMinutes} className="text-xs border-white/20 bg-white/5 hover:bg-white/20">
          Set Starters' Minutes to {gameDuration}
      </Button>

      <div className="space-y-4">
        {/* --- FIX: Map over sortedPlayers --- */}
        {sortedPlayers.map((player) => (
           // --- FIX: Use theme-agnostic glass styling ---
           <div key={player.id} className="p-3 bg-white/5 rounded-lg border border-white/10 shadow-sm backdrop-blur-sm">
            {/* Player Info Row */}
            <div className="flex justify-between items-center mb-3">
               {/* --- FIX: Use theme-aware text color --- */}
              <span className="text-sm font-medium text-foreground truncate pr-2">{player.name || 'Unnamed Player'}</span>
              {/* --- FIX: Use theme-aware accent colors for the badge --- */}
              <span className="text-xs uppercase text-accent-foreground bg-accent px-2 py-0.5 rounded font-semibold">{player.position || 'N/A'}</span>
            </div>

             {/* Stats Grid - Responsive Columns */}
             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-x-2 gap-y-3">
                 <PlayerStatInput
                    playerId={player.id} field="minutes_played" value={player.minutes_played}
                    onChange={handleInputChange} onAdjust={handleAdjustValue} label="Min" Icon={Clock}
                    min={0} max={gameDuration > 90 ? 120 : 90} step={5} inputWidth="w-12"
                 />
                 <PlayerStatInput
                    playerId={player.id} field="rating" value={player.rating}
                    onChange={handleInputChange} onAdjust={handleAdjustValue} label="Rat" Icon={Star}
                    min={0} max={10} step={0.1} inputWidth="w-12"
                 />
                <PlayerStatInput
                    playerId={player.id} field="goals" value={player.goals}
                    onChange={handleInputChange} onAdjust={handleAdjustValue} label="Gls" Icon={Goal}
                    min={0} max={20} step={1} inputWidth="w-12"
                 />
                <PlayerStatInput
                    playerId={player.id} field="assists" value={player.assists}
                    onChange={handleInputChange} onAdjust={handleAdjustValue} label="Ast" Icon={Footprints}
                    min={0} max={20} step={1} inputWidth="w-12"
                 />
                 <PlayerStatInput
                    playerId={player.id} field="yellow_cards" value={player.yellow_cards}
                    onChange={handleInputChange} onAdjust={handleAdjustValue} label="YC" Icon={Square}
                    min={0} max={2} step={1} inputWidth="w-12"
                 />
                 <PlayerStatInput
                    playerId={player.id} field="red_cards" value={player.red_cards}
                    onChange={handleInputChange} onAdjust={handleAdjustValue} label="RC" Icon={SquareCheck}
                    min={0} max={1} step={1} inputWidth="w-12"
                 />
                 <PlayerStatInput
                    playerId={player.id} field="own_goals" value={player.own_goals}
                    onChange={handleInputChange} onAdjust={handleAdjustValue} label="OG" Icon={ShieldAlert}
                    min={0} max={5} step={1} inputWidth="w-12"
                 />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStatsForm;
