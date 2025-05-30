
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { UserProfile } from '@/types/social';
import { Crown, Trophy, Target, TrendingUp, Medal, Award } from 'lucide-react';

const Leaderboards = () => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [topPlayers, setTopPlayers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_wins', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTopPlayers(data || []);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-6 w-6 text-fifa-gold" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <Trophy className="h-5 w-5 text-fifa-blue" />;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1: return 'from-fifa-gold/20 to-fifa-gold/5 border-fifa-gold/30';
      case 2: return 'from-gray-400/20 to-gray-400/5 border-gray-400/30';
      case 3: return 'from-amber-600/20 to-amber-600/5 border-amber-600/30';
      default: return 'from-fifa-blue/10 to-fifa-blue/5 border-fifa-blue/20';
    }
  };

  const calculateWinRate = (wins: number, games: number) => {
    return games > 0 ? Math.round((wins / games) * 100) : 0;
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
              <Crown className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Global Leaderboards</h1>
              <p className="text-gray-400 mt-1">See how you rank against other players</p>
            </div>
          </div>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {topPlayers.slice(0, 3).map((player, index) => (
              <Card key={player.id} className={`glass-card bg-gradient-to-br ${getRankColor(index + 1)}`}>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
                       style={{ backgroundColor: currentTheme.colors.primary }}>
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{player.username}</h3>
                  <Badge className="mb-3 bg-fifa-gold text-black">
                    #{index + 1}
                  </Badge>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-2xl font-bold text-fifa-green">{player.total_wins}</p>
                      <p className="text-gray-400">Wins</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-fifa-blue">{calculateWinRate(player.total_wins, player.total_games)}%</p>
                      <p className="text-gray-400">Win Rate</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-fifa-purple font-semibold">{player.best_rank || 'Unranked'}</p>
                    <p className="text-xs text-gray-400">Best Rank</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Leaderboard */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <TrendingUp className="h-5 w-5" />
                Complete Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topPlayers.map((player, index) => {
                  const isCurrentUser = user?.id === player.id;
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                        isCurrentUser 
                          ? 'bg-gradient-to-r from-fifa-blue/20 to-fifa-purple/20 border border-fifa-blue/50' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-fifa-blue/20">
                        <span className="font-bold text-fifa-blue">#{index + 1}</span>
                      </div>
                      
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                           style={{ backgroundColor: currentTheme.colors.primary }}>
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isCurrentUser ? 'text-fifa-blue' : 'text-white'}`}>
                            {player.username}
                          </h3>
                          {isCurrentUser && <Badge className="bg-fifa-green text-white">You</Badge>}
                        </div>
                        <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                          {player.best_rank || 'Unranked'} • {player.total_games} games played
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-lg font-bold text-fifa-green">{player.total_wins}</p>
                          <p className="text-xs text-gray-400">Wins</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-fifa-blue">{calculateWinRate(player.total_wins, player.total_games)}%</p>
                          <p className="text-xs text-gray-400">Win Rate</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-fifa-purple">{player.current_streak}</p>
                          <p className="text-xs text-gray-400">Streak</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {topPlayers.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: currentTheme.colors.muted }} />
                  <h3 className="text-xl font-semibold text-white mb-2">No Rankings Yet</h3>
                  <p style={{ color: currentTheme.colors.muted }}>
                    Be the first to play some games and appear on the leaderboard!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Leaderboards;
