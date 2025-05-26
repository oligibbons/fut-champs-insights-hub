
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { WeeklyPerformance, PlayerPerformance } from '@/types/futChampions';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Users, 
  BarChart3,
  Brain,
  Zap,
  Shield,
  Crown
} from 'lucide-react';

interface CurrentWeekCarouselProps {
  currentWeek: WeeklyPerformance | null;
  enabledTiles: string[];
}

const CurrentWeekCarousel = ({ currentWeek, enabledTiles }: CurrentWeekCarouselProps) => {
  if (!currentWeek) return null;

  // Calculate current week stats
  const games = currentWeek.games;
  const totalGames = games.length;
  const wins = currentWeek.totalWins;
  const losses = currentWeek.totalLosses;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  
  // Get all player performances from this week
  const allPlayerPerformances: PlayerPerformance[] = games.flatMap(game => game.playerStats || []);
  
  // Calculate top performers for the week
  const playerStats = allPlayerPerformances.reduce((acc, perf) => {
    const existing = acc.find(p => p.name === perf.name);
    if (existing) {
      existing.totalRating += perf.rating;
      existing.games += 1;
      existing.goals += perf.goals;
      existing.assists += perf.assists;
    } else {
      acc.push({
        name: perf.name,
        position: perf.position,
        totalRating: perf.rating,
        games: 1,
        goals: perf.goals,
        assists: perf.assists,
        avgRating: perf.rating
      });
    }
    return acc;
  }, [] as any[]);

  playerStats.forEach(player => {
    player.avgRating = player.totalRating / player.games;
  });

  const topPerformers = playerStats
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 3);

  // Calculate XG performance
  const totalXG = currentWeek.totalExpectedGoals || 0;
  const totalXGA = currentWeek.totalExpectedGoalsAgainst || 0;
  const actualGoals = currentWeek.totalGoals;
  const actualConceded = currentWeek.totalConceded;
  
  const xgPerformance = totalXG > 0 ? ((actualGoals - totalXG) / totalXG) * 100 : 0;
  const xgaPerformance = totalXGA > 0 ? ((actualConceded - totalXGA) / totalXGA) * 100 : 0;

  const tiles = [
    {
      id: 'weekProgress',
      enabled: true,
      content: (
        <Card className="metric-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Trophy className="h-5 w-5 text-fifa-gold" />
              Week Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-fifa-blue mb-2">{winRate.toFixed(0)}%</p>
              <p className="text-gray-400">Win Rate</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-fifa-green mb-1">{wins}</p>
                <p className="text-xs text-gray-400">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-fifa-red mb-1">{losses}</p>
                <p className="text-xs text-gray-400">Losses</p>
              </div>
            </div>
            {currentWeek.winTarget && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Target Progress</span>
                  <span>{wins}/{currentWeek.winTarget}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-fifa-gold rounded-full h-2 transition-all duration-300"
                    style={{ width: `${Math.min((wins / currentWeek.winTarget) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )
    },
    {
      id: 'topPerformers',
      enabled: enabledTiles.includes('showTopPerformers') && topPerformers.length > 0,
      content: (
        <Card className="metric-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-fifa-gold text-lg">
              <Star className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.map((player, index) => (
              <div key={player.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Badge className="bg-fifa-gold/20 text-fifa-gold border-fifa-gold/30 w-8 h-8 flex items-center justify-center rounded-full">
                    {index + 1}
                  </Badge>
                  <div>
                    <span className="text-white font-medium">{player.name}</span>
                    <p className="text-xs text-gray-400">{player.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-fifa-gold font-bold">{player.avgRating.toFixed(1)}</p>
                  <p className="text-xs text-gray-400">{player.goals}G {player.assists}A</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )
    },
    {
      id: 'xgAnalysis',
      enabled: enabledTiles.includes('showXGAnalysis') && totalGames > 0,
      content: (
        <Card className="metric-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-fifa-blue text-lg">
              <BarChart3 className="h-5 w-5" />
              XG Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/5 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {xgPerformance > 0 ? (
                    <TrendingUp className="h-4 w-4 text-fifa-green" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-fifa-red" />
                  )}
                  <span className={`font-bold ${xgPerformance > 0 ? 'text-fifa-green' : 'text-fifa-red'}`}>
                    {xgPerformance > 0 ? '+' : ''}{xgPerformance.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-400">Goals vs XG</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {xgaPerformance < 0 ? (
                    <TrendingUp className="h-4 w-4 text-fifa-green" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-fifa-red" />
                  )}
                  <span className={`font-bold ${xgaPerformance < 0 ? 'text-fifa-green' : 'text-fifa-red'}`}>
                    {xgaPerformance > 0 ? '+' : ''}{xgaPerformance.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-400">Conceded vs XGA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'weeklyInsights',
      enabled: enabledTiles.includes('showAIInsights') && totalGames > 0,
      content: (
        <Card className="metric-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-fifa-green text-lg">
              <Brain className="h-5 w-5" />
              Week Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {winRate > 60 && (
                <div className="p-3 bg-fifa-green/10 border border-fifa-green/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-fifa-green" />
                    <span className="text-fifa-green font-medium text-sm">Strong Week</span>
                  </div>
                  <p className="text-white text-sm">Excellent {winRate.toFixed(0)}% win rate this week!</p>
                </div>
              )}
              {currentWeek.averageOpponentSkill > 7 && (
                <div className="p-3 bg-fifa-blue/10 border border-fifa-blue/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-fifa-blue" />
                    <span className="text-fifa-blue font-medium text-sm">Tough Competition</span>
                  </div>
                  <p className="text-white text-sm">Facing skilled opponents ({currentWeek.averageOpponentSkill.toFixed(1)}/10)</p>
                </div>
              )}
              {winRate < 40 && totalGames > 2 && (
                <div className="p-3 bg-fifa-red/10 border border-fifa-red/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-fifa-red" />
                    <span className="text-fifa-red font-medium text-sm">Focus Needed</span>
                  </div>
                  <p className="text-white text-sm">Consider adjusting tactics for better results</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  const enabledTilesData = tiles.filter(tile => tile.enabled);

  if (enabledTilesData.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="text-center py-8">
          <p className="text-gray-400">No data to display yet. Play some games to see insights!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">Week {currentWeek.weekNumber} Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel className="w-full">
          <CarouselContent className="-ml-2">
            {enabledTilesData.map((tile, index) => (
              <CarouselItem key={tile.id} className="pl-2 md:basis-1/2 lg:basis-1/3">
                {tile.content}
              </CarouselItem>
            ))}
          </CarouselContent>
          {enabledTilesData.length > 3 && (
            <>
              <CarouselPrevious className="glass-card border-fifa-blue/30" />
              <CarouselNext className="glass-card border-fifa-blue/30" />
            </>
          )}
        </Carousel>
      </CardContent>
    </Card>
  );
};

export default CurrentWeekCarousel;
