
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WeeklyPerformance } from '@/types/futChampions';
import { Calendar, Trophy, Target, TrendingUp } from 'lucide-react';

interface WeekProgressProps {
  weekData: WeeklyPerformance;
  onNewWeek: () => void;
}

const WeekProgress = ({ weekData, onNewWeek }: WeekProgressProps) => {
  const gamesProgress = (weekData.games.length / 15) * 100;
  const winsProgress = (weekData.totalWins / 8) * 100;
  const winRate = weekData.games.length > 0 ? (weekData.totalWins / weekData.games.length) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Week Overview */}
      <Card className="glass-card static-element">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Week Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-fifa-blue">{weekData.games.length}</div>
              <div className="text-sm text-gray-400">Games Played</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-fifa-green">{weekData.totalWins}</div>
              <div className="text-sm text-gray-400">Wins</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Games Progress</span>
                <span className="text-white">{weekData.games.length}/15</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-fifa-blue to-fifa-purple h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(gamesProgress, 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Target Wins</span>
                <span className="text-white">{weekData.totalWins}/8</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-fifa-green to-fifa-gold h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(winsProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card className="glass-card static-element">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-fifa-gold">{winRate.toFixed(0)}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-fifa-purple">{weekData.currentStreak || 0}</div>
              <div className="text-sm text-gray-400">Current Streak</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Goals Scored</span>
              <span className="text-fifa-green font-semibold">{weekData.totalGoals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Goals Conceded</span>
              <span className="text-fifa-red font-semibold">{weekData.totalConceded}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Goal Difference</span>
              <span className={`font-semibold ${weekData.totalGoals - weekData.totalConceded >= 0 ? 'text-fifa-green' : 'text-fifa-red'}`}>
                {weekData.totalGoals - weekData.totalConceded >= 0 ? '+' : ''}{weekData.totalGoals - weekData.totalConceded}
              </span>
            </div>
          </div>

          {weekData.isCompleted && (
            <Button onClick={onNewWeek} className="w-full modern-button-primary">
              <Trophy className="h-4 w-4 mr-2" />
              Start New Week
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeekProgress;
