// src/hooks/useChallengeMode.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { League, PendingLeagueInvite, LeagueInviteDetails, LeagueDetails, LeagueParticipant, LeagueRun } from '@/integrations/supabase/types'; // Make sure these types are defined
import { calculateLeagueStats } from '@/lib/utils'; // <-- NEW DEPENDENCY

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
  // --- THIS IS THE FIX ---
  // Ensure champs_run_end_date is a Date object. It may be passed as a string
  // from the mutation hook, so we re-parse it just in case.
  const endDate = new Date(params.champs_run_end_date);
  if (isNaN(endDate.getTime())) {
    throw new Error('Invalid end date provided.');
  }
  // --- END OF FIX ---

  // 1. Call the 'create_league_with_invites' RPC function in Supabase
  const { data, error } = await supabase
    .rpc('create_league_with_invites', {
      league_name: params.name,
      run_end_date: endDate.toISOString(), // Use the validated endDate
      admin_run_id: params.admin_run_id,
      challenge_data: params.challenges,
      friend_ids: params.friend_ids_to_invite,
      admin_id: userId,
    });

  if (error) {
    throw new Error(`Error creating league: ${error.message}`);
  }
  
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
      champs_leagues ( id, name ),
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
     // This needs the league ID, which is nested.
     const leagueId = (params.invite.champs_leagues as any)?.id;
     if (!leagueId) throw new Error("Could not find league ID in invite.");

     const { error: participantError } = await supabase
        .from('league_participants')
        .insert({
           league_id: leagueId,
           user_id: userId
        });
     if (participantError) {
        // Don't throw, but log. Maybe they are already a participant?
        console.error("Error adding to league participants: ", participantError.message);
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
    // This RPC should fetch the league name and admin details using the token
    const { data, error } = await supabase
      .rpc('get_invite_details_by_token', { invite_token: token })
      .single();

    if (error || !data) {
      throw new Error('Invite not found or expired.');
    }
    
    return data as LeagueInviteDetails;
};

export const useLeagueInviteDetails = (token: string | undefined) => {
  return useQuery({
    queryKey: ['leagueInviteDetails', token],
    queryFn: ()D => fetchInviteDetailsByToken(token!),
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

// --- HOOK 7: Get League Details ---
// (Used in LeagueDetailsPage.tsx)
const fetchLeagueDetails = async (leagueId: string, userId: string): Promise<LeagueDetails> => {
  // 1. Check if user is a member
  const { data: member, error: memberError } = await supabase
    .from('league_participants')
    .select('id')
    .eq('league_id', leagueId)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (memberError) throw memberError;
  if (!member) throw new Error("You are not a member of this league.");

  // 2. Fetch league details
  const { data: leagueData, error: leagueError } = await supabase
    .from('champs_leagues') // Assuming this is the main league table
    .select('*')
    .eq('id', leagueId)
    .single();
  
  if (leagueError) throw leagueError;
  if (!leagueData) throw new Error("League not found.");

  // 3. Fetch participants and their profiles
  const { data: participantsData, error: participantsError } = await supabase
    .from('league_participants')
    .select(`
      user_id,
      profile:profiles ( id, username, display_name, avatar_url )
    `)
    .eq('league_id', leagueId);
  
  if (participantsError) throw participantsError;

  // 4. Fetch all runs linked to this league
  const { data: runsData, error: runsError } = await supabase
    .from('league_runs')
    .select(`
      user_id,
      run:fut_champs_runs (
        id,
        name,
        wins,
        losses,
        games ( id, user_score, opp_score )
      )
    `)
    .eq('league_id', leagueId);

  if (runsError) throw runsError;

  // 5. Fetch challenges
  const { data: challengesData, error: challengesError } = await supabase
    .from('league_challenges')
    .select('challenge_id, points')
    .eq('league_id', leagueId);

  if (challengesError) throw challengesError;

  // 6. Process and combine data
  const participants = (participantsData as unknown as LeagueParticipant[]) || [];
  
  const runs = (runsData as any[])
    .map(r => ({
      ...r.run,
      user_id: r.user_id
    }))
    .filter(r => r.id) as LeagueRun[];

  const participantsWithStats = participants.map(p => {
    const playerRuns = runs.filter(r => r.user_id === p.user_id);
    const stats = calculateLeagueStats(playerRuns); // Using the util function
    return {
      ...p,
      runs: playerRuns,
      ...stats
    };
  });

  return {
    ...leagueData,
    participants: participantsWithStats,
    all_runs: runs,
    challenges: challengesData || [],
  } as LeagueDetails;
};

export const useLeagueDetails = (leagueId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['leagueDetails', leagueId, user?.id],
    queryFn: () => {
      if (!user || !leagueId) throw new Error("User or League ID is missing.");
      return fetchLeagueDetails(leagueId, user.id);
    },
    enabled: !!user && !!leagueId,
  });
};