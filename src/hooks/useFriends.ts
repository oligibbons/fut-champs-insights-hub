// src/hooks/useFriends.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Friend } from '@/types/social'; // Assuming you have this type
import { toast } from '@/components/ui/use-toast';

export const useFriends = () => {
  // --- THIS IS THE FIX (Part 1) ---
  const { user, userProfile, loading: authLoading } = useAuth();
  // --- END OF FIX ---
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    // --- THIS IS THE FIX (Part 2) ---
    // Don't fetch until auth is fully loaded
    if (!user || authLoading) {
      setFriends([]);
      setFriendRequests([]);
      setLoading(false);
      return;
    }
    // --- END OF FIX ---

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
          ...friendProfile, // Flatten friend profile details
          friend_profile: friendProfile // Keep profile nested if needed
        };
      }) as Friend[];

       const processedRequests = requestsData.map(req => ({
        ...req,
        ...req.user,
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
  // --- THIS IS THE FIX (Part 3) ---
  }, [user, authLoading]);
  // --- END OF FIX ---

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Function to add a friend
  const addFriend = async (friendUsername: string) => {
    if (!user || !userProfile) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    
    if (friendUsername === userProfile.username) {
        toast({ title: "Error", description: "You cannot add yourself as a friend.", variant: "destructive" });
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
                toast({ title: "Already Friends", description: "You are already friends with this user." });
                return;
            }
            if (existing.status === 'pending') {
                 toast({ title: "Request Pending", description: "A friend request is already pending with this user." });
                return;
            }
             if (existing.status === 'blocked') {
                 toast({ title: "Blocked", description: "This user is blocked or has blocked you." });
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

        toast({ title: "Success", description: "Friend request sent!" });
        
        // TODO: This should ideally trigger a notification for the other user

    } catch (err: any) {
        console.error("Error adding friend:", err);
        toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Function to accept a friend request
  const acceptFriendRequest = async (requestId: string) => {
     try {
        const { error } = await supabase
            .from('friends')
            .update({ status: 'accepted' })
            .eq('id', requestId)
            .eq('friend_id', user?.id); // Security check

        if (error) throw error;
        
        toast({ title: "Friend Added!", description: "You've accepted the friend request." });
        fetchFriends(); // Refresh data
     } catch (err: any) {
        console.error("Error accepting request:", err);
        toast({ title: "Error", description: err.message, variant: "destructive" });
     }
  };

  // Function to decline or remove a friend
  const removeFriend = async (relationshipId: string) => {
     try {
        const { error } = await supabase
            .from('friends')
            .delete()
            .eq('id', relationshipId);
            // Add .or() check if you want to ensure user is part of the relationship
            // .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`) 

        if (error) throw error;

        toast({ title: "Success", description: "Friendship updated." });
        fetchFriends(); // Refresh data
     } catch (err: any) {
        console.error("Error removing friend:", err);
        toast({ title: "Error", description: err.message, variant: "destructive" });
     }
  };


  return { friends, friendRequests, loading, error, addFriend, acceptFriendRequest, removeFriend, refetchData: fetchFriends };
};