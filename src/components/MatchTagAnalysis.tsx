import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
// --- FIX: Use useAccountData ---
import { useAccountData } from '@/hooks/useAccountData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Tag, TrendingUp, TrendingDown, Info, Loader2 } from 'lucide-react';
// --- FIX: Import Skeleton ---
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme';

// tagDetails remains the same
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
  // --- FIX: Use useAccountData and loading state ---
  const { weeklyData = [], loading } = useAccountData() || {};
  const { currentTheme } = useTheme();

  const allGames = useMemo(() => weeklyData.flatMap(week => week.games || []), [weeklyData]);

  const tagStats = useMemo(() => {
    const tagMap = new Map<string, { count: number; winCount: number; lossCount: number }>();
    
    allGames.forEach(game => {
      // Use optional chaining for safety
      game.tags?.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, { count: 0, winCount: 0, lossCount: 0 });
        }
        const stats = tagMap.get(tag)!;
        stats.count += 1;
        if (game.result === 'win') stats.winCount += 1;
        else if (game.result === 'loss') stats.lossCount += 1;
        tagMap.set(tag, stats);
      });
    });
    
    return Array.from(tagMap.entries()).map(([tag, stats]) => {
      const details = tagDetails[tag as keyof typeof tagDetails] || { category: 'Other', color: currentTheme.colors.muted }; // Use theme color
      const validGames = stats.winCount + stats.lossCount; // Only count wins/losses for winrate
      const winRate = validGames > 0 ? (stats.winCount / validGames) * 100 : 0;
      return {
        tag,
        ...stats,
        winRate: isNaN(winRate) ? 0 : winRate,
        color: details.color,
        category: details.category,
      };
    }).sort((a, b) => b.count - a.count);
  }, [allGames, currentTheme]);

  const categorizedStats = useMemo(() => {
    return tagStats.reduce((acc, stat) => {
        if (!acc[stat.category]) acc[stat.category] = [];
        acc[stat.category].push(stat);
        return acc;
    }, {} as Record<string, TagStats[]>);
  }, [tagStats]);

  const chartData = useMemo(() => tagStats.slice(0, 10), [tagStats]);

  // --- FIX: Use loading state ---
  if (loading) {
    return (
      <Card 
        style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}
        className="min-h-[500px]" // Approx height
      >
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: currentTheme.colors.primary }} />
        </CardContent>
      </Card>
    );
  }

  if (tagStats.length === 0) {
    return (
      <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
            <Tag className="h-5 w-5" style={{ color: currentTheme.colors.primary }}/>
            Match Tag Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p style={{ color: currentTheme.colors.muted }}>No tags used yet. Add tags to games to see analysis.</p>
        </CardContent>
      </Card>
    );
  }

  const defaultOpenCategories = Object.keys(categorizedStats);

  return (
    <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
          <Tag className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
          Match Tag Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bar Chart Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: currentTheme.colors.text }}>Most Frequent Tags</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.colors.border} />
                <XAxis 
                    dataKey="tag" 
                    stroke={currentTheme.colors.muted} 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0} 
                    height={70} // Increased height for angled labels
                    tick={{ fontSize: 10 }} // Smaller font size
                 />
                <YAxis stroke={currentTheme.colors.muted} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: currentTheme.colors.surface, 
                    borderColor: currentTheme.colors.border,
                    borderRadius: '0.75rem',
                    color: currentTheme.colors.text,
                  }}
                  cursor={{ fill: `${currentTheme.colors.primary}1A` }} // Use theme color with opacity
                />
                <Bar dataKey="count" name="Games" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={`cell-${entry.tag}`} fill={entry.color || currentTheme.colors.primary} /> // Use tag color or primary
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Detailed Breakdown Section */}
        <div>
           <h3 className="text-lg font-semibold mb-2 mt-6" style={{ color: currentTheme.colors.text }}>Detailed Win Rate Analysis</h3>
            <Accordion type="multiple" defaultValue={defaultOpenCategories} className="w-full">
              {Object.entries(categorizedStats).map(([category, stats]) => (
                <AccordionItem value={category} key={category} style={{ borderColor: currentTheme.colors.border }}>
                  <AccordionTrigger className="text-md font-semibold hover:no-underline" style={{ color: currentTheme.colors.text }}>{category}</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      {stats.map((tag) => (
                        <div 
                          key={tag.tag} 
                          className="p-4 rounded-lg border" 
                          style={{ backgroundColor: `${tag.color}1A`, borderColor: `${tag.color}4D` }} // Opacity added to color
                        >
                          <div className="flex items-center justify-between mb-2">
                             {/* Ensure badge text contrasts with its background */}
                            <Badge style={{ backgroundColor: tag.color, color: '#FFFFFF' }}>{tag.tag}</Badge>
                            <span className="text-sm" style={{ color: currentTheme.colors.muted }}>{tag.count} games</span>
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
                          <div className="w-full rounded-full h-2 mt-2" style={{ backgroundColor: currentTheme.colors.surface }}>
                            <div 
                                className="h-2 rounded-full" 
                                style={{ 
                                    width: `${tag.winRate}%`, 
                                    backgroundColor: tag.winRate >= 50 ? 'hsl(140, 70%, 45%)' : 'hsl(0, 80%, 60%)' 
                                }}
                            />
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
         <div 
            className="p-4 rounded-lg" 
            style={{ backgroundColor: currentTheme.colors.surface }}
         >
           <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: currentTheme.colors.text }}><Info className="h-5 w-5" style={{ color: currentTheme.colors.primary }} /> Insights</h3>
           <div className="space-y-1 text-sm" style={{ color: currentTheme.colors.muted }}>
             {tagStats.length > 0 && (
               <>
                 <p>Most common: <span className="font-bold" style={{ color: currentTheme.colors.text }}>{tagStats[0].tag}</span> ({tagStats[0].count} games).</p>
                 {tagStats.filter(t => (t.winCount + t.lossCount) >= 3).sort((a, b) => b.winRate - a.winRate)[0] && (
                   <p>Best performance: <span className="font-bold text-green-500">{tagStats.filter(t => (t.winCount + t.lossCount) >= 3).sort((a, b) => b.winRate - a.winRate)[0].tag}</span> ({tagStats.filter(t => (t.winCount + t.lossCount) >= 3).sort((a, b) => b.winRate - a.winRate)[0].winRate.toFixed(0)}% WR).</p>
                 )}
                 {tagStats.filter(t => (t.winCount + t.lossCount) >= 3).sort((a, b) => a.winRate - b.winRate)[0] && (
                   <p>Toughest games: <span className="font-bold text-red-500">{tagStats.filter(t => (t.winCount + t.lossCount) >= 3).sort((a, b) => a.winRate - b.winRate)[0].tag}</span> ({tagStats.filter(t => (t.winCount + t.lossCount) >= 3).sort((a, b) => a.winRate - b.winRate)[0].winRate.toFixed(0)}% WR).</p>
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
