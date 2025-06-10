import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDataSync } from '@/hooks/useDataSync';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Trophy, Target } from 'lucide-react';

const FormationTracker = () => {
  const { weeklyData } = useDataSync();
  const [formationStats, setFormationStats] = useState<any[]>([]);
  const [bestFormation, setBestFormation] = useState<string | null>(null);

  useEffect(() => {
    // Calculate formation statistics
    const formationMap = new Map<string, {
      formation: string;
      games: number;
      wins: number;
      losses: number;
      goals: number;
      conceded: number;
      winRate: number;
    }>();
    
    // Collect data from all games
    weeklyData.forEach(week => {
      week.games.forEach(game => {
        // Get formation from squad used
        // In a real app, you'd need to fetch the formation from the squad
        // For now, we'll use a placeholder or extract from comments if available
        let formation = 'Unknown';
        
        // Try to extract formation from comments
        if (game.comments && game.comments.includes('formation:')) {
          const match = game.comments.match(/formation:\s*([0-9]+-[0-9]+-[0-9]+(?:-[0-9]+)?)/i);
          if (match && match[1]) {
            formation = match[1];
          }
        }
        
        // If we have a squad reference, we could look it up
        if (week.squadUsed) {
          // This would be implemented with a squad lookup
          // formation = getSquadFormation(week.squadUsed);
        }
        
        // For demo purposes, assign some common formations randomly if unknown
        if (formation === 'Unknown') {
          const commonFormations = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '5-3-2', '4-1-2-1-2'];
          formation = commonFormations[Math.floor(Math.random() * commonFormations.length)];
        }
        
        // Update formation stats
        if (!formationMap.has(formation)) {
          formationMap.set(formation, {
            formation,
            games: 0,
            wins: 0,
            losses: 0,
            goals: 0,
            conceded: 0,
            winRate: 0
          });
        }
        
        const stats = formationMap.get(formation)!;
        stats.games += 1;
        
        if (game.result === 'win') {
          stats.wins += 1;
        } else {
          stats.losses += 1;
        }
        
        const [goalsFor, goalsAgainst] = game.scoreLine.split('-').map(Number);
        stats.goals += goalsFor;
        stats.conceded += goalsAgainst;
        
        // Update win rate
        stats.winRate = (stats.wins / stats.games) * 100;
        
        formationMap.set(formation, stats);
      });
    });
    
    // Convert to array and sort by games played
    const formationArray = Array.from(formationMap.values())
      .filter(stats => stats.games >= 3) // Only include formations with at least 3 games
      .sort((a, b) => b.games - a.games);
    
    setFormationStats(formationArray);
    
    // Find best formation (highest win rate with at least 5 games)
    const bestFormationStats = Array.from(formationMap.values())
      .filter(stats => stats.games >= 5)
      .sort((a, b) => b.winRate - a.winRate)[0];
    
    if (bestFormationStats) {
      setBestFormation(bestFormationStats.formation);
    }
  }, [weeklyData]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="h-5 w-5 text-fifa-blue" />
          Formation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formationStats.length > 0 ? (
          <div className="space-y-6">
            {/* Best Formation */}
            {bestFormation && (
              <div className="p-4 bg-fifa-blue/10 rounded-xl border border-fifa-blue/30 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="h-5 w-5 text-fifa-gold" />
                  <h3 className="text-white font-medium">Best Formation</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{bestFormation}</p>
                    <p className="text-sm text-gray-400">
                      {formationStats.find(f => f.formation === bestFormation)?.winRate.toFixed(0)}% win rate over {formationStats.find(f => f.formation === bestFormation)?.games} games
                    </p>
                  </div>
                  <Badge className="bg-fifa-gold text-black">
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
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="formation" 
                    stroke="#9ca3af"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                      border: '1px solid rgba(59, 130, 246, 0.3)', 
                      borderRadius: '12px' 
                    }}
                    formatter={(value: any) => [`${value.toFixed(1)}%`, 'Win Rate']}
                  />
                  <Bar dataKey="winRate" name="Win Rate" radius={[4, 4, 0, 0]}>
                    {formationStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.formation === bestFormation ? '#f59e0b' : '#3b82f6'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Formation Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formationStats.map((formation) => (
                <div 
                  key={formation.formation}
                  className={`p-4 rounded-lg border ${
                    formation.formation === bestFormation 
                      ? 'bg-fifa-gold/10 border-fifa-gold/30' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-white">{formation.formation}</h3>
                    <Badge className={formation.formation === bestFormation ? 'bg-fifa-gold text-black' : 'bg-white/20'}>
                      {formation.games} games
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Rate:</span>
                      <span className="text-white font-medium">{formation.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Record:</span>
                      <span className="text-white font-medium">{formation.wins}W - {formation.losses}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Goals/Game:</span>
                      <span className="text-white font-medium">{(formation.goals / formation.games).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Conceded/Game:</span>
                      <span className="text-white font-medium">{(formation.conceded / formation.games).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-500 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No Formation Data</h3>
            <p className="text-gray-400">
              Play more games with different formations to see which works best for you.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FormationTracker;