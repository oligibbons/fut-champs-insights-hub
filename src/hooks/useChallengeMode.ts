// src/hooks/useChallengeMode.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types'; // Import generated types

// Get specific types from the generated Database types
type League = Database['public']['Tables']['champs_leagues']['Row'];
type Participant = Database['public']['Tables']['champs_league_participants']['Row'];
type Challenge = Database['public']['Tables']['champs_league_challenges']['Row'];
type ChallengeResult = Database['public']['Tables']['champs_league_challenge_results']['Row'];
type WeeklyPerformance = Database['public']['Tables']['weekly_performances']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

// --- Enhanced Types for UI ---

// Participant with their profile details
export interface LeagueParticipant extends Participant {
  profile: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null;
  run: Pick<WeeklyPerformance, 'id' | 'custom_name' | 'week_number' | 'total_wins' | 'total_losses'> | null;
}

// Challenge with its results for the *current user*
export interface LeagueChallenge extends Challenge {
  // definition: ChallengeDefinition | null; // Assuming a 'challenge_definitions' table exists
  result: ChallengeResult | null;
}

// The comprehensive league object
export interface FullLeague extends League {
  participants: LeagueParticipant[];
  challenges: LeagueChallenge[];
  isAdmin: boolean;
  userParticipant: LeagueParticipant | null;
}

