
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Achievement, WeeklyPerformance } from '@/types/futChampions';
import { Trophy, Star, Target, Zap, Clock, Shield } from 'lucide-react';

interface AchievementSystemProps {
  weeklyData: WeeklyPerformance[];
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

const AchievementSystem = ({ weeklyData, onAchievementUnlocked }: AchievementSystemProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Calculate achievements based on data
  const calculateAchievements = (): Achievement[] => {
    const allGames = weeklyData.flatMap(week => week.games);
    const totalWins = weeklyData.reduce((sum, week) => sum + week.totalWins, 0);
    const totalGoals = weeklyData.reduce((sum, week) => sum + week.totalGoals, 0);
    
    const achievements: Achievement[] = [
      // Win-based achievements
      {
        id: 'first-win',
        title: 'First Victory',
        description: 'Win your first FUT Champions game',
        icon: 'trophy',
        category: 'wins',
        unlockedAt: totalWins >= 1 ? new Date().toISOString() : undefined,
        progress: Math.min(totalWins, 1),
        target: 1,
        rarity: 'common'
      },
      {
        id: 'win-streak-5',
        title: 'Unstoppable',
        description: 'Win 5 games in a row',
        icon: 'zap',
        category: 'streaks',
        unlockedAt: checkWinStreak(allGames, 5) ? new Date().toISOString() : undefined,
        progress: getCurrentWinStreak(allGames),
        target: 5,
        rarity: 'rare'
      },
      {
        id: 'perfect-week',
        title: 'Perfect Week',
        description: 'Win 15 out of 15 games in a week',
        icon: 'crown',
        category: 'wins',
        unlockedAt: weeklyData.some(week => week.totalWins === 15 && week.totalLosses === 0) ? new Date().toISOString() : undefined,
        progress: Math.max(...weeklyData.map(week => week.totalWins)),
        target: 15,
        rarity: 'legendary'
      },
      // Goal-based achievements
      {
        id: 'goal-machine',
        title: 'Goal Machine',
        description: 'Score 100 goals across all games',
        icon: 'target',
        category: 'goals',
        unlockedAt: totalGoals >= 100 ? new Date().toISOString() : undefined,
        progress: totalGoals,
        target: 100,
        rarity: 'epic'
      },
      // Performance achievements
      {
        id: 'consistent-performer',
        title: 'Mr. Reliable',
        description: 'Maintain 70%+ win rate for 3 consecutive weeks',
        icon: 'shield',
        category: 'consistency',
        unlockedAt: checkConsistentPerformance() ? new Date().toISOString() : undefined,
        progress: getConsistencyStreaks(),
        target: 3,
        rarity: 'epic'
      }
    ];

    return achievements;
  };

  const checkWinStreak = (games: any[], target: number): boolean => {
    let currentStreak = 0;
    let maxStreak = 0;
    
    for (const game of games.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())) {
      if (game.result === 'win') {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak >= target;
  };

  const getCurrentWinStreak = (games: any[]): number => {
    let streak = 0;
    const sortedGames = games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const game of sortedGames) {
      if (game.result === 'win') {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const checkConsistentPerformance = (): boolean => {
    let consecutiveWeeks = 0;
    
    for (const week of weeklyData.slice(-5)) {
      const winRate = week.games.length > 0 ? (week.totalWins / week.games.length) * 100 : 0;
      if (winRate >= 70) {
        consecutiveWeeks++;
        if (consecutiveWeeks >= 3) return true;
      } else {
        consecutiveWeeks = 0;
      }
    }
    
    return false;
  };

  const getConsistencyStreaks = (): number => {
    let consecutiveWeeks = 0;
    
    for (const week of weeklyData.slice(-5)) {
      const winRate = week.games.length > 0 ? (week.totalWins / week.games.length) * 100 : 0;
      if (winRate >= 70) {
        consecutiveWeeks++;
      } else {
        break;
      }
    }
    
    return consecutiveWeeks;
  };

  const achievements = calculateAchievements();
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-fifa-blue border-fifa-blue';
      case 'epic': return 'text-fifa-purple border-fifa-purple';
      case 'legendary': return 'text-fifa-gold border-fifa-gold';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case 'trophy': return Trophy;
      case 'target': return Target;
      case 'zap': return Zap;
      case 'shield': return Shield;
      case 'clock': return Clock;
      default: return Star;
    }
  };

  const categories = ['all', 'wins', 'goals', 'streaks', 'performance', 'consistency', 'milestone'];

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-fifa-gold" />
            Achievements ({unlockedAchievements.length}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Achievement Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements
              .filter(achievement => selectedCategory === 'all' || achievement.category === selectedCategory)
              .map(achievement => {
                const IconComponent = getIconComponent(achievement.icon);
                const isUnlocked = !!achievement.unlockedAt;
                const progress = achievement.progress || 0;
                const target = achievement.target || 1;
                const progressPercentage = Math.min((progress / target) * 100, 100);

                return (
                  <Card
                    key={achievement.id}
                    className={`relative overflow-hidden transition-all duration-300 ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-fifa-gold/20 to-fifa-blue/20 border-fifa-gold/30' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${isUnlocked ? 'bg-fifa-gold/20' : 'bg-white/10'}`}>
                          <IconComponent 
                            className={`h-5 w-5 ${isUnlocked ? 'text-fifa-gold' : 'text-gray-400'}`} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold text-sm ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                              {achievement.title}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getRarityColor(achievement.rarity)}`}
                            >
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className={`text-xs mb-3 ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                            {achievement.description}
                          </p>
                          
                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">
                                {progress}/{target}
                              </span>
                              <span className="text-gray-400">
                                {progressPercentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                  isUnlocked ? 'bg-fifa-gold' : 'bg-fifa-blue'
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isUnlocked && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-fifa-gold text-black text-xs">
                            ✓
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementSystem;
