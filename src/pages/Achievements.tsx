
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

interface Achievement {
  id: string;
  achievement_id: string;
  title: string;
  description: string;
  category: string;
  rarity: string;
  unlocked_at: string;
  progress: number;
  target: number | null;
}

const ACHIEVEMENT_DEFINITIONS = [
  { id: 'first_win', title: 'First Victory', description: 'Win your first game', category: 'wins', rarity: 'common', target: 1 },
  { id: 'win_streak_3', title: 'Hat Trick Hero', description: 'Win 3 games in a row', category: 'streaks', rarity: 'rare', target: 3 },
  { id: 'win_streak_5', title: 'Unstoppable', description: 'Win 5 games in a row', category: 'streaks', rarity: 'epic', target: 5 },
  { id: 'win_streak_10', title: 'Legendary Streak', description: 'Win 10 games in a row', category: 'streaks', rarity: 'legendary', target: 10 },
  { id: 'total_wins_10', title: 'Getting Started', description: 'Win 10 total games', category: 'wins', rarity: 'common', target: 10 },
  { id: 'total_wins_50', title: 'Experienced', description: 'Win 50 total games', category: 'wins', rarity: 'rare', target: 50 },
  { id: 'total_wins_100', title: 'Champion', description: 'Win 100 total games', category: 'wins', rarity: 'epic', target: 100 },
  { id: 'total_wins_250', title: 'Master', description: 'Win 250 total games', category: 'wins', rarity: 'legendary', target: 250 },
  { id: 'total_wins_500', title: 'Legend', description: 'Win 500 total games', category: 'wins', rarity: 'mythic', target: 500 },
  { id: 'goals_10', title: 'Scorer', description: 'Score 10 total goals', category: 'goals', rarity: 'common', target: 10 },
  { id: 'goals_50', title: 'Finisher', description: 'Score 50 total goals', category: 'goals', rarity: 'rare', target: 50 },
  { id: 'goals_100', title: 'Goal Machine', description: 'Score 100 total goals', category: 'goals', rarity: 'epic', target: 100 },
  { id: 'perfect_week', title: 'Perfect Week', description: 'Win all 15 games in a week', category: 'performance', rarity: 'legendary', target: 15 },
  { id: 'rank_1', title: 'Elite Player', description: 'Reach Rank I', category: 'milestone', rarity: 'mythic', target: 1 }
];

const Achievements = () => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const categories = ['all', 'wins', 'goals', 'streaks', 'performance', 'milestone'];

  // Combine unlocked achievements with all possible achievements
  const allAchievements = ACHIEVEMENT_DEFINITIONS.map(def => {
    const unlocked = achievements.find(a => a.achievement_id === def.id);
    return {
      ...def,
      unlocked: !!unlocked,
      unlockedAt: unlocked?.unlocked_at,
      currentProgress: unlocked?.progress || 0
    };
  });

  const filteredAchievements = allAchievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const unlockedCount = allAchievements.filter(a => a.unlocked).length;
  const totalCount = allAchievements.length;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
              <Trophy className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Achievements</h1>
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
