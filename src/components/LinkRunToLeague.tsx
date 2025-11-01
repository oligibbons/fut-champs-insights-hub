// src/components/LinkRunToLeague.tsx
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Link } from 'lucide-react';
// --- FIX: Import useChallengeMode, not the non-existent useLinkRunToLeague ---
import { useMyLeagues, useChallengeMode } from '@/hooks/useChallengeMode';

interface LinkRunToLeagueProps {
  runId: string;
  currentLeagueId: string | null;
}

export const LinkRunToLeague = ({ runId, currentLeagueId }: LinkRunToLeagueProps) => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(currentLeagueId);
  const { leagues, loading: leaguesLoading } = useMyLeagues();
  // --- FIX: Use useChallengeMode and destructure linkRunToLeague ---
  const { linkRunToLeague, loading: linkLoading } = useChallengeMode();
  const { toast } = useToast();

  const handleLinkRun = async () => {
    if (!selectedLeagueId) {
      toast({ title: 'Error', description: 'No league selected.', variant: 'destructive' });
      return;
    }
    
    // --- FIX: Call the correct function ---
    await linkRunToLeague(selectedLeagueId, runId);
  };

  // Filter out the league this run is already part of, if any
  const availableLeagues = leagues.filter(league => league.id !== currentLeagueId);

  if (currentLeagueId) {
    const currentLeague = leagues.find(l => l.id === currentLeagueId);
    return (
      <div className="flex items-center gap-2">
        <Link className="h-4 w-4 text-primary" />
        <span className="text-sm text-muted-foreground">
          Linked to: <strong className="text-white">{currentLeague?.name || 'League'}</strong>
        </span>
      </div>
    );
  }

  if (availableLeagues.length === 0) {
    return <p className="text-sm text-muted-foreground">No other leagues available to link.</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        onValueChange={setSelectedLeagueId}
        disabled={leaguesLoading || linkLoading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Link to league..." />
        </SelectTrigger>
        <SelectContent>
          {availableLeagues.map((league) => (
            <SelectItem key={league.id} value={league.id}>
              {league.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="icon"
        onClick={handleLinkRun}
        disabled={!selectedLeagueId || linkLoading || leaguesLoading}
      >
        {linkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
      </Button>
    </div>
  );
};