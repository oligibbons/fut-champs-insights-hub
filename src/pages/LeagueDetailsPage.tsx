// src/pages/LeagueDetailsPage.tsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLeagueDetails } from '@/hooks/useChallengeMode';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Share2, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeagueLeaderboard } from '@/components/LeagueLeaderboard'; // Assuming this component exists
import { LeagueChallengeList } from '@/components/LeagueChallengeList'; // Assuming this component exists
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner'; // Using sonner to match CreateLeagueForm
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"


const LeagueDetailsPage = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  // Switched to useQuery from react-query, so 'data' is the league
  const { data: league, isLoading, error } = useLeagueDetails(leagueId);

  const handleCopyInvite = () => {
    // Logic for copying invite link - needs the invite token
    const inviteToken = (league as any)?.invite_token; // You'll need to fetch this
    if (inviteToken) {
      navigator.clipboard.writeText(
        `${window.location.origin}/join/${inviteToken}`,
      );
      toast.success('Invite Link Copied!');
    } else {
      toast.error("Invite token not found for this league.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {(error as Error).message || "Could not load league details."}
          <Button asChild variant="link" className="mt-2 block p-0">
            {/* --- FIX: Updated back path --- */}
            <Link to="/dashboard/challenge">Go Back to Leagues</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!league) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">League not found.</p>
        <Button asChild variant="link" className="mt-2">
          {/* --- FIX: Updated back path --- */}
          <Link to="/dashboard/challenge">Go Back to Leagues</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/dashboard/challenge">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leagues
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">{league.name}</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Ends: {new Date(league.champs_run_end_date).toLocaleDateString()}
            </p>
          </div>
          <Button onClick={handleCopyInvite} className="w-full md:w-auto">
            <Share2 className="mr-2 h-4 w-4" />
            Copy Invite Link
          </Button>
        </div>
      </div>

      {/* Main Content */}
       <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="leaderboard">
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="participants">
            <Users className="mr-2 h-4 w-4" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="challenges">
             {/* You'll need an icon for this */}
            Challenges
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <LeagueLeaderboard
            participants={league.participants}
            runs={league.all_runs}
          />
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
              <CardDescription>
                All members of the "{league.name}" league.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {league.participants.map((p) => (
                <div
                  key={p.user_id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={p.profile.avatar_url || ''} />
                      <AvatarFallback>
                        {p.profile.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">
                        {p.profile.display_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{p.profile.username}
                      </p>
                    </div>
                  </div>
                   {/* This assumes your stats calculation returns totalWins */}
                  <Badge variant="outline">
                    {p.totalWins || 0} Wins
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Challenges Tab */}
        <TabsContent value="challenges">
           <LeagueChallengeList challenges={league.challenges || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeagueDetailsPage;