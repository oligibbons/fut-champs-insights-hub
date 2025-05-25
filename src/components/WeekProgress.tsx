
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WeeklyPerformance } from '@/types/futChampions';
import { Calendar, Trophy, Target, TrendingDown } from 'lucide-react';

interface WeekProgressProps {
  weekData: WeeklyPerformance | null;
  onNewWeek: () => void;
}

const WeekProgress = ({ weekData, onNewWeek }: WeekProgressProps) => {
  if (!weekData) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-fifa-blue" />
            Start Your First Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No weeks tracked yet. Start your FUT Champions journey!</p>
            <Button onClick={onNewWeek} className="bg-fifa-gradient">
              Start Week 1
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const gamesPlayed = weekData.games.length;
  const progress = (gamesPlayed / 15) * 100;
  const wins = weekData.totalWins;
  const losses = weekData.totalLosses;
  const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-fifa-blue" />
            Week {weekData.weekNumber} Progress
          </CardTitle>
          <Badge variant="outline" className="text-fifa-gold border-fifa-gold">
            {gamesPlayed}/15 Games
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Games Completed</span>
            <span className="text-sm text-white">{gamesPlayed} of 15</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-fifa-green/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-fifa-green" />
              <span className="text-xs text-gray-400">Wins</span>
            </div>
            <p className="text-2xl font-bold text-fifa-green">{wins}</p>
          </div>
          
          <div className="p-4 bg-fifa-red/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-fifa-red" />
              <span className="text-xs text-gray-400">Losses</span>
            </div>
            <p className="text-2xl font-bold text-fifa-red">{losses}</p>
          </div>
        </div>

        {gamesPlayed > 0 && (
          <div className="p-4 bg-fifa-blue/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-fifa-blue" />
              <span className="text-xs text-gray-400">Win Rate</span>
            </div>
            <p className="text-2xl font-bold text-fifa-blue">{winRate.toFixed(1)}%</p>
          </div>
        )}

        {weekData.isCompleted && (
          <Button onClick={onNewWeek} className="w-full bg-fifa-gradient">
            Start Next Week
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default WeekProgress;
