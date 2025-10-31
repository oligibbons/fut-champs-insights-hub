// src/pages/ChallengeMode.tsx
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserLeagues, useLeagueInvites, useRespondToLeagueInvite } from '@/hooks/useChallengeMode';
import { CreateLeagueForm } from '@/components/CreateLeagueForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Check, X, Loader2, Mail, Trophy, Gamepad2, History } from 'lucide-react';
import { PendingLeagueInvite, League } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sub-component to render a list of leagues
const LeagueList = ({ leagues, isLoading, emptyTitle, emptyDescription }: { 
  leagues: League[], 
  isLoading: boolean,
  emptyTitle: string,
  emptyDescription: string
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!leagues || leagues.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{emptyTitle}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {leagues.map(league => (
        <Card 
          key={league.id} 
          className="hover:border-primary transition-colors cursor-pointer"
          // --- THIS IS THE FIX (Part 1) ---
          // Use the correct absolute path
          onClick={() => navigate(`/dashboard/challenge/${league.id}`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {league.name}
              <span className={cn(
                "text-xs font-medium px-2.5 py-0.5 rounded-full",
                league.status === 'active' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              )}>
                {league.status}
              </span>
            </CardTitle>
            <CardDescription>
              Ends: {new Date(league.champs_run_end_date).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

// Sub-component for pending invites
const LeagueInvites = () => {
  const { data: invites, isLoading } = useLeagueInvites();
  const respond = useRespondToLeagueInvite();

  const handleResponse = (invite: PendingLeagueInvite, action: 'accept' | 'decline') => {
    respond.mutate({ invite, action });
  };

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (!invites || invites.length === 0) {
    return null; // Don't show the card if there are no invites
  }

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="mr-2 h-5 w-5" />
          League Invites
        </CardTitle>
        <CardDescription>
          You have {invites.length} pending league invite{invites.length > 1 ? 's' : ''}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invites.map(invite => (
          <div key={invite.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{invite.champs_leagues.name}</div>
              <div className="text-sm text-muted-foreground">
                From: @{invite.inviter.username}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleResponse(invite, 'accept')}
                disabled={respond.isPending}
              >
                {respond.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-500" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleResponse(invite, 'decline')}
                disabled={respond.isPending}
              >
                {respond.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 text-red-500" />}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Main Page Component
const ChallengeMode = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  const { data: leagues, isLoading } = useUserLeagues();

  const { activeLeagues, completedLeagues } = useMemo(() => {
    const active: League[] = [];
    const completed: League[] = [];
    (leagues || []).forEach((league) => {
      if (league.status === 'completed') {
        completed.push(league);
      } else {
        active.push(league);
      }
    });
    return { activeLeagues: active, completedLeagues: completed };
  }, [leagues]);

  // Wrap the handler in useCallback to stabilize the function prop
  const handleLeagueCreated = useCallback((newLeagueId: string) => {
    setIsCreateModalOpen(false);
    // --- THIS IS THE FIX (Part 2) ---
    // Use the correct absolute path or a relative path.
    // navigate(newLeagueId) would also work.
    navigate(`/dashboard/challenge/${newLeagueId}`);
  }, [navigate]); // Add navigate as a dependency

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center">
          <Trophy className="mr-3 h-8 w-8 text-primary" />
          Challenge Mode
        </h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create New League
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Challenge League</DialogTitle>
            </DialogHeader>
            <CreateLeagueForm onSuccess={handleLeagueCreated} />
          </DialogContent>
        </Dialog>
      </div>
      
      <LeagueInvites />

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            <Gamepad2 className="mr-2 h-4 w-4" />
            Active Leagues
          </TabsTrigger>
          <TabsTrigger value="completed">
            <History className="mr-2 h-4 w-4" />
            League History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          <LeagueList 
            leagues={activeLeagues}
            isLoading={isLoading}
            emptyTitle="No Active Leagues"
            emptyDescription="Create a new league or join one to get started!"
          />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <LeagueList 
            leagues={completedLeagues}
            isLoading={isLoading}
            emptyTitle="No Completed Leagues"
            emptyDescription="Your completed leagues will appear here."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChallengeMode;