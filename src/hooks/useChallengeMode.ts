// src/hooks/useChallengeMode.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LeagueDetails, PendingLeagueInvite } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

/**
 * Fetches all leagues the current user is a participant in
 */
export const useUserLeagues = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['leagues', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('champs_league_participants')
        .select(`
          league_id,
          champs_leagues (
            id,
            name,
            status,
            champs_run_end_date
          )
        `)
        .eq('user_id', user.id);

      if (error) throw new Error(error.message);
      
      // Flatten the data to return an array of leagues
      return data.map(p => p.champs_leagues).filter(Boolean);
    },
    enabled: !!user,
  });
};

/**
 * Fetches all details for a single league
 */
export const useLeagueDetails = (leagueId: string | null) => {
  return useQuery({
    queryKey: ['leagueDetails', leagueId],
    queryFn: async () => {
      if (!leagueId) throw new Error('No league ID provided');

      const { data, error } = await supabase
        .from('champs_leagues')
        .select(`
          *,
          admin:profiles (id, username, display_name, avatar_url),
          participants:champs_league_participants (
            *,
            profile:profiles (id, username, display_name, avatar_url)
          ),
          challenges:champs_league_challenges (*),
          results:champs_league_challenge_results (*)
        `)
        .eq('id', leagueId)
        .single();

      if (error) {
        console.warn('Error fetching full league details:', error.message);
        const { data: leagueData, error: leagueError } = await supabase
          .from('champs_leagues')
          .select('*')
          .eq('id', leagueId)
          .single();
        
        if (leagueError) throw new Error(leagueError.message);
        
        return { 
          ...leagueData, 
          admin: null, 
          participants: [], 
          challenges: [], 
          results: [] 
        } as unknown as LeagueDetails;
      }
      
      return data as LeagueDetails;
    },
    enabled: !!leagueId,
  });
};

/**
 * Fetches pending league invites for the current user
 */
export const useLeagueInvites = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['leagueInvites', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('league_invites')
        .select(`
          *,
          champs_leagues (id, name),
          inviter:profiles (id, display_name, username, avatar_url)
        `)
        .eq('invitee_id', user.id)
        .eq('status', 'pending');

      if (error) throw new Error(error.message);
      return data as PendingLeagueInvite[];
    },
    enabled: !!user,
  });
};

/**
 * Mutation to accept or decline a league invite
 */
export const useRespondToLeagueInvite = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invite, action }: { invite: PendingLeagueInvite, action: 'accept' | 'decline' }) => {
      if (!user) throw new Error('User not authenticated');

      if (action === 'decline') {
        const { error } = await supabase
          .from('league_invites')
          .update({ status: 'declined' })
          .eq('id', invite.id);
        
        if (error) throw new Error(error.message);
        return 'Invite declined';
      }

      // --- Accept Logic ---
      const { error: participantError } = await supabase
        .from('champs_league_participants')
        .insert({
          league_id: invite.league_id,
          user_id: user.id,
        });

      if (participantError) throw new Error(`Failed to join league: ${participantError.message}`);

      const { error: inviteError } = await supabase
        .from('league_invites')
        .update({ status: 'accepted' })
        .eq('id', invite.id);
      
      if (inviteError) console.warn('Failed to update invite status, but user joined league.');

      return `Joined league: ${invite.champs_leagues.name}!`;
    },
    onSuccess: (message) => {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['leagueInvites'] });
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to respond', { description: error.message });
    },
  });
};

/**
 * DTO for creating a new league
 */
interface CreateLeagueData {
  name: string;
  champs_run_end_date: Date;
  admin_run_id: string; // The weekly_performance_id of the admin
  challenges: { id: string; points: number }[];
  friend_ids_to_invite: string[];
}

/**
 * Mutation to create a new league
 */
