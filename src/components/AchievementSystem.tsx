
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Achievement, WeeklyPerformance } from '@/types/futChampions';
import { Trophy, Star, Target, Zap, Clock, Shield, Crown, Sword, Flame, Award } from 'lucide-react';
import { ACHIEVEMENTS, checkAchievements, calculateAchievementProgress } from '@/utils/achievements';

interface AchievementSystemProps {
  weeklyData: WeeklyPerformance[];
  currentWeek?: WeeklyPerformance | null;
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

const AchievementSystem = ({ weeklyData, currentWeek, onAchievementUnlocked }: AchievementSystemProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get all achievements with progress calculated
  const achievementsWithProgress = ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    progress: calculateAchievementProgress(achievement, weeklyData, currentWeek),
    unlockedAt: calculateAchievementProgress(achievement, weeklyData, currentWeek) >= (achievement.target || 1) ? new Date().toISOString() : undefined
  }));

  const unlockedAchievements = achievementsWithProgress.filter(a => a.unlockedAt);
  const lockedAchievements = achievementsWithProgress.filter(a => !a.unlockedAt);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-fifa-blue border-fifa-blue';
      case 'epic': return 'text-fifa-purple border-fifa-purple';
      case 'legendary': return 'text-fifa-gold border-fifa-gold';
      case 'mythic': return 'text-pink-400 border-pink-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case '🏆': return Trophy;
      case '⚽': case '🎯': return Target;
      case '⚡': case '🔥': return Flame;
      case '🛡️': case '🏰': return Shield;
      case '⏰': case '🕐': return Clock;
      case '👑': return Crown;
      case '⚔️': return Sword;
      case '🏅': case '🥇': case '🥈': case '🥉': return Award;
      default: return Star;
    }
  };

  const categories = ['all', 'wins', 'goals', 'streaks', 'performance', 'consistency', 'milestone', 'special'];

  const filteredAchievements = achievementsWithProgress.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-fifa-gold" />
            Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Achievement Progress */}
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Overall Progress</span>
              <span>{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="h-2 bg-fifa-gold rounded-full transition-all duration-500"
                style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
              />
            </div>
          </div>

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
            {filteredAchievements.map(achievement => {
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

          {filteredAchievements.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No Achievements</h3>
              <p className="text-gray-400">No achievements found in this category.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementSystem;
