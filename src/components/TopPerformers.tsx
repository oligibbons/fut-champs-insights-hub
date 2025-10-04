import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Star, TrendingUp } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useGameVersion } from '@/contexts/GameVersionContext'; // Import the hook

interface Performer {
  id: string;
  name: string;
  rating: number;
  games_played: number;
  goals: number;
  assists: number;
  average_rating: number;
}

const TopPerformers = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion(); // Get the current game version
  const [topPerformers, setTopPerformers] = useState<Performer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopPerformers = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        // The query now includes a filter for the selected game version
        const { data, error } = await supabase
          .from('players')
          .select('id, name, rating, games_played, goals, assists, average_rating')
          .eq('user_id', user.id)
          .eq('game_version', gameVersion) // This line fixes the bug
          .order('average_rating', { ascending: false })
          .limit(5);

        if (error) {
          throw error;
        }
        
        setTopPerformers(data || []);

      } catch (error) {
        console.error('Error fetching top performers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPerformers();
  }, [user, gameVersion]); // Re-run the effect when gameVersion changes

  const PerformerStat = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string | number, label: string }) => (
    <div className="flex items-center text-sm text-muted-foreground">
      <Icon className="h-4 w-4 mr-2" />
      <span>{value} <span className="hidden sm:inline">{label}</span></span>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        ) : topPerformers.length > 0 ? (
          <div className="space-y-4">
            {topPerformers.map((player, index) => (
              <div key={player.id} className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                   <div className="font-bold text-lg text-primary w-6 text-center">{index + 1}</div>
                   <div>
                     <p className="font-semibold">{player.name}</p>
                     <div className="flex items-center gap-4 mt-1">
                        <PerformerStat icon={Star} value={player.average_rating.toFixed(1)} label="Rating" />
                        <PerformerStat icon={TrendingUp} value={player.goals} label="Goals" />
                        <PerformerStat icon={Users} value={player.games_played} label="Games" />
                     </div>
                   </div>
                </div>
                 <div className="text-right">
                    <div className="font-bold text-lg">{player.rating}</div>
                    <div className="text-xs text-muted-foreground">OVR</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No player data available for this game version yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TopPerformers;
