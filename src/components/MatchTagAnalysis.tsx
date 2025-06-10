import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDataSync } from '@/hooks/useDataSync';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Tag, TrendingUp, TrendingDown } from 'lucide-react';

interface TagStats {
  tag: string;
  count: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  color: string;
  label: string;
}

const MatchTagAnalysis = () => {
  const { weeklyData } = useDataSync();
  const [tagStats, setTagStats] = useState<TagStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    // Calculate tag statistics
    const tagMap = new Map<string, {
      count: number;
      winCount: number;
      lossCount: number;
    }>();
    
    // Process all games with tags
    weeklyData.forEach(week => {
      week.games.forEach(game => {
        if (game.tags && game.tags.length > 0) {
          game.tags.forEach(tag => {
            if (!tagMap.has(tag)) {
              tagMap.set(tag, {
                count: 0,
                winCount: 0,
                lossCount: 0
              });
            }
            
            const stats = tagMap.get(tag)!;
            stats.count += 1;
            
            if (game.result === 'win') {
              stats.winCount += 1;
            } else {
              stats.lossCount += 1;
            }
            
            tagMap.set(tag, stats);
          });
        }
      });
    });
    
    // Convert to array and calculate win rates
    const tagStatsArray = Array.from(tagMap.entries()).map(([tag, stats]) => {
      const winRate = stats.count > 0 ? (stats.winCount / stats.count) * 100 : 0;
      
      return {
        tag,
        count: stats.count,
        winCount: stats.winCount,
        lossCount: stats.lossCount,
        winRate,
        color: getTagColor(tag),
        label: getTagLabel(tag)
      };
    }).sort((a, b) => b.count - a.count);
    
    setTagStats(tagStatsArray);
    setIsLoading(false);
  }, [weeklyData]);

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'comeback': return '#10b981'; // green
      case 'bottled': return '#ef4444'; // red
      case 'bad-servers': return '#f59e0b'; // amber
      case 'scripting': return '#8b5cf6'; // purple
      case 'good-opponent': return '#3b82f6'; // blue
      case 'lucky-win': return '#22c55e'; // green
      case 'unlucky-loss': return '#f43f5e'; // red
      case 'dominated': return '#a855f7'; // purple
      case 'close-game': return '#eab308'; // yellow
      default: return '#6b7280'; // gray
    }
  };

  const getTagLabel = (tag: string) => {
    switch (tag) {
      case 'comeback': return 'Comeback Win';
      case 'bottled': return 'Bottled Lead';
      case 'bad-servers': return 'Bad Servers';
      case 'scripting': return 'Scripting';
      case 'good-opponent': return 'Good Opponent';
      case 'lucky-win': return 'Lucky Win';
      case 'unlucky-loss': return 'Unlucky Loss';
      case 'dominated': return 'Dominated';
      case 'close-game': return 'Close Game';
      default: return tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Tag className="h-5 w-5 text-fifa-blue" />
          Match Tag Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="w-8 h-8 border-4 border-fifa-blue/30 border-t-fifa-blue rounded-full animate-spin"></div>
          </div>
        ) : tagStats.length > 0 ? (
          <div className="space-y-6">
            {/* Tag Distribution Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tagStats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#9ca3af"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                      border: '1px solid rgba(59, 130, 246, 0.3)', 
                      borderRadius: '12px' 
                    }}
                    formatter={(value: any) => [value, 'Games']}
                  />
                  <Bar dataKey="count" name="Games" radius={[4, 4, 0, 0]}>
                    {tagStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Win Rate Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tagStats.map((tag) => (
                <div 
                  key={tag.tag}
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: `${tag.color}10`, 
                    borderColor: `${tag.color}30` 
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge style={{ backgroundColor: tag.color }}>
                        {tag.label}
                      </Badge>
                      <span className="text-white text-sm">{tag.count} games</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {tag.winRate >= 50 ? (
                        <TrendingUp className="h-4 w-4 text-fifa-green" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-fifa-red" />
                      )}
                      <span className={tag.winRate >= 50 ? 'text-fifa-green' : 'text-fifa-red'}>
                        {tag.winRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${tag.winRate}%`,
                        backgroundColor: tag.winRate >= 50 ? '#10b981' : '#ef4444'
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>{tag.winCount}W</span>
                    <span>{tag.lossCount}L</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Insights */}
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-white font-medium mb-2">Match Tag Insights</h3>
              <div className="space-y-2 text-sm text-gray-300">
                {tagStats.length > 0 && (
                  <>
                    <p>
                      {tagStats[0].label} is your most common match tag ({tagStats[0].count} games).
                    </p>
                    
                    {tagStats.filter(t => t.count >= 3).sort((a, b) => b.winRate - a.winRate)[0] && (
                      <p>
                        You perform best in games tagged as {tagStats.filter(t => t.count >= 3).sort((a, b) => b.winRate - a.winRate)[0].label} 
                        ({tagStats.filter(t => t.count >= 3).sort((a, b) => b.winRate - a.winRate)[0].winRate.toFixed(0)}% win rate).
                      </p>
                    )}
                    
                    {tagStats.filter(t => t.count >= 3).sort((a, b) => a.winRate - b.winRate)[0] && (
                      <p>
                        You struggle most in games tagged as {tagStats.filter(t => t.count >= 3).sort((a, b) => a.winRate - b.winRate)[0].label}
                        ({tagStats.filter(t => t.count >= 3).sort((a, b) => a.winRate - b.winRate)[0].winRate.toFixed(0)}% win rate).
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Tag className="h-16 w-16 mx-auto mb-4 text-gray-500 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No Match Tags</h3>
            <p className="text-gray-400">
              Add tags when recording games to see patterns in your performance.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchTagAnalysis;