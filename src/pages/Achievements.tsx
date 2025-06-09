import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/hooks/useTheme';
import { Trophy, Star, Target, Zap, Clock, Shield, Crown, Sword, Flame, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ACHIEVEMENTS, checkAchievements, calculateAchievementProgress } from '@/utils/achievements';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { WeeklyPerformance } from '@/types/futChampions';
import { useDataSync } from '@/hooks/useDataSync';

const Achievements = () => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { toast } = useToast();
  const { weeklyData } = useDataSync();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Calculate achievements and progress
  const allAchievements = ACHIEVEMENTS.map(achievement => {
    const progress = calculateAchievementProgress(achievement, weeklyData);
    const isUnlocked = progress >= achievement.threshold;
    
    return {
      ...achievement,
      unlocked: isUnlocked,
      currentProgress: progress,
      target: achievement.threshold
    };
  });

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

  const getIconComponent = (category: string) => {
    switch (category) {
      case 'wins': return Trophy;
      case 'goals': return Target;
      case 'streaks': return Flame;
      case 'performance': return Star;
      case 'milestone': return Crown;
      default: return Award;
    }
  };

  const categories = ['all', 'wins', 'goals', 'streaks', 'performance', 'milestone', 'games', 'weekly', 'cleanSheets', 'assists', 'playTime', 'consistency', 'improvement', 'domination', 'comeback', 'teamwork', 'possession', 'passing', 'shooting', 'defending', 'attacking', 'midfield', 'seasonal', 'special', 'hidden'];

  const filteredAchievements = allAchievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const unlockedCount = allAchievements.filter(a => a.unlocked).length;
  const totalCount = allAchievements.length;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-20 lg:hover:ml-64 transition-all duration-500 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
              <Trophy className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Achievements</h1>
              <p className="text-gray-400 mt-1">Track your progress and unlock rewards</p>
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">Overall Progress</h3>
                  <p className="text-gray-400">
                    {unlockedCount} of {totalCount} achievements unlocked
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-fifa-gold">
                    {Math.round((unlockedCount / totalCount) * 100)}%
                  </p>
                  <p className="text-sm text-gray-400">Complete</p>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="h-3 bg-fifa-gold rounded-full transition-all duration-500"
                  style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
                style={{
                  backgroundColor: selectedCategory === category ? currentTheme.colors.primary : 'transparent',
                  borderColor: currentTheme.colors.border,
                  color: selectedCategory === category ? '#ffffff' : currentTheme.colors.text
                }}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Achievement Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => {
              const IconComponent = getIconComponent(achievement.category);
              const progressPercentage = achievement.target 
                ? Math.min((achievement.currentProgress / achievement.target) * 100, 100)
                : achievement.unlocked ? 100 : 0;

              return (
                <Card
                  key={achievement.id}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-br from-fifa-gold/20 to-fifa-blue/20 border-fifa-gold/30' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-fifa-gold/20' : 'bg-white/10'}`}>
                        <IconComponent 
                          className={`h-6 w-6 ${achievement.unlocked ? 'text-fifa-gold' : 'text-gray-400'}`} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                            {achievement.title}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRarityColor(achievement.rarity)}`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className={`text-sm mb-4 ${achievement.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                          {achievement.description}
                        </p>
                        
                        {/* Progress Bar */}
                        {achievement.target && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">
                                {achievement.currentProgress}/{achievement.target}
                              </span>
                              <span className="text-gray-400">
                                {progressPercentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  achievement.unlocked ? 'bg-fifa-gold' : 'bg-fifa-blue'
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {achievement.unlocked && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-fifa-gold text-black">
                          ✓ Unlocked
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
        </div>
      </main>
    </div>
  );
};

export default Achievements;