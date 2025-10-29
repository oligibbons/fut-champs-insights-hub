import { useCallback, memo, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Star, Goal, Footprints, Clock, Square, SquareCheck, ShieldAlert } from 'lucide-react';
// --- ADDED CardType IMPORT ---
import { CardType } from '@/types/squads';
import { cn } from '@/lib/utils';

// Type specifically for the data structure used within this form component
type PlayerStatFormData = {
  id: string; // player_id (UUID)
  name: string;
  position: string;
  isSub: boolean; 
  card_type: string; // --- ADDED ---
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
  // --- 
  // FIX 3: Player Card Colors
  // - Added cardTypes to props
  // ---
  cardTypes: CardType[]; 
}

// --- Define the logical sort order for positions ---
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
                        // --- FIX: Use theme-aware colors ---
                        className="w-6 h-6 p-0 shrink-0 border-border/50 bg-accent/50 hover:bg-accent"
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
                    // --- FIX: Use theme-aware colors ---
                    className={cn("h-7 text-xs font-semibold text-center px-1 text-foreground bg-input/50 border-border/50 focus:border-primary focus:ring-primary", inputWidth)}
                    placeholder={String(min)}
                    aria-label={label}
                />
                 {showButtons && (
                    <Button type="button" variant="outline" size="icon"
                        // --- FIX: Use theme-aware colors ---
                        className="w-6 h-6 p-0 shrink-0 border-border/50 bg-accent/50 hover:bg-accent"
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
const PlayerStatsForm: React.FC<PlayerStatsFormProps> = ({ players = [], onStatsChange, gameDuration, cardTypes }) => {

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

  // --- Sort players based on starter/sub status, then position ---
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
       <Button type="button" variant="outline" size="sm" onClick={setAllMinutes} className="text-xs">
          Set Starters' Minutes to {gameDuration}
      </Button>

      <div className="space-y-4">
        {/* --- 
         FIX 3: Player Card Colors
         - Map over sortedPlayers with new card design
         - Dynamically find and apply card colors using inline styles
        --- */}
        {sortedPlayers.map((player) => {
          // Parse rating safely, as it can be a string from input
          const displayRating = parseFloat(String(player.rating))?.toFixed(1) || '0.0';

          // --- Find card style ---
          const cardStyle = cardTypes.find(ct => ct.name === player.card_type);
          const pColor = cardStyle?.primary_color || 'hsl(var(--background))'; // Fallback to bg
          const sColor = cardStyle?.secondary_color || 'hsl(var(--foreground))'; // Fallback to text
          const hColor = cardStyle?.highlight_color || 'hsl(var(--primary))'; // Fallback to primary

          return (
             <div 
                key={player.id} 
                className={cn(
                  "rounded-lg border border-border/50 shadow-md relative overflow-hidden transition-all",
                  "bg-background/70 backdrop-blur-sm", // Main card bg
                  player.isSub ? "opacity-80" : "" // Dim subs slightly
                )}
              >
                {/* Card Header: Rating, Name, Position, Minutes */}
                <div 
                  className={cn(
                    "flex items-start sm:items-center justify-between p-3 border-b-2 flex-col sm:flex-row gap-3 sm:gap-0" // Stack on mobile
                  )}
                  // --- Style applied dynamically ---
                  style={{ 
                    backgroundColor: pColor, 
                    color: sColor, 
                    borderBottomColor: hColor 
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Rating Circle */}
                    <div 
                      className="flex flex-col items-center justify-center w-12 h-12 rounded-lg border shrink-0"
                      // --- Style applied dynamically ---
                      style={{ 
                        backgroundColor: hColor, 
                        color: pColor, // Use primary color for text for contrast
                        borderColor: hColor 
                      }}
                    >
                      <span className="text-lg font-bold leading-none">
                        {displayRating}
                      </span>
                      <span className="text-[10px] leading-none tracking-wide" style={{ opacity: 0.8 }}>RAT</span>
                    </div>
                    
                    {/* Name and Position */}
                    <div>
                      <h4 className="text-base font-semibold truncate" style={{ color: sColor }}>
                        {player.name || 'Unnamed Player'}
                      </h4>
                      <span 
                        className="text-xs uppercase px-2 py-0.5 rounded font-semibold"
                        // --- Style applied dynamically ---
                        style={{ 
                          backgroundColor: 'transparent', 
                          color: sColor, 
                          border: `1px solid ${sColor}`,
                          opacity: 0.8
                        }}
                      >
                        {player.position || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Minutes Played (pulled out of grid) */}
                  <div className="shrink-0 sm:pl-2">
                    {/* This component's inputs are styled to be theme-aware */}
                    <PlayerStatInput
                        playerId={player.id} field="minutes_played" value={player.minutes_played}
                        onChange={handleInputChange} onAdjust={handleAdjustValue} label="Min" Icon={Clock}
                        min={0} max={gameDuration > 90 ? 120 : 90} step={5} inputWidth="w-12"
                    />
                  </div>
                </div>
                
                {/* Stats Grid (Goals, Assists, Cards, etc.) */}
                <div className="p-3 grid grid-cols-3 sm:grid-cols-5 gap-x-2 gap-y-4">
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
          )
        })}
      </div>
    </div>
  );
};

export default PlayerStatsForm;