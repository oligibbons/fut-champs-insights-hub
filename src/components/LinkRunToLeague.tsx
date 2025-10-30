// src/components/LinkRunToLeague.tsx
import { useState } from 'react';
import { useSelectableUserRuns } from '@/hooks/useSupabaseData';
import { useLinkRunToLeague } from '@/hooks/useChallengeMode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LinkRunToLeagueProps {
  leagueId: string;
}

export const LinkRunToLeague = ({ leagueId }: LinkRunToLeagueProps) => {
  const { data: selectableRuns, isLoading: isLoadingRuns } = useSelectableUserRuns();
  const linkRun = useLinkRunToLeague();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const handleLinkRun = () => {
    if (!selectedRunId) {
      toast.error("Please select a champs run to link.");
      return;
    }
    linkRun.mutate({ leagueId, weekly_performance_id: selectedRunId });
  };

  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Link Your Champs Run
        </CardTitle>
        <CardDescription>
          To compete in this league, you must select which of your champs runs you want to use for scoring.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingRuns ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select onValueChange={setSelectedRunId}>
            <SelectTrigger>
              <SelectValue placeholder="Select your current or upcoming run..." />
            </SelectTrigger>
            <SelectContent>
              {selectableRuns?.map(run => (
                <SelectItem key={run.id} value={run.id}>
                  {run.label} {run.is_completed ? "(Completed)" : `(${run.total_wins || 0}-${run.total_losses || 0})`}
                </SelectItem>
              ))}
              {selectableRuns?.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">
                  No recent runs found. Please start a new run first.
                </div>
              )}
            </SelectContent>
          </Select>
        )}
        <Button onClick={handleLinkRun} disabled={!selectedRunId || linkRun.isPending || isLoadingRuns}>
          {linkRun.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Link className="mr-2 h-4 w-4" />
          )}
          Link This Run
        </Button>
      </CardContent>
    </Card>
  );
};