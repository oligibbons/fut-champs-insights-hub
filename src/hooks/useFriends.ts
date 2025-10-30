// src/hooks/useFriends.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Friend, FriendRequest, Profile } from '@/integrations/supabase/types';
import { toast } from 'sonner';

/**
 * Fetches the user's list of accepted friends
 */
export const useFriendsList = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          friend:profiles!friends_friend_id_fkey (id, username, display_name, avatar_url),
          requester:profiles!friends_user_id_fkey (id, username, display_name, avatar_url)
        `)
        .eq('status', 'accepted')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) throw new Error(error.message);

      return data.map(f => {
        const friendProfile = f.user_id === user.id ? f.friend : f.requester;
        return {
          ...f,
          friend: friendProfile,
        };
      }) as (Omit<Friend, "friend"> & { friend: Profile })[];
    },
    enabled: !!user,
  });
};

/**
 * Fetches pending friend requests *sent to the current user*
 */
export const useFriendRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friendRequests', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          status,
          requester:profiles!friends_user_id_fkey (id, username, display_name, avatar_url)
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (error) throw new Error(error.message);
      
      return data as (Omit<FriendRequest, "requester"> & { requester: Profile })[];
    },
    enabled: !!user,
  });
};

/**
 * Mutation to send a friend request using the secure RPC
 */
export const useAddFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendUsername: string) => {
      const { data, error } = await supabase.rpc('fn_send_friend_request', {
        p_friend_username: friendUsername,
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Friend request sent to ${data.username}`);
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to send request', { description: error.message });
    },
  });
};

/**
 * Mutation to respond to a friend request (accept or decline)
 */
export const useRespondToFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, newStatus }: { requestId: string, newStatus: 'accepted' | 'declined' }) => {
      if (newStatus === 'declined') {
        const { error } = await supabase.from('friends').delete().eq('id', requestId);
        if (error) throw new Error(error.message);
        return 'Request declined';
      }
      
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw new Error(error.message);
      
      // TODO: We could add another RPC here to notify the *requester*
      // that their friend request was accepted.

      return 'Friend added!';
    },
    onSuccess: (message) => {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to respond', { description: error.message });
    },
  });
};