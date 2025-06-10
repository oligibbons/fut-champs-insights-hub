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

// Voronoi Treemap implementation
const GoalInvolvementChart = () => {
  const { weeklyData } = useDataSync();
  const [goalInvolvements, setGoalInvolvements] = useState<GoalInvolvement[]>([]);
  const [hoveredPlayer, setHoveredPlayer] = useState<GoalInvolvement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const chartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
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
    setIsLoading(false);
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

  // Generate Voronoi Treemap cells
  const generateVoronoiCells = () => {
    if (goalInvolvements.length === 0) return null;
    
    const centerX = 150;
    const centerY = 150;
    const radius = 140;
    
    // Create random shapes that fit within a circle
    return goalInvolvements.map((involvement, index) => {
      // Calculate position based on percentage and index
      const angle = (index / goalInvolvements.length) * Math.PI * 2;
      const distance = radius * 0.6 * Math.random() + radius * 0.2;
      
      // Create a random polygon with 5-8 points
      const points = [];
      const numPoints = Math.floor(Math.random() * 4) + 5; // 5-8 points
      const sizeMultiplier = Math.sqrt(involvement.percentage) / 5;
      
      for (let i = 0; i < numPoints; i++) {
        const pointAngle = angle + (i / numPoints) * Math.PI * 2;
        const pointDistance = distance * (0.8 + Math.random() * 0.4) * sizeMultiplier;
        const x = centerX + Math.cos(pointAngle) * pointDistance;
        const y = centerY + Math.sin(pointAngle) * pointDistance;
        points.push(`${x},${y}`);
      }
      
      // Create polygon
      return (
        <polygon
          key={index}
          points={points.join(' ')}
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
    
    return goalInvolvements.map((involvement, index) => {
      // Calculate position based on percentage and index
      const angle = (index / goalInvolvements.length) * Math.PI * 2;
      const distance = 140 * 0.6 * Math.random() + 140 * 0.2;
      
      const x = 150 + Math.cos(angle) * distance;
      const y = 150 + Math.sin(angle) * distance;
      
      // Only show label for segments with enough space
      if (involvement.percentage < 5) return null;
      
      return (
        <text
          key={index}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
          pointerEvents="none"
        >
          {involvement.name.split(' ')[0]}
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
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="w-8 h-8 border-4 border-fifa-blue/30 border-t-fifa-blue rounded-full animate-spin"></div>
          </div>
        ) : goalInvolvements.length > 0 ? (
          <div className="space-y-6">
            <div className="relative" ref={chartRef}>
              <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
                {/* Circle background */}
                <circle cx="150" cy="150" r="140" fill="rgba(255,255,255,0.05)" />
                
                {/* Voronoi cells */}
                {generateVoronoiCells()}
                
                {/* Player labels */}
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
                  {hoveredPlayer.account && (
                    <div className="text-xs opacity-80">{hoveredPlayer.account}</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {goalInvolvements.slice(0, 8).map((involvement, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
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