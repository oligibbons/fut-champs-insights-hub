
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { UserPlus, Users, Search, Trophy, Target, TrendingUp } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  total_games: number;
  total_wins: number;
  best_rank: string;
  current_streak: number;
}

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  friend_profile: Profile;
}

const Friends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentTheme } = useTheme();
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          friend_profile:profiles!friends_friend_id_fkey(*)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'accepted');

      if (error) throw error;
      setFriends(data || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user?.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user?.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;
      
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully."
      });
      
      setSearchResults(prev => prev.filter(p => p.id !== friendId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">Friends</h1>
              <p className="text-lg" style={{ color: currentTheme.colors.muted }}>
                Connect with other FUT Champions players
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Search Section */}
            <div className="lg:col-span-1">
              <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }} 
                    className="rounded-3xl shadow-depth-lg border-0">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Find Friends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-xl border-0"
                      style={{ backgroundColor: currentTheme.colors.surface, color: currentTheme.colors.text }}
                    />
                    <Button
                      onClick={searchUsers}
                      className="rounded-xl"
                      style={{ backgroundColor: currentTheme.colors.primary, color: '#ffffff' }}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {searchResults.map((profile) => (
                      <div key={profile.id} 
                           className="p-3 rounded-2xl border flex items-center justify-between"
                           style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}>
                        <div>
                          <p className="font-medium text-white">{profile.username}</p>
                          <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                            {profile.total_games} games • {profile.total_wins} wins
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => sendFriendRequest(profile.id)}
                          className="rounded-xl"
                          style={{ backgroundColor: currentTheme.colors.primary, color: '#ffffff' }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Friends List */}
            <div className="lg:col-span-2">
              <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }} 
                    className="rounded-3xl shadow-depth-lg border-0">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Your Friends ({friends.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4" style={{ color: currentTheme.colors.muted }} />
                      <h3 className="text-xl font-semibold text-white mb-2">No Friends Yet</h3>
                      <p style={{ color: currentTheme.colors.muted }}>
                        Search for friends above to start building your network!
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {friends.map((friend) => (
                        <div key={friend.id} 
                             className="p-4 rounded-2xl border"
                             style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-white text-lg">
                                {friend.friend_profile.username}
                              </h3>
                              <p style={{ color: currentTheme.colors.muted }}>
                                {friend.friend_profile.display_name}
                              </p>
                            </div>
                            {friend.friend_profile.best_rank && (
                              <Badge style={{ backgroundColor: currentTheme.colors.primary + '30', color: currentTheme.colors.primary }}>
                                {friend.friend_profile.best_rank}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
                                {friend.friend_profile.total_games}
                              </p>
                              <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Games</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-400">
                                {friend.friend_profile.total_wins}
                              </p>
                              <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Wins</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold" style={{ color: currentTheme.colors.accent }}>
                                {friend.friend_profile.current_streak}
                              </p>
                              <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Streak</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Friends;
