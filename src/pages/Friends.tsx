
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { Friend, UserProfile } from '@/types/social';
import { Users, UserPlus, Search, Check, X, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Friends = () => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          friend_profile:friend_id (
            id,
            username,
            display_name,
            avatar_url,
            total_games,
            total_wins,
            total_goals,
            best_rank,
            current_streak,
            best_streak,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedData = data.map(item => ({
        ...item,
        status: item.status as 'pending' | 'accepted' | 'blocked'
      })) as Friend[];
      
      setFriends(typedData);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: "Error",
        description: "Failed to load friends list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friends')
        .insert([
          { user_id: user.id, friend_id: friendId, status: 'pending' }
        ]);

      if (error) throw error;

      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully!",
      });

      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;
      
      await fetchFriends();
      toast({
        title: "Friend Request Accepted",
        description: "You are now friends!",
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const declineFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      
      await fetchFriends();
      toast({
        title: "Friend Request Declined",
        description: "Friend request has been declined",
      });
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingRequests = friends.filter(f => f.status === 'pending');

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
              <Users className="h-8 w-8" style={{ color: currentTheme.colors.primary }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Friends & Community</h1>
              <p className="text-gray-400 mt-1">Connect with other FUT players</p>
            </div>
          </div>

          {/* Search Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <Search className="h-5 w-5" />
                Find Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  className="flex-1"
                  style={{ 
                    backgroundColor: currentTheme.colors.surface, 
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text 
                  }}
                />
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg" 
                         style={{ backgroundColor: currentTheme.colors.surface }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-fifa-blue flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.username}</p>
                          <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                            {user.total_games} games, {user.total_wins} wins
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => sendFriendRequest(user.id)}
                        size="sm"
                        className="bg-fifa-blue hover:bg-fifa-blue/80"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle style={{ color: currentTheme.colors.text }}>
                  Pending Friend Requests ({pendingRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-lg"
                       style={{ backgroundColor: currentTheme.colors.surface }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-fifa-purple flex items-center justify-center">
                        <span className="text-white font-bold">
                          {request.friend_profile.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{request.friend_profile.username}</p>
                        <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                          Wants to be your friend
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => acceptFriendRequest(request.id)}
                        size="sm"
                        className="bg-fifa-green hover:bg-fifa-green/80"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => declineFriendRequest(request.id)}
                        size="sm"
                        variant="outline"
                        className="border-fifa-red text-fifa-red hover:bg-fifa-red/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Friends List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle style={{ color: currentTheme.colors.text }}>
                My Friends ({acceptedFriends.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {acceptedFriends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: currentTheme.colors.muted }} />
                  <h3 className="text-xl font-semibold text-white mb-2">No Friends Yet</h3>
                  <p style={{ color: currentTheme.colors.muted }}>
                    Search for other players to add as friends!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {acceptedFriends.map((friend) => (
                    <Card key={friend.id} className="metric-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-fifa-gold flex items-center justify-center">
                            <span className="text-black font-bold text-lg">
                              {friend.friend_profile.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white">{friend.friend_profile.username}</p>
                            <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                              {friend.friend_profile.best_rank || 'Unranked'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-center p-2 bg-white/5 rounded">
                            <p className="font-bold text-fifa-blue">{friend.friend_profile.total_games}</p>
                            <p className="text-gray-400">Games</p>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <p className="font-bold text-fifa-green">{friend.friend_profile.total_wins}</p>
                            <p className="text-gray-400">Wins</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Friends;
