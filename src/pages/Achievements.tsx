import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, CheckCircle, Lock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserAchievement {
  achievement_id: string;
  progress: { current: number; target: number };
  unlocked_at: string | null;
}

const RarityBadge = ({ rarity }: { rarity: string }) => {
  const rarityColors = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-600',
    legendary: 'bg-orange-500',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${rarityColors[rarity] || 'bg-gray-400'}`}>
      {rarity}
    </span>
  );
};

const Achievements = () => {
  const { user } = useAuth();
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
        supabase.from('achievement_definitions').select('*'),
        supabase.from('user_achievements').select('*').eq('user_id', user.id),
      ]);

      if (defRes.data) setDefinitions(defRes.data);
      if (userRes.data) {
        const userMap = new Map(userRes.data.map(ach => [ach.achievement_id, ach]));
        setUserAchievements(userMap);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const getProgress = (def: AchievementDefinition) => {
    const userAch = userAchievements.get(def.id);
    if (!userAch) return { current: 0, target: def.conditions?.target || 1, percent: 0, unlocked: false };
    const { current, target } = userAch.progress || { current: 0, target: 1 };
    return {
      current,
      target,
      percent: target > 0 ? (current / target) * 100 : 100,
      unlocked: !!userAch.unlocked_at,
    };
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
      // Add more sorting if needed
      return 0;
    });

  const groupedAchievements = filteredAndSortedDefs.reduce((acc, ach) => {
    const category = ach.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(ach);
    return acc;
  }, {} as Record<string, typeof filteredAndSortedDefs>);

  if (loading) return <p>Loading achievements...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <div className="flex items-center gap-4">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]">
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

      {Object.entries(groupedAchievements).map(([category, achievements]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map(def => {
              const { current, target, percent, unlocked } = def.progressInfo;
              return (
                <div key={def.id} className={`p-4 rounded-lg border flex gap-4 ${unlocked ? 'bg-green-100 dark:bg-green-900/30 border-green-500' : 'bg-card'}`}>
                  {unlocked ? <CheckCircle className="h-8 w-8 text-green-500 mt-1" /> : <Lock className="h-8 w-8 text-muted-foreground mt-1" />}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold">{def.title}</h3>
                      <RarityBadge rarity={def.rarity} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{def.description}</p>
                    {!unlocked && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{current} / {target}</span>
                        </div>
                        <Progress value={percent} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Achievements;
