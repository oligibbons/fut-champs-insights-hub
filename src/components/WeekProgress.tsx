import { WeeklyPerformance, getRewardRanks } from '@/types/futChampions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Trophy, TrendingUp } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WeekProgressProps {
  currentWeek: WeeklyPerformance | null;
}

const WeekProgress = ({ currentWeek }: WeekProgressProps) => {
  const [gameVersion] = useLocalStorage('gameVersion', 'FC26');
  const rewardRanks = getRewardRanks(gameVersion);

  // The total number of games in a weekend is 15 for both versions.
  const TOTAL_GAMES = 15;
  const MAX_WINS = 15;

  if (!currentWeek) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5 text-fifa-blue" />
            <span>Week Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No active week found.</p>
        </CardContent>
      </Card>
    );
  }

  const { totalWins, games } = currentWeek;
  
  // ---
  // --- !! FIX IS HERE !! ---
  // ---
  // `games` (from `currentWeek.games`) can be null or undefined.
  // We must use optional chaining (?.) and nullish coalescing (??)
  // to safely get the length, defaulting to 0.
  // ---
  const gamesPlayed = games?.length ?? 0;
  
  const progressPercentage = (gamesPlayed / TOTAL_GAMES) * 100;

  // Use totalWins (which is safely 0 if not present) for rank calculation
  const safeTotalWins = totalWins ?? 0;
  const nextReward = rewardRanks.find(rank => rank.wins > safeTotalWins);
  const currentRank = rewardRanks.slice().reverse().find(rank => safeTotalWins >= rank.wins);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="h-5 w-5 text-fifa-blue" />
          <span>Week Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2 font-semibold">
            <span className="text-fifa-gold">Games Played: {gamesPlayed} / {TOTAL_GAMES}</span>
            <span className="text-white">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        <div className="flex flex-col sm:flex-row justify-around items-center text-center gap-4">
          <div>
            <p className="text-gray-400">Current Rank</p>
            <p className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-fifa-gold" />
              {currentRank ? currentRank.rank : 'Unranked'}
            </p>
            <p className="text-sm text-gray-400">({safeTotalWins} wins)</p>
          </div>

          {nextReward && gamesPlayed < TOTAL_GAMES && (
            <div className="p-4 rounded-lg bg-white/5 border border-gray-700/50">
              <p className="text-gray-400 flex items-center justify-center gap-2">
                <Target className="h-5 w-5 text-fifa-green" />
                Next Reward
              </p>
              <p className="text-xl font-bold text-white">{nextReward.rank}</p>
              <p className="text-sm text-fifa-green">
                {nextReward.wins - safeTotalWins} more win(s) needed
              </p>
            </div>
          )}
        </div>

        {/* Detailed Reward Timeline */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-center">Reward Timeline</h4>
          <div className="w-full overflow-x-auto pb-4">
            <div className="relative flex items-center min-w-[600px] h-12 px-2">
              {/* Background Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -translate-y-1/2"></div>
              {/* Progress Line */}
              <div 
                className="absolute top-1/2 left-0 h-1 bg-fifa-gold transition-all duration-500 -translate-y-1/2"
                style={{ width: `${(safeTotalWins / MAX_WINS) * 100}%` }}
              ></div>
              
              <TooltipProvider>
                {Array.from({ length: MAX_WINS + 1 }, (_, i) => i).map((winCount) => {
                  const rankAtWin = rewardRanks.find(r => r.wins === winCount);
                  const isAchieved = safeTotalWins >= winCount;
                  
                  return (
                    <div 
                      key={winCount} 
                      className="flex-1 flex justify-center"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="z-10 flex flex-col items-center group cursor-pointer">
                            {/* Checkpoint Circle */}
                            <div className={`
                              w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300
                              ${isAchieved ? 'bg-fifa-gold border-white' : 'bg-gray-800 border-gray-600'}
                              ${rankAtWin ? 'w-6 h-6' : ''}
                            `}>
                              {isAchieved && rankAtWin && <Trophy className="h-3 w-3 text-gray-900" />}
                            </div>
                            {rankAtWin && <span className="text-xs mt-2 text-gray-400 group-hover:text-white">{rankAtWin.rank}</span>}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-bold">{winCount} Wins</p>
                          {rankAtWin && <p>{rankAtWin.rank}</p>}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  );
                })}
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekProgress;