export const useChallengeMode = () => {
  // --- THIS IS THE FIX (Part 1) ---
  const { user, loading: authLoading } = useAuth();
  // --- END OF FIX ---
  
  const [leagues, setLeagues] = useState<FullLeague[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeagues = useCallback(async () => {
    // --- THIS IS THE FIX (Part 2) ---
    // Wait for auth to be ready
    if (!user || authLoading) {
      setLeagues([]);
      setLoading(false);
      return;
    }
    // --- END OF FIX ---

    setLoading(true);
    setError(null);

    try {
      // 1. Get IDs of leagues the user is participating in
      const { data: participantLinks, error: participantError } = await supabase
        .from('champs_league_participants')
        .select('league_id')
        .eq('user_id', user.id);

      if (participantError) throw new Error(`Participant Links Error: ${participantError.message}`);

      const leagueIds = participantLinks.map(p => p.league_id);

      // 2. Fetch all data for these leagues in parallel
      const [
        leaguesRes,
        participantsRes,
        challengesRes,
        resultsRes,
        runsRes
      ] = await Promise.all([
        // All league details
        supabase.from('champs_leagues').select('*').in('id', leagueIds),
        // All participants for these leagues (with profiles)
        supabase
          .from('champs_league_participants')
          .select(`
            *,
            profile:profiles (id, username, display_name, avatar_url)
          `)
          .in('league_id', leagueIds),
        // All challenges for these leagues
        supabase.from('champs_league_challenges').select('*').in('league_id', leagueIds),
        // All *current user* results for these leagues
        supabase.from('champs_league_challenge_results').select('*').in('league_id', leagueIds).eq('user_id', user.id),
        // All *current user* weekly runs (to link)
        supabase
            .from('weekly_performances')
            .select('id, custom_name, week_number, total_wins, total_losses')
            .eq('user_id', user.id)
            // .eq('game_version', gameVersion) // Assuming gameVersion context is applied elsewhere or not needed here
      ]);

      // Check for errors
      if (leaguesRes.error) throw new Error(`Leagues Error: ${leaguesRes.error.message}`);
      if (participantsRes.error) throw new Error(`Participants Error: ${participantsRes.error.message}`);
      if (challengesRes.error) throw new Error(`Challenges Error: ${challengesRes.error.message}`);
      if (resultsRes.error) throw new Error(`Results Error: ${resultsRes.error.message}`);
      if (runsRes.error) throw new Error(`Runs Error: ${runsRes.error.message}`);

      // Process and combine the data
      const allLeagues: League[] = leaguesRes.data || [];
      const allParticipants: (Participant & { profile: Profile | null })[] = participantsRes.data as any || [];
      const allChallenges: Challenge[] = challengesRes.data || [];
      const allResults: ChallengeResult[] = resultsRes.data || [];
      const allRuns: WeeklyPerformance[] = runsRes.data || [];

      // Create maps for efficient lookup
      const resultsMap = new Map(allResults.map(r => [r.challenge_id, r]));
      const runsMap = new Map(allRuns.map(r => [r.id, r]));

      const fullLeagues: FullLeague[] = allLeagues.map(league => {
        const leagueParticipants: LeagueParticipant[] = allParticipants
          .filter(p => p.league_id === league.id)
          .map(p => ({
            ...p,
            run: p.weekly_performance_id ? (runsMap.get(p.weekly_performance_id) as any || null) : null
          }));
          
        const leagueChallenges: LeagueChallenge[] = allChallenges
          .filter(c => c.league_id === league.id)
          .map(c => ({
            ...c,
            result: resultsMap.get(c.challenge_id) || null
          }));
          
        const userParticipant = leagueParticipants.find(p => p.user_id === user.id) || null;

        return {
          ...league,
          participants: leagueParticipants,
          challenges: leagueChallenges,
          isAdmin: league.admin_user_id === user.id,
          userParticipant: userParticipant,
        };
      });

      setLeagues(fullLeagues);

    } catch (err: any) {
      console.error("Error fetching challenge mode data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // --- THIS IS THE FIX (Part 3) ---
  }, [user, authLoading]);
  // --- END OF FIX ---

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  const createLeague = async (name: string, description: string | null, maxParticipants: number, champsRunEndDate: string) => {
    if (!user) {
       toast({ title: "Error", description: "Not authenticated", variant: "destructive" });
       return;
    }
    
    try {
        setLoading(true);
        // 1. Create the league
        const { data: league, error: leagueError } = await supabase
            .from('champs_leagues')
            .insert({
                name,
                description,
                max_participants: maxParticipants,
                champs_run_end_date: champsRunEndDate,
                admin_user_id: user.id
            })
            .select()
            .single();
        
        if (leagueError) throw new Error(`League Create Error: ${leagueError.message}`);
        
        // 2. Automatically add the admin as a participant
        const { error: participantError } = await supabase
            .from('champs_league_participants')
            .insert({
                league_id: league.id,
                user_id: user.id
            });
            
        if (participantError) throw new Error(`Participant Create Error: ${participantError.message}`);

        toast({ title: "Success", description: "League created and you've been added!" });
        fetchLeagues(); // Refresh
        
    } catch (err: any) {
        console.error("Error creating league:", err);
        toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };
  
  const joinLeague = async (leagueCode: string) => {
     if (!user) {
       toast({ title: "Error", description: "Not authenticated", variant: "destructive" });
       return;
    }
    
    try {
        setLoading(true);
        // Find league by code
        const { data: league, error: findError } = await supabase
            .from('champs_leagues')
            .select('id, max_participants, status')
            .eq('league_code', leagueCode)
            .single();
            
        if (findError || !league) throw new Error("League not found or code is invalid.");
        if (league.status !== 'active') throw new Error("This league is not active.");

        // Check if user is already in the league
        const { data: existing, error: checkError } = await supabase
            .from('champs_league_participants')
            .select('id')
            .eq('league_id', league.id)
            .eq('user_id', user.id)
            .limit(1);
            
        if (checkError) throw new Error(`Check Error: ${checkError.message}`);
        if (existing && existing.length > 0) throw new Error("You are already in this league.");
        
        // Check for max participants
        const { data: countData, error: countError } = await supabase
            .from('champs_league_participants')
            .select('id', { count: 'exact' })
            .eq('league_id', league.id);
            
        if (countError) throw new Error(`Count Error: ${countError.message}`);
        if (countData.length >= league.max_participants) throw new Error("This league is full.");

        // 3. Add user as participant
        const { error: insertError } = await supabase
            .from('champs_league_participants')
            .insert({
                league_id: league.id,
                user_id: user.id
            });
        
        if (insertError) throw new Error(`Join Error: ${insertError.message}`);
        
        toast({ title: "Success!", description: `You have joined ${leagueCode}.` });
        fetchLeagues(); // Refresh
        
    } catch (err: any) {
        console.error("Error joining league:", err);
        toast({ title: "Error joining league", description: err.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };
  
  const linkRunToLeague = async (leagueId: string, weeklyPerformanceId: string | null) => {
     if (!user) {
       toast({ title: "Error", description: "Not authenticated", variant: "destructive" });
       return;
    }
    
    try {
        const { error } = await supabase
            .from('champs_league_participants')
            .update({ weekly_performance_id: weeklyPerformanceId, last_updated: new Date().toISOString() })
            .eq('league_id', leagueId)
            .eq('user_id', user.id);
            
        if (error) throw error;
        
        toast({ title: "Success", description: "Run link updated." });
        fetchLeagues(); // Refresh
        
    } catch (err: any) {
        console.error("Error linking run:", err);
        toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return { leagues, loading, error, refetchLeagues: fetchLeagues, createLeague, joinLeague, linkRunToLeague };
};
