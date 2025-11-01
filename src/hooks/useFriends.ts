// src/hooks/useFriends.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Friend } from '@/types/social'; // Assuming you have this type
import { useToast } from '@/components/ui/use-toast'; // Using shadcn toast
import { toast as sonnerToast } from 'sonner'; // Using sonner for mutations

export const useFriends = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast: shadcnToast } = useToast();
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    // Don't fetch until auth is fully loaded
    if (!user || authLoading) {
      setFriends([]);
      setFriendRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch friends (status = 'accepted')
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          friend:profiles!friends_friend_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          ),
          user:profiles!friends_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (friendsError) throw new Error(`Friends Error: ${friendsError.message}`);

      // Fetch incoming friend requests (status = 'pending' and user is the friend_id)
      const { data: requestsData, error: requestsError } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          user:profiles!friends_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw new Error(`Requests Error: ${requestsError.message}`);

      // Process data to show the *other* user
      const processedFriends = friendsData.map(friend => {
        const isUserInitiator = friend.user_id === user.id;
        const friendProfile = isUserInitiator ? friend.friend : friend.user;
        return {
          ...friend,
          ...(friendProfile as any), // Flatten friend profile details
          friend_profile: friendProfile // Keep profile nested
        };
      }) as Friend[];

       const processedRequests = requestsData.map(req => ({
        ...req,
        ...(req.user as any),
        friend_profile: req.user
      })) as Friend[];

      setFriends(processedFriends);
      setFriendRequests(processedRequests);

    } catch (err: any) {
      console.error("Error fetching friends data:", err);
      setError(`Failed to load friends: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Function to add a friend
  const addFriend = async (friendUsername: string) => {
    if (!user || !userProfile) {
        sonnerToast.error("You must be logged in.");
        return;
    }
    
    if (friendUsername === userProfile.username) {
        sonnerToast.error("You cannot add yourself as a friend.");
        return;
    }

    try {
        // Find the user by username
        const { data: friendUser, error: findError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', friendUsername)
            .single();

        if (findError || !friendUser) {
            throw new Error("User not found.");
        }

        const friendId = friendUser.id;

        // Check if a relationship already exists
        const { data: existing, error: checkError } = await supabase
            .from('friends')
            .select('id, status')
            .or(`(user_id.eq.${user.id},friend_id.eq.${friendId}),(user_id.eq.${friendId},friend_id.eq.${user.id})`)
            .maybeSingle(); // Use maybeSingle to not throw error if empty

         if (checkError) {
            throw new Error(`Check Error: ${checkError.message}`);
         }
        
         if (existing) {
            if (existing.status === 'accepted') {
                sonnerToast.info("You are already friends with this user.");
                return;
            }
            if (existing.status === 'pending') {
                 sonnerToast.info("A friend request is already pending with this user.");
                return;
            }
             if (existing.status === 'blocked') {
                 sonnerToast.error("This user is blocked or has blocked you.");
                return;
            }
         }

        // Create a new friend request
        const { error: insertError } = await supabase
            .from('friends')
            .insert({
                user_id: user.id,
                friend_id: friendId,
                status: 'pending'
            });

        if (insertError) {
            throw new Error(`Insert Error: ${insertError.message}`);
        }

        sonnerToast.success("Friend request sent!");
        
    } catch (err: any) {
        console.error("Error adding friend:", err);
        sonnerToast.error(err.message);
    }
  };

  // Function to accept a friend request
  const acceptFriendRequest = async (requestId: string) => {
     try {
        setLoading(true); // Set loading true
        const { error } = await supabase
            .from('friends')
            .update({ status: 'accepted' })
            .eq('id', requestId)
            .eq('friend_id', user?.id); // Security check

        if (error) throw error;
        
        sonnerToast.success("Friend Added!");
        fetchFriends(); // Refresh data
     } catch (err: any) {
        console.error("Error accepting request:", err);
        sonnerToast.error(err.message);
     } finally {
        setLoading(false); // Set loading false
     }
  };

  // Function to decline or remove a friend
  const removeFriend = async (relationshipId: string) => {
     try {
        setLoading(true); // Set loading true
        const { error } = await supabase
            .from('friends')
            .delete()
            .eq('id', relationshipId);

        if (error) throw error;

        sonnerToast.success("Friendship updated.");
        fetchFriends(); // Refresh data
     } catch (err: any) {
        console.error("Error removing friend:", err);
        sonnerToast.error(err.message);
     } finally {
        setLoading(false); // Set loading false
     }
  };


  return { friends, friendRequests, loading, error, addFriend, acceptFriendRequest, removeFriend, refetchData: fetchFriends };
};