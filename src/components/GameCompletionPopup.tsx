import { GameResult, PlayerPerformance } from '@/types/futChampions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Shield, BarChart2, Users, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GameCompletionPopupProps {
  game: GameResult | null;
  isOpen: boolean;
  onClose: () => void;
}

const GameCompletionPopup = ({ game, isOpen, onClose }: GameCompletionPopupProps) => {
  if (!game) return null;

  const getManOfTheMatch = (): PlayerPerformance | null => {
    if (!game.playerStats || game.playerStats.length === 0) return null;
    return game.playerStats.reduce((motm, player) => player.rating > motm.rating ? player : motm, game.playerStats[0]);
  };

  const motm = getManOfTheMatch();

  const StatRow = ({ label, userValue, oppValue }: { label: string, userValue: string | number, oppValue: string | number }) => (
    <div className="flex justify-between items-center py-2">
      <p className="font-semibold text-primary">{userValue}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold text-muted-foreground">{oppValue}</p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-secondary border-border">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center text-center">
            <Trophy className={`h-12 w-12 mb-2 ${game.result === 'win' ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-2xl font-bold">Match Report</span>
            <span className={`text-5xl font-bold mt-2 ${game.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
              {game.scoreLine}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-background/50 p-4 rounded-lg">
            <h3 className="font-semibold text-center mb-2 text-muted-foreground">Match Stats</h3>
            <StatRow label="xG" userValue={game.teamStats?.expectedGoals?.toFixed(1) ?? 'N/A'} oppValue={game.teamStats?.expectedGoalsAgainst?.toFixed(1) ?? 'N/A'} />
            <StatRow label="Shots" userValue={game.teamStats?.shots ?? 'N/A'} oppValue={'N/A'} />
            <StatRow label="Possession %" userValue={game.teamStats?.possession ?? 'N/A'} oppValue={100 - (game.teamStats?.possession ?? 50)} />
          </div>

          {motm && (
            <div className="pt-4 text-center">
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
          {game.tags && game.tags.length > 0 && (
             <div className="pt-4 text-center">
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
