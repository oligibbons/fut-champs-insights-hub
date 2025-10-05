import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useDataSync } from '@/hooks/useDataSync';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Tag, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { GameResult } from '@/types/futChampions';

// A single, unified source of truth for all tag information.
const tagDetails = {
    'Dominant Win': { category: 'Game Outcome', color: 'hsl(var(--primary))' },
    'Deserved Loss': { category: 'Game Outcome', color: 'hsl(var(--destructive))' },
    'Undeserved Win': { category: 'Game Outcome', color: 'hsl(var(--primary))' },
    'Undeserved Loss': { category: 'Game Outcome', color: 'hsl(var(--destructive))' },
    'Comeback Win': { category: 'Game Outcome', color: 'hsl(140, 80%, 60%)' },
    'Bottled Lead Loss': { category: 'Game Outcome', color: 'hsl(0, 70%, 70%)' },
    'Fair Result': { category: 'Game Outcome', color: 'hsl(var(--muted-foreground))' },
    'Close Game': { category: 'Game Feel', color: 'hsl(45, 90%, 60%)' },
    'Frustrating Game': { category: 'Game Feel', color: 'hsl(20, 80%, 60%)' },
    'Stressful': { category: 'Game Feel', color: 'hsl(300, 70%, 70%)' },
    'Fun Game': { category: 'Game Feel', color: 'hsl(190, 80%, 60%)' },
    'Game To Be Proud Of': { category: 'Game Feel', color: 'hsl(250, 80%, 70%)' },
    'Defensive Masterclass': { category: 'Performance', color: 'hsl(210, 80%, 60%)' },
    'Attacking Masterclass': { category: 'Performance', color: 'hsl(160, 80%, 60%)' },
    'Defensive Dunce': { category: 'Performance', color: 'hsl(210, 30%, 50%)' },
    'Attacking Amateur': { category: 'Performance', color: 'hsl(160, 30%, 50%)' },
    'My Own Worst Enemy': { category: 'Performance', color: 'hsl(30, 80%, 60%)' },
    'Skill God': { category: 'Opponent Style', color: 'hsl(270, 90%, 70%)' },
    'Elite Opponent': { category: 'Opponent Style', color: 'hsl(50, 100%, 60%)' },
    'Confirmed Pro Opponent': { category: 'Opponent Style', color: 'hsl(50, 100%, 50%)' },
    'Cut Back Merchant': { category: 'Opponent Style', color: 'hsl(0, 50%, 60%)' },
    'Pay2Win Rat': { category: 'Opponent Style', color: 'hsl(60, 80%, 40%)' },
    'Meta Rat': { category: 'Opponent Style', color: 'hsl(320, 70%, 60%)' },
    'Poor Quality Opponent': { category: 'Opponent Style', color: 'hsl(120, 20%, 60%)' },
    'Extra Time': { category: 'Game Events', color: 'hsl(var(--muted-foreground))' },
    'Penalties': { category: 'Game Events', color: 'hsl(var(--muted-foreground))' },
    'Opponent Rage Quit': { category: 'Game Events', color: 'hsl(var(--primary))' },
    'I Rage Quit': { category: 'Game Events', color: 'hsl(var(--destructive))' },
    'Goal Fest': { category: 'Game Events', color: 'hsl(170, 80%, 60%)' },
    'Defensive Battle': { category: 'Game Events', color: 'hsl(230, 80%, 60%)' },
    'Bad Servers': { category: 'Technical', color: 'hsl(30, 100%, 50%)' },
    'Disconnected': { category: 'Technical', color: 'hsl(var(--destructive))' },
    'Hacker': { category: 'Technical', color: 'hsl(0, 100%, 50%)' },
    'Free Win Received': { category: 'Special', color: 'hsl(120, 80%, 50%)' },
    'Free Win Given Away': { category: 'Special', color: 'hsl(0, 0%, 50%)' },
    'Opponent Rubber Banded': { category: 'Special', color: 'hsl(0, 0%, 50%)' },
    'I Rubber Banded': { category: 'Special', color: 'hsl(0, 0%, 50%)' },
};

interface TagStats {
  tag: string;
  count: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  color: string;
  category: string;
}

