// src/pages/LeagueDetailsPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
// --- UPDATED IMPORT ---
import { useLeagueDetails, useUpdateLeagueScores, useLeagueInviteToken } from '@/hooks/useChallengeMode';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// --- UPDATED IMPORT ---
import { ArrowLeft, Crown, Share2, RefreshCw, AlertTriangle, Trophy, ListChecks, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeagueLeaderboard } from '@/components/LeagueLeaderboard';
import { LeagueChallengeList } from '@/components/LeagueChallengeList';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useState } from 'react';
// --- NEW IMPORT ---
import { LinkRunToLeague } from '@/components/LinkRunToLeague';

const LeagueDetailsPage = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: league, isLoading, error } = useLeagueDetails(leagueId);
  const updateScores = useUpdateLeagueScores();
  
  // --- ADDED HOOKS/STATE (AND FIXED TYPO) ---
  const [isSharing, setIsSharing] = useState(false);
  const { data: inviteToken, refetch: getInviteToken } = useLeagueInviteToken(leagueId!); // <-- TYPO REMOVED HERE

  // --- UPDATED FUNCTION ---
  const handleUpdateScores = () => {
    if (!leagueId) return;
    updateScores.mutate(leagueId);
  };
  
  // --- UPDATED FUNCTION ---
  const handleShare = () => {
    setIsSharing(true);
    
    // Function to copy the token
    const copyToken = (token: string) => {
      const shareUrl = `${window.location.origin}/join/${token}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Invite link copied to clipboard!");
      setIsSharing(false);
    };

    if (inviteToken) {
      copyToken(inviteToken);
    } else {
      getInviteToken().then((queryResult) => {
        if (queryResult.data) {
          copyToken(queryResult.data);
        } else {
          toast.error("Could not get invite link", { description: "Only the admin can generate an invite link." });
          setIsSharing(false);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading League</AlertTitle>
        <AlertDescription>
          {error.message}. Please try again or navigate back.
        </AlertDescription>
      </Alert>
    );
  }

  if (!league) {
    return <div>League not found.</div>;
  }

  const isAdmin = league.admin_user_id === user?.id;
  
  // --- NEW LOGIC ---
  const currentUserParticipant = league.participants.find(p => p.user_id === user?.id);
  const isRunLinked = !!currentUserParticipant?.weekly_performance_id;
  // --- END NEW LOGIC ---

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => navigate('/challenge')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to All Leagues
      </Button>

      {/* --- NEW CONDITIONAL RENDER --- */}
      {currentUserParticipant && !isRunLinked && (
        <LinkRunToLeague leagueId={league.id} />
      )}
      {/* --- END NEW CONDITIONAL RENDER --- */}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{league.name}</h1>
          {league.admin && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Crown className="h-4 w-4 text-yellow-500" />
              Admin: 
              <Avatar className="h-6 w-6">
                <AvatarImage src={league.admin.avatar_url || ''} />
                <AvatarFallback>{league.admin.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>@{league.admin.username}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare} disabled={isSharing || !isAdmin}>
            {isSharing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            Share
          </Button>
          {isAdmin && (
            // --- UPDATED BUTTON DISABLED STATE ---
            <Button onClick={handleUpdateScores} disabled={updateScores.isPending || !isRunLinked}>
              {updateScores.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Update Scores
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leaderboard">
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <ListChecks className="mr-2 h-4 w-4" />
            My Challenges
          </TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard" className="mt-4">
          <LeagueLeaderboard participants={league.participants} />
        </TabsContent>
        <TabsContent value="challenges" className="mt-4">
          <LeagueChallengeList 
            leagueChallenges={league.challenges}
            challengeResults={league.results}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeagueDetailsPage;