import { LeagueParticipant } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface LeagueLeaderboardProps {
  participants: LeagueParticipant[];
}

export const LeagueLeaderboard = ({ participants }: LeagueLeaderboardProps) => {
  const { user } = useAuth();

  // Sort participants by total_points, highest first
  const sortedParticipants = [...participants].sort((a, b) => 
    (b.total_points || 0) - (a.total_points || 0)
  );

  const getRankColor = (index: number) => {
    if (index === 0) return "text-yellow-400";
    if (index === 1) return "text-gray-400";
    if (index === 2) return "text-yellow-600";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {sortedParticipants.map((p, index) => (
          <div 
            key={p.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-all",
              p.user_id === user?.id ? "bg-primary/10 border border-primary/20" : "border border-transparent"
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn("font-bold text-lg w-6 text-center", getRankColor(index))}>
                {index + 1}
              </span>
              <Avatar className="h-10 w-10">
                <AvatarImage src={p.profile.avatar_url || ''} />
                <AvatarFallback>{p.profile.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {p.profile.display_name} {p.user_id === user?.id && "(You)"}
                </div>
                <div className="text-sm text-muted-foreground">@{p.profile.username}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 font-bold text-lg">
              <Trophy className={cn("h-5 w-5", getRankColor(index))} />
              {p.total_points || 0}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};