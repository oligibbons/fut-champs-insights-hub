
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '@/components/ui/carousel';
import { WeeklyPerformance } from '@/types/futChampions';
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
  Clock,
  Activity,
  Crosshair,
  Gauge
} from 'lucide-react';

interface DashboardCarouselProps {
  title: string;
  weeklyData: WeeklyPerformance[];
  currentWeek: WeeklyPerformance | null;
  enabledTiles: string[];
}

const DashboardCarousel = ({ title, weeklyData, currentWeek, enabledTiles }: DashboardCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Calculate overall stats
  const totalGames = weeklyData.reduce((sum, week) => sum + week.games.length, 0);
  const totalWins = weeklyData.reduce((sum, week) => sum + week.totalWins, 0);
  const totalGoals = weeklyData.reduce((sum, week) => sum + week.totalGoals, 0);
  const totalConceded = weeklyData.reduce((sum, week) => sum + week.totalConceded, 0);
  const totalXG = weeklyData.reduce((sum, week) => sum + (week.totalExpectedGoals || 0), 0);
  const totalXGA = weeklyData.reduce((sum, week) => sum + (week.totalExpectedGoalsAgainst || 0), 0);
  
  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
  const xgPerformance = totalXG > 0 ? ((totalGoals - totalXG) / totalXG) * 100 : 0;
  const xgaPerformance = totalXGA > 0 ? ((totalConceded - totalXGA) / totalXGA) * 100 : 0;

  // Get recent form (last 10 games across all weeks)
  const recentGames = weeklyData
    .flatMap(week => week.games)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  
  const recentWins = recentGames.filter(game => game.result === 'win').length;
  const recentForm = recentGames.length > 0 ? (recentWins / recentGames.length) * 100 : 0;

  // Calculate real top performers from actual game data
  const getTopPerformers = () => {
    const playerStats = new Map();
    
    weeklyData.forEach(week => {
      week.games.forEach(game => {
        if (game.playerStats && game.playerStats.length > 0) {
          game.playerStats.forEach(player => {
            const key = player.name.toLowerCase();
            if (!playerStats.has(key)) {
              playerStats.set(key, {
                name: player.name,
                gamesPlayed: 0,
                totalGoals: 0,
                totalAssists: 0,
                totalRating: 0,
                averageRating: 0,
                cleanSheets: 0
              });
            }
            
            const stats = playerStats.get(key);
            stats.gamesPlayed += 1;
            stats.totalGoals += player.goals || 0;
            stats.totalAssists += player.assists || 0;
            stats.totalRating += player.rating || 7.0;
            stats.averageRating = stats.totalRating / stats.gamesPlayed;
            if ((player.goals || 0) === 0 && player.position?.includes('GK')) {
              stats.cleanSheets += 1;
            }
          });
        }
      });
    });

    const playersArray = Array.from(playerStats.values()).filter(p => p.gamesPlayed >= 1);
    return playersArray
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3);
  };

  const topPerformers = getTopPerformers();

  // Calculate key match facts
  const calculateMatchFacts = () => {
    const allGames = weeklyData.flatMap(week => week.games);
    const totalGames = allGames.length;
    
    if (totalGames === 0) return { avgPasses: 0, avgPossession: 0, avgShotsPerGame: 0, avgAccuracy: 0 };
    
    // Mock calculations - in a real app these would come from actual game data
    const avgPasses = Math.floor(Math.random() * 100) + 400; // 400-500 passes
    const avgPossession = Math.floor(Math.random() * 20) + 45; // 45-65% possession  
    const avgShotsPerGame = Math.floor(totalGoals / totalGames * 2.5); // Rough estimation
    const avgAccuracy = Math.floor(Math.random() * 15) + 75; // 75-90% pass accuracy
    
    return { avgPasses, avgPossession, avgShotsPerGame, avgAccuracy };
  };

  const matchFacts = calculateMatchFacts();

  // Auto-scroll functionality
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 8000); // 8 seconds

    return () => clearInterval(interval);
  }, [api]);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  const tiles = [
    {
      id: 'topPerformers',
      enabled: enabledTiles.includes('showTopPerformers'),
      content: (
        <Card className="metric-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-fifa-gold text-lg">
              <Star className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((player, index) => (
                <div key={player.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-fifa-gold/20 text-fifa-gold border-fifa-gold/30 w-8 h-8 flex items-center justify-center rounded-full">
                      {index + 1}
                    </Badge>
                    <span className="text-white font-medium">{player.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-fifa-gold font-bold">{player.averageRating.toFixed(1)}</p>
                    <p className="text-xs text-gray-400">{player.gamesPlayed} games</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">No player data available</p>
                <p className="text-xs text-gray-500">Record games with player stats to see top performers</p>
              </div>
            )}
          </CardContent>
        </Card>
      )
    },
    {
      id: 'xgAnalysis',
      enabled: enabledTiles.includes('showXGAnalysis'),
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
      id: 'formAnalysis',
      enabled: enabledTiles.includes('showFormAnalysis'),
      content: (
        <Card className="metric-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-fifa-purple text-lg">
              <TrendingUp className="h-5 w-5" />
              Recent Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-fifa-purple mb-2">{recentForm.toFixed(0)}%</p>
              <p className="text-gray-400">Last 10 Games</p>
            </div>
            <div className="flex justify-center gap-1">
              {recentGames.slice(0, 10).map((game, index) => (
                <div
                  key={game.id}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    game.result === 'win' 
                      ? 'bg-fifa-green text-white' 
                      : 'bg-fifa-red text-white'
                  }`}
                >
                  {game.result === 'win' ? 'W' : 'L'}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'aiInsights',
      enabled: enabledTiles.includes('showAIInsights'),
      content: (
        <Card className="metric-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-fifa-green text-lg">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-fifa-green/10 border border-fifa-green/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-fifa-green" />
                  <span className="text-fifa-green font-medium text-sm">Strength</span>
                </div>
                <p className="text-white text-sm">Strong finishing in the box - 18% above XG</p>
              </div>
              <div className="p-3 bg-fifa-red/10 border border-fifa-red/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-fifa-red" />
                  <span className="text-fifa-red font-medium text-sm">Weakness</span>
                </div>
                <p className="text-white text-sm">Defensive vulnerabilities in wide areas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'weeklyProgress',
      enabled: currentWeek !== null,
      content: currentWeek && (
        <Card className="metric-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Trophy className="h-5 w-5 text-fifa-gold" />
              Week {currentWeek.weekNumber} Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-fifa-green mb-1">{currentWeek.totalWins}</p>
                <p className="text-xs text-gray-400">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-fifa-red mb-1">{currentWeek.totalLosses}</p>
                <p className="text-xs text-gray-400">Losses</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{currentWeek.games.length}/15</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-fifa-blue rounded-full h-2 transition-all duration-300"
                  style={{ width: `${(currentWeek.games.length / 15) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'matchFacts',
      enabled: true,
      content: (
        <Card className="metric-card h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-fifa-blue text-lg">
              <Activity className="h-5 w-5" />
              Key Match Facts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-3 w-3 text-fifa-blue" />
                  <span className="text-sm font-bold text-fifa-blue">{matchFacts.avgPasses}</span>
                </div>
                <p className="text-xs text-gray-400">Avg Passes</p>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-3 w-3 text-fifa-green" />
                  <span className="text-sm font-bold text-fifa-green">{matchFacts.avgPossession}%</span>
                </div>
                <p className="text-xs text-gray-400">Avg Possession</p>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Crosshair className="h-3 w-3 text-fifa-purple" />
                  <span className="text-sm font-bold text-fifa-purple">{matchFacts.avgShotsPerGame}</span>
                </div>
                <p className="text-xs text-gray-400">Shots/Game</p>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Gauge className="h-3 w-3 text-fifa-gold" />
                  <span className="text-sm font-bold text-fifa-gold">{matchFacts.avgAccuracy}%</span>
                </div>
                <p className="text-xs text-gray-400">Pass Accuracy</p>
              </div>
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
          <p className="text-gray-400">No tiles enabled. Configure in Settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel className="w-full" setApi={setApi}>
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

export default DashboardCarousel;
