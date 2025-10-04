import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { PieChart, Loader2 } from 'lucide-react';

interface GoalInvolvement {
  name: string;
  goals: number;
  assists: number;
  total: number;
  percentage: number;
  color: string;
}

const DonutSegment = ({ percentage, index, totalSegments, color, onHover, player }: { percentage: number, index: number, totalSegments: number, color: string, onHover: (player: GoalInvolvement | null) => void, player: GoalInvolvement }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 25;

  const offsetPercentage = useMemo(() => {
    let total = 0;
    for (let i = 0; i < index; i++) {
      total += (goalInvolvements[i]?.percentage || 0);
    }
    return total;
  }, [index]);

  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  const strokeDashoffset = -((offsetPercentage / 100) * circumference);

  return (
    <circle
      cx="100"
      cy="100"
      r={radius}
      fill="transparent"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      transform="rotate(-90 100 100)"
      className="transition-all duration-300 ease-in-out cursor-pointer hover:opacity-80"
      onMouseEnter={() => onHover(player)}
      onMouseLeave={() => onHover(null)}
    />
  );
};

// Main Component
const GoalInvolvementChart = () => {
  const { weeklyData, loading } = useSupabaseData();
  const [hoveredPlayer, setHoveredPlayer] = useState<GoalInvolvement | null>(null);

  const goalInvolvements = useMemo(() => {
    const allGames = weeklyData.flatMap(week => week.games);
    const playerInvolvements = new Map<string, { goals: number; assists: number }>();
    
    allGames.forEach(game => {
      game.playerStats?.forEach(player => {
        if (player.goals > 0 || player.assists > 0) {
          const stats = playerInvolvements.get(player.name) || { goals: 0, assists: 0 };
          stats.goals += player.goals;
          stats.assists += player.assists;
          playerInvolvements.set(player.name, stats);
        }
      });
    });

    const totalInvolvements = Array.from(playerInvolvements.values()).reduce((sum, { goals, assists }) => sum + goals + assists, 0);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    return Array.from(playerInvolvements.entries())
      .map(([name, { goals, assists }], index) => ({
        name,
        goals,
        assists,
        total: goals + assists,
        percentage: totalInvolvements > 0 ? ( (goals + assists) / totalInvolvements) * 100 : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.total - a.total);
  }, [weeklyData]);

  const totalInvolvements = goalInvolvements.reduce((sum, p) => sum + p.total, 0);
  const displayPlayer = hoveredPlayer || goalInvolvements[0];

  return (
    <Card className="static-element">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Goal Involvement
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : goalInvolvements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="relative w-[200px] h-[200px] mx-auto">
              <svg viewBox="0 0 200 200">
                {goalInvolvements.map((player, index) => (
                  <DonutSegment
                    key={player.name}
                    player={player}
                    percentage={player.percentage}
                    index={index}
                    totalSegments={goalInvolvements.length}
                    color={player.color}
                    onHover={setHoveredPlayer}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 {displayPlayer ? (
                    <>
                        <span className="text-xs font-semibold truncate max-w-[80px]">{displayPlayer.name}</span>
                        <span className="text-3xl font-bold">{displayPlayer.percentage.toFixed(1)}%</span>
                        <span className="text-xs text-muted-foreground">{displayPlayer.total} G/A</span>
                    </>
                 ) : (
                    <>
                        <span className="text-3xl font-bold">{totalInvolvements}</span>
                        <span className="text-xs text-muted-foreground">Total G/A</span>
                    </>
                 )}
              </div>
            </div>
            <div className="space-y-2">
              {goalInvolvements.slice(0, 5).map(player => (
                <div key={player.name} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-secondary/50" onMouseEnter={() => setHoveredPlayer(player)} onMouseLeave={() => setHoveredPlayer(null)}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{player.goals}G / {player.assists}A</span>
                    <Badge variant="secondary">{player.percentage.toFixed(1)}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No goal involvement data to display yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Need to export goalInvolvements for DonutSegment
let goalInvolvements: GoalInvolvement[] = [];

export default GoalInvolvementChart;
