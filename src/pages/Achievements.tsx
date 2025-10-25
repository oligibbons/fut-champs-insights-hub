import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, CheckCircle, Lock, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { useTheme } from '@/hooks/useTheme'; // Import useTheme

// Define interfaces for our data structures
interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  conditions: { target: number; metric: string };
}

interface UserAchievement {
  achievement_id: string;
  progress: { current: number; target: number };
  unlocked_at: string | null;
}

// A small component for the rarity badge
const RarityBadge = ({ rarity }: { rarity: string }) => {
  const rarityStyles: { [key: string]: string } = {
    common: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    rare: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    epic: 'bg-purple-600/10 text-purple-400 border-purple-500/20',
    legendary: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${rarityStyles[rarity] || 'bg-gray-400/10'}`}>
      {rarity}
    </span>
  );
};

const AchievementsPage = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const { currentTheme } = useTheme(); // Get theme
  const [definitions, setDefinitions] = useState<AchievementDefinition[]>([]);
  const [userAchievements, setUserAchievements] = useState<Map<string, UserAchievement>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unlocked, in-progress
  const [sort, setSort] = useState('progress'); // progress, rarity, name

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      const [defRes, userRes] = await Promise.all([
        supabase.from('achievement_definitions').select('*').eq('game_version', gameVersion),
        // FIX: Corrected table name from 'user_achievements' to 'achievements'
        supabase.from('achievements').select('*').eq('user_id', user.id),
      ]);

      if (defRes.data) setDefinitions(defRes.data as AchievementDefinition[]);
      if (userRes.data) {
        const userMap = new Map(userRes.data.map(ach => [ach.achievement_id, ach as UserAchievement]));
        setUserAchievements(userMap);
      }
      setLoading(false);
    };
    fetchData();
  }, [user, gameVersion]);

  // Helper to merge definition and user data for display
  const getProgress = (def: AchievementDefinition) => {
    const userAch = userAchievements.get(def.id);
    const unlocked = !!userAch?.unlocked_at;
    const current = userAch?.progress?.current ?? 0;
    const target = def.conditions?.target || 1;
    const percent = target > 0 ? Math.min((current / target) * 100, 100) : (unlocked ? 100 : 0);
    
    return { current, target, percent, unlocked };
  };

  const filteredAndSortedDefs = definitions
    .map(def => ({ ...def, progressInfo: getProgress(def) }))
    .filter(def => {
      if (filter === 'unlocked') return def.progressInfo.unlocked;
      if (filter === 'in-progress') return !def.progressInfo.unlocked;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'progress') return b.progressInfo.percent - a.progressInfo.percent;
      if (sort === 'name') return a.title.localeCompare(b.title);
      return 0;
    });

  const groupedAchievements = filteredAndSortedDefs.reduce((acc, ach) => {
    const category = ach.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(ach);
    return acc;
  }, {} as Record<string, typeof filteredAndSortedDefs>);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: currentTheme.colors.primary }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
              <Award className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Achievements
              </h1>
              <p className="text-gray-400 mt-1">Track your progress and unlock rewards.</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="glass-card rounded-2xl shadow-xl border-0 p-2">
              <TabsTrigger value="all" className="rounded-xl">All</TabsTrigger>
              <TabsTrigger value="in-progress" className="rounded-xl">In Progress</TabsTrigger>
              <TabsTrigger value="unlocked" className="rounded-xl">Unlocked</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger 
              className="w-[150px] glass-card rounded-xl shadow-xl border-0"
              style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}
            >
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="rarity">Rarity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {Object.keys(groupedAchievements).length === 0 ? (
        <Card className="glass-card rounded-2xl shadow-2xl border-0">
            <CardContent className="text-center py-16">
                <Award className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-xl font-semibold text-white">No Achievements Found</h3>
                <p className="text-gray-400">Try a different filter or check back later.</p>
            </CardContent>
        </Card>
      ) : (
        Object.entries(groupedAchievements).map(([category, achievements]) => (
            <div key={category} className="space-y-4">
                <h2 className="text-xl font-semibold capitalize tracking-tight text-white">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map(def => {
                    const { current, target, percent, unlocked } = def.progressInfo;
                    return (
                    <Card key={def.id} className={`metric-card p-4 flex gap-4 ${unlocked ? 'border-green-700/30' : ''}`}>
                        <div className="flex-shrink-0 mt-1">
                        {unlocked ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Lock className="h-6 w-6 text-gray-400" />}
                        </div>
                        <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-semibold text-white ${unlocked ? '' : 'opacity-70'}`}>{def.title}</h3>
                            <RarityBadge rarity={def.rarity} />
                        </div>
                        <p className="text-sm text-gray-400/80 mb-3">{def.description}</p>
                        {!unlocked && (
                            <div>
                            <div className="flex justify-between text-xs mb-1 text-gray-400">
                                <span>Progress</span>
                                <span>{current.toLocaleString()} / {target.toLocaleString()}</span>
                            </div>
                            <Progress value={percent} className="h-2" />
                            </div>
                        )}
                        </div>
                    </Card>
                    );
                })}
                </div>
            </div>
        ))
      )}
    </div>
  );
};

export default AchievementsPage;
