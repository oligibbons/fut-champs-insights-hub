// src/hooks/useChallengeMode.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { League, PendingLeagueInvite, LeagueInviteDetails } from '@/integrations/supabase/types'; // Make sure these types are defined in your types file

// --- Hook 1: Create League ---
// (Used in CreateLeagueForm.tsx)
type CreateLeagueParams = {
  name: string;
  champs_run_end_date: Date;
  admin_run_id: string;
  challenges: { id: string; points: number }[];
  friend_ids_to_invite: string[];
};

const createLeagueInSupabase = async (params: CreateLeagueParams, userId: string): Promise<string> => {
  // 1. Call the 'create_league_with_invites' RPC function in Supabase
  const { data, error } = await supabase
    .rpc('create_league_with_invites', {
      league_name: params.name,
      run_end_date: params.champs_run_end_date.toISOString(),
      admin_run_id: params.admin_run_id,
      challenge_data: params.challenges,
      friend_ids: params.friend_ids_to_invite,
      admin_id: userId,
    });

  if (error) {
    throw new Error(`Error creating league: ${error.message}`);
  }
  
  // 2. The RPC should return the new league's ID
  if (!data) {
    throw new Error('League creation returned no ID.');
  }

  return data as string;
};

export const useCreateLeague = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (params: CreateLeagueParams) => {
      if (!user) throw new Error('You must be logged in to create a league.');
      return createLeagueInSupabase(params, user.id);
    },
    onSuccess: () => {
      toast.success('League created successfully!');
      // Invalidate queries to refetch league lists
      queryClient.invalidateQueries({ queryKey: ['userLeagues'] });
      queryClient.invalidateQueries({ queryKey: ['leagueInvites'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create league.');
    },
  });
};

// --- Hook 2: Get User's Leagues ---
// (Used in ChallengeMode.tsx)
const fetchUserLeagues = async (userId: string): Promise<League[]> => {
  const { data, error } = await supabase
    .from('leagues_with_status') // Assuming you have a view or function for this
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Error fetching leagues: ${error.message}`);
  }
  return data as League[];
};

export const useUserLeagues = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userLeagues', user?.id],
    queryFn: () => {
      if (!user) return Promise.resolve([]);
      return fetchUserLeagues(user.id);
    },
    enabled: !!user,
  });
};

// --- Hook 3: Get Pending Invites ---
// (Used in ChallengeMode.tsx)
const fetchLeagueInvites = async (userId: string): Promise<PendingLeagueInvite[]> => {
  const { data, error } = await supabase
    .from('league_invites')
    .select(`
      id,
      status,
      champs_leagues ( name ),
      inviter:profiles ( username )
    `)
    .eq('invited_user_id', userId)
    .eq('status', 'pending');

  if (error) {
    throw new Error(`Error fetching invites: ${error.message}`);
  }
  return data as PendingLeagueInvite[];
};

export const useLeagueInvites = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['leagueInvites', user?.id],
    queryFn: () => {
      if (!user) return Promise.resolve([]);
      return fetchLeagueInvites(user.id);
    },
    enabled: !!user,
  });
};

// --- Hook 4: Respond to Invite ---
// (Used in ChallengeMode.tsx)
type RespondParams = {
  invite: PendingLeagueInvite;
  action: 'accept' | 'decline';
};

const respondToLeagueInvite = async (params: RespondParams, userId: string) => {
  const newStatus = params.action === 'accept' ? 'accepted' : 'declined';
  
  const { error } = await supabase
    .from('league_invites')
    .update({ status: newStatus })
    .eq('id', params.invite.id)
    .eq('invited_user_id', userId); // Security check

  if (error) {
    throw new Error(`Error responding to invite: ${error.message}`);
  }
  
  // If accepting, also add to league_participants table
  if (params.action === 'accept') {
     const { error: participantError } = await supabase
        .from('league_participants')
        .insert({
           league_id: (params.invite.champs_leagues as any).id, // You might need to adjust this join
           user_id: userId
        });
     if (participantError) {
        throw new Error(`Error adding to league: ${participantError.message}`);
     }
  }
};

export const useRespondToLeagueInvite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (params: RespondParams) => {
      if (!user) throw new Error('You must be logged in.');
      return respondToLeagueInvite(params, user.id);
    },
    onSuccess: (_, variables) => {
      toast.success(`Invite ${variables.action}ed!`);
      queryClient.invalidateQueries({ queryKey: ['leagueInvites'] });
      if (variables.action === 'accept') {
        queryClient.invalidateQueries({ queryKey: ['userLeagues'] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to respond.');
    },
  });
};


// --- Hook 5: Get Invite Details by Token ---
// (Used in JoinLeaguePage.tsx)
const fetchInviteDetailsByToken = async (token: string): Promise<LeagueInviteDetails> => {
    const { data, error } = await supabase
      .from('league_invites')
      .select(`
        league_id,
        token_status,
        league_name:champs_leagues(name),
        admin:profiles!champs_leagues_admin_id_fkey(username, avatar_url)
      `) // This is a complex query, you'll need to adjust joins
      .eq('token', token)
      .single();

    if (error || !data) {
      throw new Error('Invite not found or expired.');
    }
    
    // This is a rough shape, you must adjust to match your actual query/types
    return {
      league_id: data.league_id,
      token_status: data.token_status,
      league_name: (data.league_name as any)?.name,
      admin_username: (data.admin as any)?.username,
      admin_avatar: (data.admin as any)?.avatar_url,
    } as LeagueInviteDetails;
};

export const useLeagueInviteDetails = (token: string | undefined) => {
  return useQuery({
    queryKey: ['leagueInviteDetails', token],
    queryFn: () => fetchInviteDetailsByToken(token!),
    enabled: !!token,
    retry: false,
  });
};


// --- Hook 6: Join League by Token ---
// (Used in JoinLeaguePage.tsx)
type JoinByTokenParams = {
  leagueId: string;
  token: string;
};

const joinLeagueByTokenInSupabase = async (params: JoinByTokenParams, userId: string): Promise<string> => {
    // Call an RPC function to securely validate the token and add the user
    const { data, error } = await supabase.rpc('join_league_with_token', {
      invite_token: params.token,
      joining_user_id: userId,
      league_id_to_join: params.leagueId
    });

    if (error) {
      throw new Error(error.message || 'Failed to join league.');
    }
    
    return params.leagueId;
};

export const useJoinLeagueByToken = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (params: JoinByTokenParams) => {
      if (!user) throw new Error('You must be logged in to join.');
      return joinLeagueByTokenInSupabase(params, user.id);
    },
    onSuccess: () => {
      toast.success("Successfully joined league!");
      queryClient.invalidateQueries({ queryKey: ['userLeagues'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
};