import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { FutChampionRun } from '@/types/futChampions';

interface RunCardProps {
  run: FutChampionRun;
}

const RunCard: React.FC<RunCardProps> = ({ run }) => {
  const wins = run.games.filter(game => game.result === 'win').length;
  const losses = run.games.filter(game => game.result === 'loss').length;
  const gamesPlayed = run.games.length;
  const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;

  const getTrendIcon = () => {
    if (winRate > 50) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (winRate < 50) return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-gray-500" />;
  };

  return (
    <Card className="shimmer-effect glow-effect">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{run.name || `Run ${run.id}`}</CardTitle>
        {getTrendIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{wins} - {losses}</div>
        <p className="text-xs text-muted-foreground">{gamesPlayed} Games Played</p>
        <Button variant="outline" size="sm" className="mt-4">
          View Details <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default RunCard;
