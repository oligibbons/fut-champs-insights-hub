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
    
    // Create cells that fill the circle
    return (
      <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
        {/* Circle background */}
        <circle cx="150" cy="150" r="140" fill="rgba(255,255,255,0.05)" />
        
        {/* Generate cells */}
        {goalInvolvements.map((player, index) => {
          // Calculate angle based on index
          const startAngle = (index / goalInvolvements.length) * Math.PI * 2;
          const endAngle = ((index + 1) / goalInvolvements.length) * Math.PI * 2;
          
          // Calculate arc size based on percentage
          const arcSize = (player.percentage / 100) * Math.PI * 2;
          const adjustedEndAngle = startAngle + arcSize;
          
          // Calculate points for the path
          const startX = centerX + Math.cos(startAngle) * radius;
          const startY = centerY + Math.sin(startAngle) * radius;
          
          const endX = centerX + Math.cos(adjustedEndAngle) * radius;
          const endY = centerY + Math.sin(adjustedEndAngle) * radius;
          
          // Create random points within the sector
          const points = [];
          const numPoints = 8; // Number of random points
          
          // Add center point
          points.push([centerX, centerY]);
          
          // Add points along the arc
          for (let i = 0; i < numPoints; i++) {
            const angle = startAngle + (arcSize * i) / numPoints;
            const distance = radius * (0.5 + Math.random() * 0.5); // Random distance from center
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            points.push([x, y]);
          }
          
          // Add the end points
          points.push([startX, startY]);
          points.push([endX, endY]);
          
          // Create a convex hull from the points
          const hullPoints = getConvexHull(points);
          
          // Create path from hull points
          const pathData = hullPoints.map((point, i) => 
            (i === 0 ? 'M' : 'L') + point[0] + ',' + point[1]
          ).join(' ') + 'Z';
          
          return (
            <path
              key={index}
              d={pathData}
              fill={player.color}
              stroke="rgba(0, 0, 0, 0.3)"
              strokeWidth="1"
              onMouseEnter={(e) => {
                setHoveredPlayer(player);
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
        })}
        
        {/* Player labels */}
        {goalInvolvements.map((player, index) => {
          // Calculate angle based on index and percentage
          const angle = (index / goalInvolvements.length) * Math.PI * 2;
          const arcSize = (player.percentage / 100) * Math.PI * 2;
          const labelAngle = angle + arcSize / 2;
          
          // Calculate label position
          const labelDistance = radius * 0.6; // Position labels at 60% of radius
          const x = centerX + Math.cos(labelAngle) * labelDistance;
          const y = centerY + Math.sin(labelAngle) * labelDistance;
          
          // Only show label for segments with enough space
          if (player.percentage < 5) return null;
          
          return (
            <text
              key={`label-${index}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="10"
              fontWeight="bold"
              pointerEvents="none"
            >
              {player.name.split(' ')[0]}
            </text>
          );
        })}
      </svg>
    );
  };

  // Function to calculate convex hull (Graham scan algorithm)
  const getConvexHull = (points: number[][]) => {
    // Sort points by y-coordinate (and x-coordinate if y is the same)
    points.sort((a, b) => {
      if (a[1] === b[1]) {
        return a[0] - b[0];
      }
      return a[1] - b[1];
    });
    
    const p0 = points[0];
    
    // Sort points by polar angle with respect to p0
    const sortedPoints = points.slice(1).sort((a, b) => {
      const orient = orientation(p0, a, b);
      if (orient === 0) {
        // If collinear, sort by distance from p0
        return (
          (a[0] - p0[0]) * (a[0] - p0[0]) + (a[1] - p0[1]) * (a[1] - p0[1]) -
          ((b[0] - p0[0]) * (b[0] - p0[0]) + (b[1] - p0[1]) * (b[1] - p0[1]))
        );
      }
      return orient;
    });
    
    // Build hull
    const hull = [p0, sortedPoints[0]];
    
    for (let i = 1; i < sortedPoints.length; i++) {
      while (
        hull.length > 1 &&
        orientation(
          hull[hull.length - 2],
          hull[hull.length - 1],
          sortedPoints[i]
        ) <= 0
      ) {
        hull.pop();
      }
      hull.push(sortedPoints[i]);
    }
    
    return hull;
  };

  // Function to determine orientation of triplet (p, q, r)
  const orientation = (p: number[], q: number[], r: number[]) => {
    const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
    if (val === 0) return 0; // collinear
    return val > 0 ? 1 : -1; // clockwise or counterclockwise
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
              {generateVoronoiCells()}
              
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