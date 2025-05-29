
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/hooks/useTheme';
import { Trophy, Target, TrendingUp, Crown, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  username: string;
  display_name: string;
  total_games: number;
  total_wins: number;
  total_goals: number;
  best_rank: string;
  current_streak: number;
  best_streak: number;
  win_rate: number;
}

const Leaderboards = () => {
  const { currentTheme } = useTheme();
  const [leaderboards, setLeaderboards] = useState<{
    wins: LeaderboardEntry[];
    winRate: LeaderboardEntry[];
    streak: LeaderboardEntry[];
    goals: LeaderboardEntry[];
  }>({
    wins: [],
    winRate: [],
    streak: [],
    goals: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .gte('total_games', 5); // Only show users with at least 5 games

      if (error) throw error;

      const processedData = (data || []).map(profile => ({
        ...profile,
        win_rate: profile.total_games > 0 ? (profile.total_wins / profile.total_games) * 100 : 0
      }));

      setLeaderboards({
        wins: [...processedData].sort((a, b) => b.total_wins - a.total_wins).slice(0, 50),
        winRate: [...processedData].sort((a, b) => b.win_rate - a.win_rate).slice(0, 50),
        streak: [...processedData].sort((a, b) => b.current_streak - a.current_streak).slice(0, 50),
        goals: [...processedData].sort((a, b) => b.total_goals - a.total_goals).slice(0, 50)
      });
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold" style={{ color: currentTheme.colors.muted }}>#{rank}</span>;
  };

  const LeaderboardTable = ({ data, type }: { data: LeaderboardEntry[], type: string }) => (
    <div className="space-y-3">
      {data.map((entry, index) => (
        <div key={entry.id} 
             className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-102 ${index < 3 ? 'ring-2' : ''}`}
             style={{ 
               backgroundColor: currentTheme.colors.surface, 
               borderColor: currentTheme.colors.border,
               ringColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#d97706' : 'transparent'
             }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10">
                {getRankIcon(index + 1)}
              </div>
              <div>
                <h3 className="font-semibold text-white">{entry.username}</h3>
                <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                  {entry.total_games} games played
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
                {type === 'wins' && entry.total_wins}
                {type === 'winRate' && `${entry.win_rate.toFixed(1)}%`}
                {type === 'streak' && entry.current_streak}
                {type === 'goals' && entry.total_goals}
              </p>
              <p className="text-xs" style={{ color: currentTheme.colors.muted }}>
                {type === 'wins' && 'Total Wins'}
                {type === 'winRate' && 'Win Rate'}
                {type === 'streak' && 'Current Streak'}
                {type === 'goals' && 'Total Goals'}
              </p>
            </div>
          </div>
          
          {entry.best_rank && (
            <div className="mt-3 flex justify-end">
              <Badge style={{ backgroundColor: currentTheme.colors.accent + '30', color: currentTheme.colors.accent }}>
                Best: {entry.best_rank}
              </Badge>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">Leaderboards</h1>
              <p className="text-lg" style={{ color: currentTheme.colors.muted }}>
                See how you stack up against other players
              </p>
            </div>
          </div>

          <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }} 
                className="rounded-3xl shadow-depth-lg border-0">
            <CardContent className="p-6">
              <Tabs defaultValue="wins" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 rounded-2xl p-1" 
                         style={{ backgroundColor: currentTheme.colors.surface }}>
                  <TabsTrigger value="wins" className="rounded-xl flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Total Wins
                  </TabsTrigger>
                  <TabsTrigger value="winRate" className="rounded-xl flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Win Rate
                  </TabsTrigger>
                  <TabsTrigger value="streak" className="rounded-xl flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Win Streak
                  </TabsTrigger>
                  <TabsTrigger value="goals" className="rounded-xl flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Total Goals
                  </TabsTrigger>
                </TabsList>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                  </div>
                ) : (
                  <>
                    <TabsContent value="wins">
                      <LeaderboardTable data={leaderboards.wins} type="wins" />
                    </TabsContent>
                    <TabsContent value="winRate">
                      <LeaderboardTable data={leaderboards.winRate} type="winRate" />
                    </TabsContent>
                    <TabsContent value="streak">
                      <LeaderboardTable data={leaderboards.streak} type="streak" />
                    </TabsContent>
                    <TabsContent value="goals">
                      <LeaderboardTable data={leaderboards.goals} type="goals" />
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Leaderboards;
