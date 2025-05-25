
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WeeklyPerformance } from '@/types/futChampions';
import { Calendar, Trophy, Target, TrendingDown, User } from 'lucide-react';
import { useAccountData } from '@/hooks/useAccountData';

interface WeekProgressProps {
  weekData: WeeklyPerformance | null;
  onNewWeek: () => void;
}

const WeekProgress = ({ weekData, onNewWeek }: WeekProgressProps) => {
  const { activeAccount } = useAccountData();

  if (!weekData) {
    return (
      <Card className="section-card animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-white text-xl">
              <div className="p-2 bg-fifa-blue/20 rounded-xl border border-fifa-blue/30">
                <Calendar className="h-5 w-5 text-fifa-blue" />
              </div>
              Start Your First Week
            </CardTitle>
            <Badge variant="outline" className="text-fifa-blue border-fifa-blue/40 bg-fifa-blue/10 rounded-xl px-3 py-1">
              <User className="h-3 w-3 mr-1" />
              {activeAccount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-fifa-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-fifa-blue/60" />
            </div>
            <p className="text-gray-400 mb-6 text-lg">No weeks tracked yet for {activeAccount}. Start your FUT Champions journey!</p>
            <Button onClick={onNewWeek} className="modern-button-primary text-lg px-8 py-4">
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
    <Card className="section-card animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-white text-xl">
            <div className="p-2 bg-fifa-blue/20 rounded-xl border border-fifa-blue/30">
              <Calendar className="h-5 w-5 text-fifa-blue" />
            </div>
            Week {weekData.weekNumber} Progress
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-fifa-gold border-fifa-gold/40 bg-fifa-gold/10 rounded-xl px-3 py-1">
              {gamesPlayed}/15 Games
            </Badge>
            <Badge variant="outline" className="text-fifa-blue border-fifa-blue/40 bg-fifa-blue/10 rounded-xl px-3 py-1">
              <User className="h-3 w-3 mr-1" />
              {activeAccount}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400 font-medium">Games Completed</span>
            <span className="text-sm text-white font-semibold">{gamesPlayed} of 15</span>
          </div>
          <Progress value={progress} className="h-3 rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-6 stagger-animation">
          <div className="metric-card group">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-fifa-green/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Trophy className="h-4 w-4 text-fifa-green" />
              </div>
              <span className="text-xs text-gray-400 font-medium">Wins</span>
            </div>
            <p className="text-3xl font-bold text-fifa-green">{wins}</p>
          </div>
          
          <div className="metric-card group">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-fifa-red/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <TrendingDown className="h-4 w-4 text-fifa-red" />
              </div>
              <span className="text-xs text-gray-400 font-medium">Losses</span>
            </div>
            <p className="text-3xl font-bold text-fifa-red">{losses}</p>
          </div>
        </div>

        {gamesPlayed > 0 && (
          <div className="metric-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-fifa-blue/20 rounded-xl">
                <Target className="h-4 w-4 text-fifa-blue" />
              </div>
              <span className="text-xs text-gray-400 font-medium">Win Rate</span>
            </div>
            <p className="text-3xl font-bold text-fifa-blue">{winRate.toFixed(1)}%</p>
          </div>
        )}

        {weekData.isCompleted && (
          <Button onClick={onNewWeek} className="w-full modern-button-primary text-lg py-4">
            Start Next Week
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default WeekProgress;
