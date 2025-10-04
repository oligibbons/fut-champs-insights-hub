import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, CheckCircle, Lock, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameVersion } from '@/contexts/GameVersionContext';

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
        supabase.from('user_achievements').select('*').eq('user_id', user.id),
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
      // Add more sorting logic if needed, e.g., by rarity
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Award className="h-8 w-8 text-primary"/>
                Achievements
            </h1>
            <p className="text-muted-foreground">Track your progress and unlock rewards.</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[150px]">
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
        <div className="text-center py-16">
            <h3 className="text-xl font-semibold">No Achievements Found</h3>
            <p className="text-muted-foreground">Try a different filter or check back later.</p>
        </div>
      ) : (
        Object.entries(groupedAchievements).map(([category, achievements]) => (
            <div key={category} className="space-y-4">
                <h2 className="text-xl font-semibold capitalize tracking-tight">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map(def => {
                    const { current, target, percent, unlocked } = def.progressInfo;
                    return (
                    <div key={def.id} className={`p-4 rounded-lg border flex gap-4 transition-colors ${unlocked ? 'bg-green-950/50 border-green-700/30' : 'bg-card'}`}>
                        <div className="flex-shrink-0 mt-1">
                        {unlocked ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Lock className="h-6 w-6 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-semibold ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{def.title}</h3>
                            <RarityBadge rarity={def.rarity} />
                        </div>
                        <p className="text-sm text-muted-foreground/80 mb-3">{def.description}</p>
                        {!unlocked && (
                            <div>
                            <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                                <span>Progress</span>
                                <span>{current.toLocaleString()} / {target.toLocaleString()}</span>
                            </div>
                            <Progress value={percent} className="h-2" />
                            </div>
                        )}
                        </div>
                    </div>
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
