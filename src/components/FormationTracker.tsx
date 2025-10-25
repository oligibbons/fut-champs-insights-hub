import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// --- FIX: Use useAccountData ---
import { useAccountData } from '@/hooks/useAccountData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Trophy } from 'lucide-react'; // Removed Target
// --- FIX: Import Skeleton ---
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme';

const FormationTracker = () => {
  // --- FIX: Use useAccountData and loading state ---
  const { weeklyData = [], loading } = useAccountData() || {};
  const { currentTheme } = useTheme();

  const [bestFormation, setBestFormation] = useState<string | null>(null);

  // --- FIX: Wrap expensive calculations in useMemo ---
  const formationStats = useMemo(() => {
    const formationMap = new Map<string, {
      formation: string;
      games: number;
      wins: number;
      losses: number; // Include losses to calculate win rate correctly
      goals: number;
      conceded: number;
      winRate: number;
    }>();
    
    // This logic is now safe
    weeklyData.forEach(week => {
      (week.games || []).forEach(game => {
        // Placeholder/Simplified Formation Logic (Keep as is for now)
        let formation = 'Unknown';
        if (game.comments && game.comments.includes('formation:')) {
            const match = game.comments.match(/formation:\s*([0-9]+-[0-9]+(?:-[0-9]+)?)/i);
            if (match && match[1]) formation = match[1];
        } else {
             // Fallback random assignment (Consider removing or improving this later)
            const commonFormations = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '5-3-2', '4-1-2-1-2'];
            formation = commonFormations[Math.floor(Math.random() * commonFormations.length)];
        }
        
        if (!formationMap.has(formation)) {
          formationMap.set(formation, { formation, games: 0, wins: 0, losses: 0, goals: 0, conceded: 0, winRate: 0 });
        }
        
        const stats = formationMap.get(formation)!;
        stats.games += 1;
        if (game.result === 'win') stats.wins += 1;
        else if (game.result === 'loss') stats.losses += 1; // Track losses
        
        const [goalsFor, goalsAgainst] = (game.scoreLine || '0-0').split('-').map(Number);
        stats.goals += goalsFor;
        stats.conceded += goalsAgainst;
        
        // Calculate win rate based on Wins / (Wins + Losses)
        const validGames = stats.wins + stats.losses;
        stats.winRate = validGames > 0 ? (stats.wins / validGames) * 100 : 0;
        
        formationMap.set(formation, stats);
      });
    });
    
    return Array.from(formationMap.values())
      .filter(stats => stats.games >= 3)
      .sort((a, b) => b.games - a.games);
  }, [weeklyData]);
  // --- END useMemo FIX ---

  // Effect to find best formation depends on formationStats
   useEffect(() => {
        const best = formationStats
            .filter(stats => (stats.wins + stats.losses) >= 5) // Use W+L >= 5 for reliability
            .sort((a, b) => b.winRate - a.winRate)[0];
        setBestFormation(best ? best.formation : null);
   }, [formationStats]); // Dependency array includes formationStats

  // --- FIX: Add loading state ---
  if (loading) {
    return (
      <Card 
        style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}
        className="min-h-[500px]" // Approx height
      >
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
          <BarChart3 className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
          Formation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formationStats.length > 0 ? (
          <div className="space-y-6">
            {/* Best Formation */}
            {bestFormation && (
              <div 
                className="p-4 rounded-xl border mb-4"
                style={{ backgroundColor: `${currentTheme.colors.accent}1A`, borderColor: `${currentTheme.colors.accent}4D` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="h-5 w-5" style={{ color: currentTheme.colors.accent }}/>
                  <h3 className="font-medium" style={{ color: currentTheme.colors.text }}>Best Performing Formation</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{bestFormation}</p>
                    <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
                      {formationStats.find(f => f.formation === bestFormation)?.winRate.toFixed(0)}% WR over {formationStats.find(f => f.formation === bestFormation)?.games} games
                    </p>
                  </div>
                  <Badge style={{ backgroundColor: currentTheme.colors.accent, color: currentTheme.colors.accentText }}>
                    Recommended
                  </Badge>
                </div>
              </div>
            )}
            
            {/* Formation Win Rate Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formationStats}
                  margin={{ top: 5, right: 10, left: -20, bottom: 40 }} // Adjusted margins
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.colors.border} />
                  <XAxis 
                    dataKey="formation" 
                    stroke={currentTheme.colors.muted}
                    angle={-45}
                    textAnchor="end"
                    height={60} // Keep height for angled labels
                    tick={{ fontSize: 10 }} // Keep smaller font
                  />
                  <YAxis 
                    stroke={currentTheme.colors.muted} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: currentTheme.colors.surface, 
                      border: `1px solid ${currentTheme.colors.border}`, 
                      borderRadius: '0.75rem',
                      color: currentTheme.colors.text
                    }}
                    formatter={(value: number) => [`${value.toFixed(0)}%`, 'Win Rate']} // Format as integer %
                    labelStyle={{ color: currentTheme.colors.muted }}
                  />
                  <Bar dataKey="winRate" name="Win Rate" radius={[4, 4, 0, 0]}>
                    {formationStats.map((entry) => (
                      <Cell 
                        key={`cell-${entry.formation}`} 
                        fill={entry.formation === bestFormation ? currentTheme.colors.accent : currentTheme.colors.primary} // Use theme colors 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Formation Details */}
             <h3 className="text-md font-semibold mt-4" style={{ color: currentTheme.colors.text }}>Breakdown (Min. 3 Games)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formationStats.map((formation) => (
                <div 
                  key={formation.formation}
                  className={`p-4 rounded-lg border`}
                  style={{
                     backgroundColor: currentTheme.colors.surface,
                     borderColor: formation.formation === bestFormation ? currentTheme.colors.accent : currentTheme.colors.border
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium" style={{ color: currentTheme.colors.text }}>{formation.formation}</h3>
                    <Badge 
                      variant="outline"
                      style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }}
                    >
                      {formation.games} games
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: currentTheme.colors.muted }}>Win Rate:</span>
                      <span className="font-medium" style={{ color: currentTheme.colors.text }}>{formation.winRate.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: currentTheme.colors.muted }}>Record:</span>
                      <span className="font-medium" style={{ color: currentTheme.colors.text }}>{formation.wins}W - {formation.losses}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: currentTheme.colors.muted }}>Goals/G:</span>
                      <span className="font-medium" style={{ color: currentTheme.colors.text }}>{(formation.goals / formation.games).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: currentTheme.colors.muted }}>Conc./G:</span>
                      <span className="font-medium" style={{ color: currentTheme.colors.text }}>{(formation.conceded / formation.games).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div 
            className="text-center py-12 rounded-lg"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: currentTheme.colors.muted }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: currentTheme.colors.text }}>No Formation Data</h3>
            <p style={{ color: currentTheme.colors.muted }}>
              Add formations via comments (e.g., "formation: 4-3-3") or assign squads to weeks.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FormationTracker;
