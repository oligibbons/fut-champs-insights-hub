// src/components/GameCompletionModal.tsx (User's Provided Version - requires game and weekData)
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'; // Ensure DialogClose is imported if needed
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
// ** Use reconciled types **
import { Game, WeeklyPerformance, PlayerPerformance } from '@/types/futChampions';
import { generatePostMatchFeedback } from '@/utils/aiInsights'; // Assuming this exists and works
import { Trophy, Target, TrendingUp, Star, Calendar, Clock, Zap, Sparkles, Award, Shield, BarChart3, Users } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface GameCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null; // Expects the specific game data
  weekData: WeeklyPerformance | null; // Expects the full week data
  // onCompleteRun?: () => void; // Add this back if needed
}

const GameCompletionModal = ({ isOpen, onClose, game, weekData }: GameCompletionModalProps) => {
  const { currentTheme } = useTheme();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    // Reset states when opening
    setShowInsights(false);
    setShowCelebration(false);
    setInsights([]);

    if (isOpen && game && weekData) {
        // Ensure weekData.games is an array before using it
        const currentWeekDataWithGames = {
            ...weekData,
            games: Array.isArray(weekData.games) ? weekData.games : [],
        };

        try {
            const gameInsights = generatePostMatchFeedback(game, currentWeekDataWithGames);
            if (gameInsights && gameInsights.length > 0) {
                 setInsights(gameInsights);
             } else {
                 setInsights([game.result === 'win' ? "Great win! Keep up the momentum." : "Tough loss. Learn from it!"]);
             }
        } catch (error) {
            console.error("Error generating AI insights:", error);
            setInsights(["Could not generate insights for this game."]); // Fallback on error
        }


      if (game.result === 'win') {
        setShowCelebration(true);
        const celebrationTimer = setTimeout(() => setShowCelebration(false), 3000);
         // Clear timer on cleanup
         return () => clearTimeout(celebrationTimer);
      }

      const insightTimer = setTimeout(() => setShowInsights(true), 1000); // Show insights a bit faster
      return () => clearTimeout(insightTimer); // Clear timer on cleanup
    }
  }, [isOpen, game, weekData]);


  if (!game || !weekData) {
    return null;
  }

   // Ensure weekData.games is an array for calculations
   const gamesInWeek = Array.isArray(weekData.games) ? weekData.games : [];

   const weekStats = {
     totalGames: gamesInWeek.length, // Calculate based on fetched games array
     wins: weekData.total_wins ?? 0,
     losses: weekData.total_losses ?? 0,
     winRate: gamesInWeek.length > 0 ? ((weekData.total_wins ?? 0) / gamesInWeek.length) * 100 : 0,
     currentStreak: weekData.current_streak ?? 0, // Use current_streak from DB
   };

  const isWin = game.result === 'win';
  // Use actual goals from game object
  const goalsFor = game.user_goals ?? 0;
  const goalsAgainst = game.opponent_goals ?? 0;
  const scoreLine = `${goalsFor}-${goalsAgainst}`; // Use direct game goals

  // Chart data generation (using optional chaining and defaults)
  const teamStatsData = [
    { name: 'Possession', value: game.team_stats?.possession ?? 50, color: '#3b82f6' },
    { name: 'Pass Acc.', value: game.team_stats?.pass_accuracy ?? 75, color: '#8b5cf6' },
    { name: 'Shot Acc.', value: (game.team_stats?.shots ?? 0) > 0 ? ((game.team_stats?.shots_on_target ?? 0) / game.team_stats!.shots!) * 100 : 0, color: '#10b981' }
  ];

  const xgData = [
    { name: 'Goals', expected: game.team_stats?.expected_goals ?? 0, actual: goalsFor },
    { name: 'Conceded', expected: game.team_stats?.expected_goals_against ?? 0, actual: goalsAgainst }
  ];

  const playerPerformanceData = (game.player_performances || [])
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)) // Handle null ratings
    .slice(0, 5)
    .map(player => ({
      name: player.player_name.length > 10 ? player.player_name.substring(0, 10) + '...' : player.player_name,
      rating: player.rating ?? 0, // Handle null ratings
      goals: player.goals ?? 0,
      assists: player.assists ?? 0
    }));

  const renderMatchTags = () => {
    if (!game.tags || game.tags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {game.tags.map(tag => (
          <Badge key={tag} variant="secondary" className="backdrop-blur-sm bg-black/30 border-white/30 text-white">
            {tag}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl rounded-3xl shadow-3xl border-0 p-0 overflow-hidden max-h-[90vh] flex flex-col" // Added flex flex-col
        style={{ backgroundColor: currentTheme.colors.cardBg }}
      >
        {/* Celebration Overlay */}
        {showCelebration && isWin && ( /* ... celebration elements ... */ )}

        {/* Header */}
         <div className={`p-6 sm:p-8 text-center relative overflow-hidden shrink-0 ${ /* ... header bg gradient ... */ }`}>
            {/* ... header elements (icon, result text, scoreline, badges) ... */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ... ${ isWin ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600' }`}>
               {isWin ? <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-white animate-bounce" /> : <Target className="h-8 w-8 sm:h-10 sm:w-10 text-white" />}
            </div>
             <h2 className={`text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 ${isWin ? 'text-green-300' : 'text-red-300'} animate-fade-in`}>{isWin ? 'VICTORY!' : 'DEFEAT'}</h2>
             <div className="text-4xl sm:text-5xl font-bold text-white mb-4 sm:mb-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>{scoreLine}</div>
             <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-xs sm:text-sm">
                <Badge variant="outline" className="px-3 py-1 sm:px-4 sm:py-2 bg-black/30 ..."><Clock className="h-4 w-4 mr-1.5" />{game.duration} min</Badge>
                {/* Use opponent_skill from Game type */}
                <Badge variant="outline" className="px-3 py-1 sm:px-4 sm:py-2 bg-black/30 ..."><Star className="h-4 w-4 mr-1.5" />Opponent {game.opponent_skill ?? '?'}/10</Badge>
                {/* ... other badges ... */}
             </div>
             {renderMatchTags()}
         </div>

        {/* Scrollable Content Area */}
        <ScrollArea className="flex-grow overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6"> {/* Add padding inside scroll */}
              {/* Performance Charts Section */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Performance Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 sm:p-4 rounded-xl bg-white/5"> {/* Team Performance Chart */} {/* ... chart code ... */} </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-white/5"> {/* xG Chart */} {/* ... chart code ... */} </div>
                </div>
              </div>

              {/* Player Performance Chart */}
              <div>
                 <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2"><Users className="h-5 w-5" /> Player Performances</h3>
                 {playerPerformanceData.length > 0 ? ( <ResponsiveContainer width="100%" height={200}> {/* ... chart code ... */} </ResponsiveContainer> ) : <p className="text-gray-400 text-center py-4">No player data</p>}
              </div>

              {/* Week Performance Stats */}
              <div>
                 <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Week Summary</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                      {/* ... Stat Boxes using weekStats ... */}
                     <div className="text-center p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5"><p className="text-2xl sm:text-3xl font-bold text-primary">{weekStats.totalGames}</p><p className="text-xs sm:text-sm text-gray-400">Games</p></div>
                     <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10"><p className="text-2xl sm:text-3xl font-bold text-green-400">{weekStats.wins}</p><p className="text-xs sm:text-sm text-gray-400">Wins</p></div>
                     {/* ... Losses, Streak ... */}
                 </div>
                 {/* ... Win Rate Bar ... */}
              </div>

              {/* AI Insights Section */}
              <div>
                 <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-400" /> Instant AI Analysis</h3>
                 <div className="space-y-3 sm:space-y-4">
                    {/* ... insights mapping ... */}
                     {insights.length > 0 ? ( insights.map((insight, index) => ( <div key={index} className={`p-4 sm:p-5 rounded-xl border ... ${showInsights ? 'opacity-100' : 'opacity-0'}`} > {/* ... insight content ... */} </div> )) ) : ( <div className="text-center py-6"> {/* ... loading/no insights ... */} </div> )}
                 </div>
              </div>
            </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-black/20 to-transparent shrink-0">
             <DialogClose asChild>
                <Button onClick={onClose} className="w-full text-base sm:text-lg py-3 h-auto rounded-xl font-semibold modern-button-primary group">
                    Continue Journey
                </Button>
            </DialogClose>
             {/* ... Optional streak message ... */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameCompletionModal;