const MatchTagAnalysis = () => {
  const { weeklyData } = useDataSync();
  const [isLoading, setIsLoading] = useState(true);

  const allGames = useMemo(() => weeklyData.flatMap(week => week.games), [weeklyData]);

  const tagStats = useMemo(() => {
    const tagMap = new Map<string, { count: number; winCount: number; lossCount: number }>();
    
    allGames.forEach(game => {
      if (game.tags && game.tags.length > 0) {
        game.tags.forEach(tag => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, { count: 0, winCount: 0, lossCount: 0 });
          }
          const stats = tagMap.get(tag)!;
          stats.count += 1;
          if (game.result === 'win') stats.winCount += 1;
          else if (game.result === 'loss') stats.lossCount += 1;
          tagMap.set(tag, stats);
        });
      }
    });
    
    return Array.from(tagMap.entries()).map(([tag, stats]) => {
      const details = tagDetails[tag as keyof typeof tagDetails] || { category: 'Other', color: '#6b7280' };
      const winRate = stats.count > 0 ? (stats.winCount / (stats.winCount + stats.lossCount)) * 100 : 0;
      return {
        tag,
        ...stats,
        winRate: isNaN(winRate) ? 0 : winRate,
        color: details.color,
        category: details.category,
      };
    }).sort((a, b) => b.count - a.count);
  }, [allGames]);

  const categorizedStats = useMemo(() => {
    return tagStats.reduce((acc, stat) => {
        if (!acc[stat.category]) acc[stat.category] = [];
        acc[stat.category].push(stat);
        return acc;
    }, {} as Record<string, TagStats[]>);
  }, [tagStats]);

  const chartData = useMemo(() => tagStats.slice(0, 10), [tagStats]);

  useEffect(() => {
    setIsLoading(false);
  }, [weeklyData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Match Tag Analysis</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (tagStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Match Tag Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No tags have been used yet. Play some games and add tags to see your analysis here.</p>
        </CardContent>
      </Card>
    );
  }

  const defaultOpenCategories = Object.keys(categorizedStats);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Match Tag Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bar Chart Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Most Frequent Tags</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="tag" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" interval={0} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))' 
                  }}
                  cursor={{ fill: 'hsl(var(--primary), 0.1)' }}
                />
                <Bar dataKey="count" name="Games" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={`cell-${entry.tag}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Detailed Breakdown Section */}
        <div>
           <h3 className="text-lg font-semibold mb-2 mt-6">Detailed Win Rate Analysis</h3>
            <Accordion type="multiple" defaultValue={defaultOpenCategories} className="w-full">
              {Object.entries(categorizedStats).map(([category, stats]) => (
                <AccordionItem value={category} key={category}>
                  <AccordionTrigger className="text-xl font-semibold">{category}</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      {stats.map((tag) => (
                        <div key={tag.tag} className="p-4 rounded-lg border" style={{ backgroundColor: `${tag.color}1A`, borderColor: `${tag.color}4D` }}>
                          <div className="flex items-center justify-between mb-2">
                            <Badge style={{ backgroundColor: tag.color, color: 'hsl(var(--background))' }}>{tag.tag}</Badge>
                            <span className="text-sm text-muted-foreground">{tag.count} games</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <div className="text-sm flex gap-2">
                                  <span className="text-green-500">{tag.winCount}W</span>
                                  <span className="text-red-500">{tag.lossCount}L</span>
                              </div>
                              <div className="flex items-center gap-1 font-bold">
                                  {tag.winRate >= 50 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                                  <span className={tag.winRate >= 50 ? 'text-green-500' : 'text-red-500'}>
                                      {tag.winRate.toFixed(0)}%
                                  </span>
                              </div>
                          </div>
                          <div className="w-full bg-foreground/10 rounded-full h-2 mt-2">
                            <div className="h-2 rounded-full" style={{ width: `${tag.winRate}%`, backgroundColor: tag.winRate >= 50 ? 'hsl(140, 70%, 45%)' : 'hsl(0, 80%, 60%)' }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
        </div>
        
        {/* Insights Section */}
         <div className="p-4 bg-secondary/50 rounded-lg">
           <h3 className="font-semibold mb-2 flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> Insights</h3>
           <div className="space-y-1 text-sm text-muted-foreground">
             {tagStats.length > 0 && (
               <>
                 <p>Your most common match circumstance is <span className="font-bold text-foreground">{tagStats[0].tag}</span> ({tagStats[0].count} games).</p>
                 {tagStats.filter(t => t.count >= 3).sort((a, b) => b.winRate - a.winRate)[0] && (
                   <p>You perform best in games tagged as <span className="font-bold text-green-500">{tagStats.filter(t => t.count >= 3).sort((a, b) => b.winRate - a.winRate)[0].tag}</span> ({tagStats.filter(t => t.count >= 3).sort((a, b) => b.winRate - a.winRate)[0].winRate.toFixed(0)}% win rate).</p>
                 )}
                 {tagStats.filter(t => t.count >= 3).sort((a, b) => a.winRate - b.winRate)[0] && (
                   <p>You struggle most in games tagged as <span className="font-bold text-red-500">{tagStats.filter(t => t.count >= 3).sort((a, b) => a.winRate - b.winRate)[0].tag}</span> ({tagStats.filter(t => t.count >= 3).sort((a, b) => a.winRate - b.winRate)[0].winRate.toFixed(0)}% win rate).</p>
                 )}
               </>
             )}
           </div>
         </div>
      </CardContent>
    </Card>
  );
};

export default MatchTagAnalysis;

