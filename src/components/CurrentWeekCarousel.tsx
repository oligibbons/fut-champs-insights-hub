import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { WeeklyPerformance } from '@/types/futChampions';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  BarChart3,
  Brain,
  Zap,
  Shield
} from 'lucide-react';

interface CurrentWeekCarouselProps {
  currentWeek: WeeklyPerformance;
  enabledTiles: string[];
}

const CurrentWeekCarousel = ({ currentWeek, enabledTiles }: CurrentWeekCarouselProps) => {
  // Calculate stats
  const totalGames = currentWeek.games.length;
  const winRate = totalGames > 0 ? (currentWeek.totalWins / totalGames) * 100 : 0;
  const xgPerformance = currentWeek.totalExpectedGoals > 0 ? 
    ((currentWeek.totalGoals - currentWeek.totalExpectedGoals) / currentWeek.totalExpectedGoals) * 100 : 0;
  const xgaPerformance = currentWeek.totalExpectedGoalsAgainst > 0 ? 
    ((currentWeek.totalConceded - currentWeek.totalExpectedGoalsAgainst) / currentWeek.totalExpectedGoalsAgainst) * 100 : 0;

  // Get recent form (last 5 games)
  const recentGames = currentWeek.games.slice(-5);
  const recentWins = recentGames.filter(game => game.result === 'win').length;
  const recentForm = recentGames.length > 0 ? (recentWins / recentGames.length) * 100 : 0;

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
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-fifa-green mb-1">{currentWeek.totalWins}</p>
                <p className="text-xs text-gray-400">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-fifa-red mb-1">{currentWeek.totalLosses}</p>
                <p className="text-xs text-gray-400">Losses</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Target: {currentWeek.winTarget?.wins || 11} wins</span>
                <span>{totalGames}/15</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-fifa-blue rounded-full h-2 transition-all duration-300"
                  style={{ width: `${(totalGames / 15) * 100}%` }}
                ></div>
              </div>
            </div>
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
              <p className="text-gray-400">Last {recentGames.length} Games</p>
            </div>
            <div className="flex justify-center gap-1">
              {recentGames.map((game, index) => (
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
                <p className="text-white text-sm">
                  {xgPerformance > 0 ? 'Clinical finishing - outperforming XG' : 'Solid defensive structure'}
                </p>
              </div>
              <div className="p-3 bg-fifa-red/10 border border-fifa-red/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-fifa-red" />
                  <span className="text-fifa-red font-medium text-sm">Focus Area</span>
                </div>
                <p className="text-white text-sm">
                  {winRate < 50 ? 'Work on game management' : 'Maintain consistency'}
                </p>
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
        <CardTitle className="text-white">Week Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel className="w-full">
          <CarouselContent className="-ml-2">
            {enabledTilesData.map((tile, index) => (
              
              // --- THIS IS THE FIX ---
              // Changed md:basis-1/2 lg:basis-1/3
              // to lg:basis-1/2 xl:basis-1/3
              // This stops the carousel from showing 2 items on tablets.
              <CarouselItem key={tile.id} className="pl-2 lg:basis-1/2 xl:basis-1/3">
                {tile.content}
              </CarouselItem>
            ))}
          </CarouselContent>
          {enabledTilesData.length > 2 && ( // This is fine, only shows arrows when needed
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