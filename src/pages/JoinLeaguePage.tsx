// src/pages/JoinLeaguePage.tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLeagueInviteDetails, useJoinLeagueByToken } from '@/hooks/useChallengeMode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const JoinLeaguePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: inviteDetails, isLoading, error } = useLeagueInviteDetails(token);
  const joinLeague = useJoinLeagueByToken();

  const handleJoin = () => {
    if (!inviteDetails || !token) return;
    
    joinLeague.mutate({ leagueId: inviteDetails.league_id, token }, {
      onSuccess: (joinedLeagueId) => {
        // On success, redirect to the league page
        navigate(`/challenge/${joinedLeagueId}`);
      }
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-4 w-1/3 mx-auto" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      );
    }

    if (error || !inviteDetails) {
      return (
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Invite Invalid</AlertTitle>
          <AlertDescription>
            {error?.message || "This link may be expired or incorrect."}
            <Button asChild variant="link" className="p-0 h-auto ml-1">
              <Link to="/challenge">Back to Challenge Mode</Link>
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    
    if (inviteDetails.token_status !== 'pending') {
      return (
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Invite Expired</AlertTitle>
          <AlertDescription>
            This invite link has already been used or declined.
            <Button asChild variant="link" className="p-0 h-auto ml-1">
              <Link to="/challenge">Back to Challenge Mode</Link>
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>You've been invited to join the league:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">{inviteDetails.league_name}</h2>
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-12 w-12">
              <AvatarImage src={inviteDetails.admin_avatar || ''} />
              <AvatarFallback>{inviteDetails.admin_username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>Admin: @{inviteDetails.admin_username}</span>
          </div>

          {!user ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Please Log In</AlertTitle>
              <AlertDescription>
                You must be <Link to="/auth" className="underline">logged in</Link> to accept this invite.
              </AlertDescription>
            </Alert>
          ) : (
            <Button onClick={handleJoin} disabled={joinLeague.isPending} className="w-full">
              {joinLeague.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Accept Invite & Join League
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      {renderContent()}
    </div>
  );
};

export default JoinLeaguePage;