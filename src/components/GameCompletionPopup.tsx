import { GameResult, PlayerPerformance, WeeklyPerformance } from '@/types/futChampions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Shield, Users, Target, Clock, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GameCompletionPopupProps {
  game: GameResult | null;
  weekStats: {
    winRate: number;
    currentStreak: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

const GameCompletionPopup = ({ game, isOpen, onClose, weekStats }: GameCompletionPopupProps) => {
  if (!game) return null;

  const getManOfTheMatch = (): PlayerPerformance | null => {
    if (!game.playerStats || game.playerStats.length === 0) return null;
    return game.playerStats.reduce((motm, player) => player.rating > motm.rating ? player : motm, game.playerStats[0]);
  };

  const motm = getManOfTheMatch();

  const StatRow = ({ label, userValue, oppValue }: { label: string, userValue: string | number, oppValue: string | number }) => (
    <div className="flex justify-between items-center py-2 text-sm">
      <p className="font-bold text-primary w-1/3 text-left">{userValue}</p>
      <p className="text-muted-foreground w-1/3 text-center">{label}</p>
      <p className="font-bold text-muted-foreground w-1/3 text-right">{oppValue}</p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-secondary border-border">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center text-center space-y-2">
            <Trophy className={`h-12 w-12 ${game.result === 'win' ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-2xl font-bold">Match Report</span>
            <span className={`text-5xl font-bold ${game.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
              {game.scoreLine}
            </span>
            {game.penaltyShootout && (
              <span className="text-sm text-muted-foreground">(Won on penalties {game.penaltyShootout.userScore}-{game.penaltyShootout.opponentScore})</span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="bg-background/50 p-4 rounded-lg">
            <h3 className="font-semibold text-center mb-2 text-muted-foreground flex items-center justify-center gap-2"><BarChart3 size={16}/> Team Stats</h3>
            <StatRow label="xG" userValue={game.teamStats?.expectedGoals?.toFixed(1) ?? 'N/A'} oppValue={game.teamStats?.expectedGoalsAgainst?.toFixed(1) ?? 'N/A'} />
            <StatRow label="Shots" userValue={game.teamStats?.shots ?? 'N/A'} oppValue={'N/A'} />
            <StatRow label="On Target" userValue={game.teamStats?.shotsOnTarget ?? 'N/A'} oppValue={'N/A'} />
            <StatRow label="Possession" userValue={`${game.teamStats?.possession ?? 50}%`} oppValue={`${100 - (game.teamStats?.possession ?? 50)}%`} />
          </div>

          {motm && (
            <div className="text-center">
              <h3 className="font-semibold mb-2 text-muted-foreground">Man of the Match</h3>
              <div className="p-4 rounded-lg bg-background/50">
                <p className="text-xl font-bold text-primary">{motm.name}</p>
                <div className="flex justify-center items-center gap-4 mt-2">
                  <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400" />{motm.rating.toFixed(1)}</div>
                  <div className="flex items-center gap-1"><Target className="h-4 w-4 text-green-400" />{motm.goals} G</div>
                  <div className="flex items-center gap-1"><Users className="h-4 w-4 text-blue-400" />{motm.assists} A</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-background/50 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Opponent Skill</p>
                <p className="text-xl font-bold">{game.opponentSkill}/10</p>
            </div>
             <div className="bg-background/50 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-xl font-bold flex items-center justify-center gap-2"><Clock size={16}/>{game.duration}'</p>
            </div>
          </div>

          {game.tags && game.tags.length > 0 && (
             <div className="text-center">
                <h3 className="font-semibold mb-2 text-muted-foreground">Match Tags</h3>
                <div className="flex flex-wrap justify-center gap-2">
                    {game.tags.map(tag => <Badge key={tag} variant="secondary">{tag.replace(/-/g, ' ')}</Badge>)}
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameCompletionPopup;
