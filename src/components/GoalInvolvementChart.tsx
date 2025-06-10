import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDataSync } from '@/hooks/useDataSync';
import { PieChart } from 'lucide-react';

interface GoalInvolvement {
  name: string;
  goals: number;
  assists: number;
  total: number;
  percentage: number;
  color: string;
  account?: string;
}

const GoalInvolvementChart = () => {
  const { weeklyData } = useDataSync();
  const [goalInvolvements, setGoalInvolvements] = useState<GoalInvolvement[]>([]);
  const [hoveredPlayer, setHoveredPlayer] = useState<GoalInvolvement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate goal involvements from all games
    const allGames = weeklyData.flatMap(week => week.games);
    const playerInvolvements = new Map<string, { goals: number; assists: number; account?: string }>();
    
    // Count goals and assists for each player
    allGames.forEach(game => {
      game.playerStats.forEach(player => {
        const key = player.name;
        
        if (!playerInvolvements.has(key)) {
          playerInvolvements.set(key, { 
            goals: 0, 
            assists: 0,
            account: 'Main Account' // Default account, would be replaced with actual account data
          });
        }
        
        const stats = playerInvolvements.get(key)!;
        stats.goals += player.goals;
        stats.assists += player.assists;
        playerInvolvements.set(key, stats);
      });
    });
    
    // Calculate total goal involvements
    const totalInvolvements = Array.from(playerInvolvements.values()).reduce(
      (sum, { goals, assists }) => sum + goals + assists, 0
    );
    
    // Convert to array and calculate percentages
    const involvements = Array.from(playerInvolvements.entries())
      .map(([name, { goals, assists, account }]) => {
        const total = goals + assists;
        return {
          name,
          goals,
          assists,
          total,
          percentage: totalInvolvements > 0 ? (total / totalInvolvements) * 100 : 0,
          color: getRandomColor(),
          account
        };
      })
      .filter(player => player.total > 0) // Only include players with goal involvements
      .sort((a, b) => b.total - a.total); // Sort by total involvements
    
    setGoalInvolvements(involvements);
  }, [weeklyData]);

  // Generate random color for each player
  const getRandomColor = () => {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#f97316', // orange
      '#14b8a6', // teal
      '#6366f1', // indigo
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Generate segments for the chart
  const generateSegments = () => {
    if (goalInvolvements.length === 0) return null;
    
    let cumulativeAngle = 0;
    
    return goalInvolvements.map((involvement, index) => {
      const angle = (involvement.percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;
      const endAngle = cumulativeAngle;
      
      // Convert angles to radians
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);
      
      // Calculate path
      const radius = 150;
      const centerX = 150;
      const centerY = 150;
      
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      return (
        <path
          key={index}
          d={pathData}
          fill={involvement.color}
          stroke="rgba(0, 0, 0, 0.3)"
          strokeWidth="1"
          onMouseEnter={(e) => {
            setHoveredPlayer(involvement);
            if (chartRef.current) {
              const rect = chartRef.current.getBoundingClientRect();
              setTooltipPosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top - 70 // Position above cursor
              });
            }
          }}
          onMouseMove={(e) => {
            if (chartRef.current) {
              const rect = chartRef.current.getBoundingClientRect();
              setTooltipPosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top - 70
              });
            }
          }}
          onMouseLeave={() => setHoveredPlayer(null)}
        />
      );
    });
  };

  // Generate player labels
  const generateLabels = () => {
    if (goalInvolvements.length === 0) return null;
    
    let cumulativeAngle = 0;
    
    return goalInvolvements.map((involvement, index) => {
      const angle = (involvement.percentage / 100) * 360;
      const midAngle = cumulativeAngle + (angle / 2);
      cumulativeAngle += angle;
      
      // Convert angle to radians
      const midRad = (midAngle - 90) * (Math.PI / 180);
      
      // Calculate position
      const radius = 100; // Slightly less than the segment radius
      const centerX = 150;
      const centerY = 150;
      
      const x = centerX + radius * Math.cos(midRad);
      const y = centerY + radius * Math.sin(midRad);
      
      // Only show label for segments with enough space
      if (angle < 15) return null;
      
      return (
        <text
          key={index}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
        >
          {involvement.total}
        </text>
      );
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <PieChart className="h-5 w-5 text-fifa-blue" />
          Goal Involvement Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {goalInvolvements.length > 0 ? (
          <div className="space-y-6">
            <div className="relative" ref={chartRef}>
              <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
                {generateSegments()}
                {generateLabels()}
              </svg>
              
              {hoveredPlayer && (
                <div 
                  className="goal-involvement-tooltip"
                  style={{ 
                    left: `${tooltipPosition.x}px`, 
                    top: `${tooltipPosition.y}px`,
                    backgroundColor: hoveredPlayer.color
                  }}
                >
                  <div className="font-bold">{hoveredPlayer.name}</div>
                  <div className="flex justify-between gap-4">
                    <span>{hoveredPlayer.goals} goals</span>
                    <span>{hoveredPlayer.assists} assists</span>
                  </div>
                  <div>{hoveredPlayer.percentage.toFixed(1)}% of total</div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {goalInvolvements.slice(0, 8).map((involvement, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  onMouseEnter={() => setHoveredPlayer(involvement)}
                  onMouseLeave={() => setHoveredPlayer(null)}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: involvement.color }}
                  ></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{involvement.name}</p>
                    <p className="text-gray-400 text-xs">
                      {involvement.goals}G {involvement.assists}A
                    </p>
                  </div>
                  <Badge className="bg-white/10 text-white">
                    {involvement.percentage.toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
            
            {goalInvolvements.length > 8 && (
              <div className="text-center">
                <Badge className="bg-white/10 text-white">
                  +{goalInvolvements.length - 8} more players
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <PieChart className="h-16 w-16 mx-auto mb-4 text-gray-500 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No Goal Data</h3>
            <p className="text-gray-400">
              Start recording games with goals and assists to see your goal involvement distribution.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalInvolvementChart;