import { LeagueChallenge, LeagueChallengeResult } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CHALLENGE_POOL } from "@/lib/challenges";
import { Check, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface LeagueChallengeListProps {
  leagueChallenges: LeagueChallenge[];
  challengeResults: LeagueChallengeResult[];
}

export const LeagueChallengeList = ({ leagueChallenges, challengeResults }: LeagueChallengeListProps) => {
  const { user } = useAuth();

  // Create a map of the user's results for easy lookup
  const userResultsMap = new Map<string, LeagueChallengeResult>();
  challengeResults
    .filter(r => r.user_id === user?.id)
    .forEach(r => {
      userResultsMap.set(r.challenge_id, r);
    });

  // Create a map of the challenge pool for easy lookup
  const poolMap = new Map(CHALLENGE_POOL.map(c => [c.id, c]));

  return (
    <div className="space-y-4">
      {leagueChallenges.map(lc => {
        const challengeDetails = poolMap.get(lc.challenge_id);
        const userResult = userResultsMap.get(lc.challenge_id);
        
        if (!challengeDetails) {
          return <div key={lc.id}>Unknown Challenge</div>;
        }

        const pointsEarned = userResult?.points_earned || 0;
        const maxPoints = challengeDetails.points;
        const isCompleted = pointsEarned > 0; // Binary/FirstToAchieve = full points or 0
        const isCompetitive = challengeDetails.evaluationType === 'competitive';

        return (
          <Card key={lc.id} className={cn(isCompleted && !isCompetitive ? "bg-green-900/10 border-green-500/20" : "")}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {isCompleted && !isCompetitive ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Award className="h-5 w-5 text-muted-foreground" />
                  )}
                  {challengeDetails.name}
                </span>
                <span className={cn("font-bold", isCompleted ? "text-green-400" : "text-muted-foreground")}>
                  {pointsEarned} / {maxPoints} PTS
                </span>
              </CardTitle>
              <CardDescription>{challengeDetails.description}</CardDescription>
            </CardHeader>
            {isCompetitive && (
              <CardContent>
                <Progress value={(pointsEarned / maxPoints) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {`Current Value: ${userResult?.metric_value || 0} (Rank: ${userResult?.rank || 'N/A'})`}
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};