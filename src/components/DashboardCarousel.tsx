
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Trophy, Target, TrendingUp, Users, BarChart3, Star, Award, Clock } from 'lucide-react';
import { WeeklyPerformance } from '@/types/futChampions';
import { useDataSync } from '@/hooks/useDataSync';

interface DashboardCarouselProps {
  weeklyData: WeeklyPerformance[];
  currentWeek: WeeklyPerformance | null;
  enabledTiles: string[];
}

const DashboardCarousel = ({ weeklyData, currentWeek }: DashboardCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings } = useDataSync();

  // Calculate real statistics from weekly data
  const calculateStats = () => {
    if (!weeklyData.length && !currentWeek) return null;
    
    const allWeeks = [...weeklyData];
    if (currentWeek && currentWeek.games.length > 0) {
      allWeeks.push(currentWeek);
    }
    
    const allGames = allWeeks.flatMap(week => week.games || []);
    
    if (allGames.length === 0) return null;

    // Calculate averages from actual game data
    const totalPasses = allGames.reduce((sum, game) => sum + (game.teamStats?.passes || 0), 0);
    const totalPossession = allGames.reduce((sum, game) => sum + (game.teamStats?.possession || 50), 0);
    const totalPassAccuracy = allGames.reduce((sum, game) => sum + (game.teamStats?.passAccuracy || 75), 0);
    const totalPlayerRating = allGames.reduce((sum, game) => {
      const gameAvg = (game.playerStats || []).reduce((pSum, player) => pSum + player.rating, 0) / Math.max((game.playerStats || []).length, 1);
      return sum + (gameAvg || 6.5);
    }, 0);
    const totalXG = allGames.reduce((sum, game) => sum + (game.teamStats?.expectedGoals || 0), 0);
    const totalGoals = allGames.reduce((sum, game) => {
      const [goals] = game.scoreLine.split('-').map(Number);
      return sum + goals;
    }, 0);

    return {
      avgPasses: totalPasses > 0 ? Math.round(totalPasses / allGames.length) : 0,
      avgPossession: Math.round(totalPossession / allGames.length),
      passAccuracy: Math.round(totalPassAccuracy / allGames.length),
      avgPlayerRating: +(totalPlayerRating / allGames.length).toFixed(1),
      xgVsGoals: totalXG > 0 ? +(totalGoals / totalXG).toFixed(2) : totalGoals
    };
  };

  // Calculate current week performance score
  const calculateWeekScore = () => {
    if (!currentWeek || !currentWeek.games.length) return { grade: 'F', score: 0 };
    
    const games = currentWeek.games;
    const winRate = (currentWeek.totalWins / games.length) * 100;
    const avgOpponentSkill = games.reduce((sum, game) => sum + game.opponentSkill, 0) / games.length;
    const goalRatio = currentWeek.totalConceded > 0 ? currentWeek.totalGoals / currentWeek.totalConceded : currentWeek.totalGoals;
    
    // Scoring algorithm
    let score = 0;
    score += winRate * 0.5; // Win rate contributes 50%
    score += (avgOpponentSkill - 5) * 5; // Opponent difficulty adjustment
    score += Math.min(goalRatio * 10, 25); // Goal ratio (capped at 25)
    score += currentWeek.currentStreak * 2; // Streak bonus
    
    score = Math.max(0, Math.min(100, score));
    
    let grade = 'F';
    if (score >= 90) grade = 'S';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 50) grade = 'D';
    
    return { grade, score: Math.round(score) };
  };

  const stats = calculateStats();
  const weekScore = calculateWeekScore();

  // Calculate per-90 stats for top performers
  const calculateTopPerformers = () => {
    if (!currentWeek?.games.length) return [];
    
    const playerStats = new Map();
    
    currentWeek.games.forEach(game => {
      game.playerStats?.forEach(player => {
        const existing = playerStats.get(player.name) || {
          name: player.name,
          position: player.position,
          totalMinutes: 0,
          goals: 0,
          assists: 0,
          totalRating: 0,
          gamesPlayed: 0
        };
        
        existing.totalMinutes += player.minutesPlayed;
        existing.goals += player.goals;
        existing.assists += player.assists;
        existing.totalRating += player.rating;
        existing.gamesPlayed += 1;
        
        playerStats.set(player.name, existing);
      });
    });
    
    return Array.from(playerStats.values())
      .map(player => ({
        ...player,
        goalsPer90: player.totalMinutes > 0 ? (player.goals * 90) / player.totalMinutes : 0,
        assistsPer90: player.totalMinutes > 0 ? (player.assists * 90) / player.totalMinutes : 0,
        goalInvolvementsPer90: player.totalMinutes > 0 ? ((player.goals + player.assists) * 90) / player.totalMinutes : 0,
        averageRating: player.gamesPlayed > 0 ? player.totalRating / player.gamesPlayed : 0
      }))
      .filter(player => player.goalInvolvementsPer90 > 0 || player.averageRating >= 7.0)
      .sort((a, b) => b.goalInvolvementsPer90 - a.goalInvolvementsPer90)
      .slice(0, 3);
  };

  const topPerformers = calculateTopPerformers();

  const carouselItems = [
    {
      id: 'top-performers',
      title: 'Top Performers (Per 90)',
      icon: Trophy,
      content: (
        <div className="space-y-3">
          {topPerformers.length > 0 ? topPerformers.map((player, index) => (
            <div key={`${player.name}-${index}`} className="flex items-center justify-between p-2 rounded bg-white/5">
              <div>
                <p className="font-medium text-white text-sm">{player.name}</p>
                <p className="text-xs text-gray-400">{player.position} • {player.totalMinutes} mins</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-fifa-gold">{player.goalInvolvementsPer90.toFixed(1)}</p>
                <p className="text-xs text-gray-400">G+A/90</p>
                <p className="text-xs text-gray-300">{player.goalsPer90.toFixed(1)}G {player.assistsPer90.toFixed(1)}A</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-4">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <p className="text-gray-400 text-sm">No recent games</p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'key-match-facts',
      title: 'Key Match Facts',
      icon: BarChart3,
      content: (
        <div className="space-y-3">
          {stats ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded bg-white/5">
                  <p className="font-bold text-fifa-blue text-lg">{stats.avgPasses}</p>
                  <p className="text-xs text-gray-400">Avg Passes</p>
                </div>
                <div className="text-center p-2 rounded bg-white/5">
                  <p className="font-bold text-fifa-green text-lg">{stats.avgPossession}%</p>
                  <p className="text-xs text-gray-400">Avg Possession</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded bg-white/5">
                  <p className="font-bold text-fifa-purple text-lg">{stats.passAccuracy}%</p>
                  <p className="text-xs text-gray-400">Pass Accuracy</p>
                </div>
                <div className="text-center p-2 rounded bg-white/5">
                  <p className="font-bold text-fifa-gold text-lg">{stats.avgPlayerRating}</p>
                  <p className="text-xs text-gray-400">Avg Rating</p>
                </div>
              </div>
              <div className="text-center p-2 rounded bg-white/5">
                <p className="font-bold text-fifa-red text-lg">{stats.xgVsGoals}</p>
                <p className="text-xs text-gray-400">XG vs Goals Ratio</p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <p className="text-gray-400 text-sm">No match data available</p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'weekly-performance',
      title: 'Weekly Performance Score',
      icon: Award,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className={`inline-block w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
              weekScore.grade === 'S' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' :
              weekScore.grade === 'A' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
              weekScore.grade === 'B' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
              weekScore.grade === 'C' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' :
              weekScore.grade === 'D' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
              'bg-gradient-to-r from-red-500 to-red-700 text-white'
            }`}>
              {weekScore.grade}
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white mb-1">{weekScore.score}</p>
            <p className="text-sm text-gray-400">Performance Score</p>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-fifa-blue to-fifa-purple rounded-full transition-all duration-500"
              style={{ width: `${weekScore.score}%` }}
            />
          </div>
          {currentWeek?.games.length ? (
            <p className="text-xs text-gray-400 text-center">
              Based on {currentWeek.games.length} games this week
            </p>
          ) : (
            <p className="text-xs text-gray-400 text-center">
              Play games to get your score
            </p>
          )}
        </div>
      )
    },
    {
      id: 'recent-form',
      title: 'Recent Form',
      icon: TrendingUp,
      content: (
        <div className="space-y-3">
          {currentWeek?.games.length ? (
            <>
              <div className="flex justify-center gap-1 mb-3">
                {currentWeek.games.slice(-5).map((game, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      game.result === 'win' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {game.result === 'win' ? 'W' : 'L'}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded bg-white/5">
                  <p className="font-bold text-green-400 text-lg">{currentWeek.totalWins}</p>
                  <p className="text-xs text-gray-400">Wins</p>
                </div>
                <div className="text-center p-2 rounded bg-white/5">
                  <p className="font-bold text-red-400 text-lg">{currentWeek.totalLosses}</p>
                  <p className="text-xs text-gray-400">Losses</p>
                </div>
              </div>
              <div className="text-center p-2 rounded bg-white/5">
                <p className="font-bold text-fifa-gold text-lg">{currentWeek.currentStreak || 0}</p>
                <p className="text-xs text-gray-400">Current Streak</p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <p className="text-gray-400 text-sm">No recent games</p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'weekly-targets',
      title: 'Weekly Targets',
      icon: Target,
      content: (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Games Played</span>
              <span className="text-sm font-bold text-white">
                {currentWeek?.games.length || 0}/15
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="h-2 bg-fifa-blue rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((currentWeek?.games.length || 0) / 15) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Target Wins</span>
              <span className="text-sm font-bold text-white">
                {currentWeek?.totalWins || 0}/8
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="h-2 bg-fifa-green rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((currentWeek?.totalWins || 0) / 8) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="text-center p-2 rounded bg-white/5">
            <p className="font-bold text-fifa-purple text-lg">
              {currentWeek?.games.length ? Math.round(((currentWeek.totalWins || 0) / currentWeek.games.length) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-400">Win Rate</p>
          </div>
        </div>
      )
    }
  ];

  // Auto-scroll functionality with user-defined interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, (settings.carouselSpeed || 12) * 1000);

    return () => clearInterval(interval);
  }, [carouselItems.length, settings.carouselSpeed]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  return (
    <Card className="glass-card relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">Performance Overview</CardTitle>
      </CardHeader>
      <CardContent className="relative h-80">
        <div className="flex transition-transform duration-500 ease-in-out h-full"
             style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {carouselItems.map((item, index) => (
            <div key={item.id} className="w-full flex-shrink-0 px-2">
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <item.icon className="h-5 w-5 text-fifa-blue" />
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                </div>
                <div className="flex-1">
                  {item.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-white" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-white" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-fifa-blue' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCarousel;