export const useCreateLeague = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeagueData) => {
      if (!user) throw new Error('User not authenticated');

      const { data: newLeagueId, error } = await supabase.rpc('create_league', {
        league_name: data.name,
        run_end_date: data.champs_run_end_date.toISOString(),
        admin_run_id: data.admin_run_id,
        challenge_data: data.challenges,
        friend_ids_to_invite: data.friend_ids_to_invite,
      });

      if (error) {
        console.error('Error creating league:', error);
        throw new Error(error.message);
      }

      return newLeagueId as string;
    },
    onSuccess: (newLeagueId) => {
      toast.success('League created successfully!');
      queryClient.invalidateQueries({ queryKey: ['leagues', user?.id] });
    },
    onError: (error: Error) => {
      toast.error('Failed to create league', {
        description: error.message,
      });
    },
  });
};

/**
 * Mutation to trigger the server-side evaluation of league scores
 */
export const useUpdateLeagueScores = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leagueId: string) => {
      const { error } = await supabase.rpc('evaluate_league_scores', {
        p_league_id: leagueId,
      });

      if (error) {
        console.error('Error evaluating scores:', error);
        throw new Error(error.message);
      }

      return leagueId;
    },
    onSuccess: (leagueId) => {
      toast.success('Leaderboard updated!');
      queryClient.invalidateQueries({ queryKey: ['leagueDetails', leagueId] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update scores', {
        description: error.message,
      });
    },
  });
};

/**
 * Fetches the details for a league invite from its token
 */
export const useLeagueInviteDetails = (token: string | null) => {
  return useQuery({
    queryKey: ['leagueInviteDetails', token],
    queryFn: async () => {
      if (!token) throw new Error('No token provided');

      const { data, error } = await supabase
        .rpc('get_invite_details_by_token', { p_token: token });
      
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) throw new Error('Invite not found or has expired.');

      return data[0];
    },
    enabled: !!token,
    retry: false, // Don't retry on 404s
  });
};

/**
 * Mutation to join a league using a token
 */
export const useJoinLeagueByToken = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leagueId, token }: { leagueId: string, token: string }) => {
      if (!user) throw new Error('You must be logged in to join a league.');
      
      const { error: participantError } = await supabase
        .from('champs_league_participants')
        .insert({
          league_id: leagueId,
          user_id: user.id,
        });

      if (participantError) {
        if (participantError.code === '23505') { // unique_constraint violation
          throw new Error("You are already a member of this league.");
        }
        throw new Error(`Failed to join league: ${participantError.message}`);
      }
      
      await supabase
        .from('league_invites')
        .update({ status: 'accepted' })
        .eq('league_id', leagueId)
        .eq('invitee_id', user.id)
        .eq('status', 'pending');

      return leagueId;
    },
    onSuccess: (leagueId) => {
      toast.success("Successfully joined league!");
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      queryClient.invalidateQueries({ queryKey: ['leagueDetails', leagueId] });
      queryClient.invalidateQueries({ queryKey: ['leagueInvites'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to join league', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook to get (or create) a shareable token for a league
 * (For the admin's "Share" button)
 */
export const useLeagueInviteToken = (leagueId: string) => {
  return useQuery({
    queryKey: ['leagueInviteToken', leagueId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_league_invite_token', {
        p_league_id: leagueId
      });

      if (error) throw new Error(error.message);
      return data; // This is the token string
    },
    enabled: false, // Only run when manually fetched
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10,
  });
};

/**
 * Mutation for a participant to link their champs run to a league
 */
export const useLinkRunToLeague = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leagueId, weekly_performance_id }: { leagueId: string, weekly_performance_id: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('champs_league_participants')
        .update({ weekly_performance_id })
        .eq('league_id', leagueId)
        .eq('user_id', user.id);

      if (error) throw new Error(error.message);

      return leagueId;
    },
    onSuccess: (leagueId) => {
      toast.success("Champs run linked successfully!");
      // Refresh league details to hide the prompt
      queryClient.invalidateQueries({ queryKey: ['leagueDetails', leagueId] });
    },
    onError: (error: Error) => {
      toast.error("Failed to link run", { description: error.message });
    },
  });
};