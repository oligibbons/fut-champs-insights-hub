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

interface VoronoiCell {
  id: string;
  path: string;
  color: string;
  name: string;
  goals: number;
  assists: number;
  percentage: number;
  x: number;
  y: number;
}

const GoalInvolvementChart = () => {
  const { weeklyData } = useDataSync();
  const [goalInvolvements, setGoalInvolvements] = useState<GoalInvolvement[]>([]);
  const [voronoiCells, setVoronoiCells] = useState<VoronoiCell[]>([]);
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
        if (player.goals === 0 && player.assists === 0) return; // Skip players with no goal involvements
        
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
      .map(([name, { goals, assists, account }], index) => {
        const total = goals + assists;
        return {
          name,
          goals,
          assists,
          total,
          percentage: totalInvolvements > 0 ? (total / totalInvolvements) * 100 : 0,
          color: getColorFromPalette(index),
          account
        };
      })
      .filter(player => player.total > 0) // Only include players with goal involvements
      .sort((a, b) => b.total - a.total); // Sort by total involvements
    
    setGoalInvolvements(involvements);
    
    // Generate Voronoi cells
    if (involvements.length > 0) {
      generateVoronoiCells(involvements);
    }
    
    setIsLoading(false);
  }, [weeklyData]);

  // Generate a color from a predefined palette
  const getColorFromPalette = (index: number) => {
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
      '#84cc16', // lime
      '#d946ef', // fuchsia
      '#0ea5e9', // sky
      '#f43f5e', // rose
      '#22d3ee', // cyan
      '#a3e635', // lime
      '#fb7185', // rose
      '#38bdf8', // sky
      '#4ade80', // green
      '#a78bfa', // purple
    ];
    
    return colors[index % colors.length];
  };

  // Generate Voronoi Treemap cells
  const generateVoronoiCells = (involvements: GoalInvolvement[]) => {
    const centerX = 150;
    const centerY = 150;
    const radius = 140;
    const cells: VoronoiCell[] = [];
    
    // Calculate total percentage to ensure we use the full circle
    const totalPercentage = involvements.reduce((sum, player) => sum + player.percentage, 0);
    const scaleFactor = 100 / totalPercentage;
    
    let currentAngle = 0;
    
    involvements.forEach((player, index) => {
      // Calculate adjusted percentage to ensure all cells add up to 100%
      const adjustedPercentage = player.percentage * scaleFactor;
      
      // Calculate angle based on percentage
      const arcAngle = (adjustedPercentage / 100) * Math.PI * 2;
      const startAngle = currentAngle;
      const endAngle = currentAngle + arcAngle;
      
      // Calculate center point of the cell for label positioning
      const midAngle = startAngle + arcAngle / 2;
      const labelDistance = radius * 0.6; // Position labels at 60% of radius
      const labelX = centerX + Math.cos(midAngle) * labelDistance;
      const labelY = centerY + Math.sin(midAngle) * labelDistance;
      
      // Generate random points within the sector
      const points: [number, number][] = [];
      const numPoints = 10 + Math.floor(adjustedPercentage / 2); // More points for larger cells
      
      // Add center point
      points.push([centerX, centerY]);
      
      // Add points along the arc
      for (let i = 0; i <= numPoints; i++) {
        const angle = startAngle + (arcAngle * i) / numPoints;
        const distance = radius * (0.3 + Math.random() * 0.7); // Random distance from center
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        points.push([x, y]);
      }
      
      // Add points on the circumference
      for (let i = 0; i <= 5; i++) {
        const angle = startAngle + (arcAngle * i) / 5;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        points.push([x, y]);
      }
      
      // Create a convex hull from the points
      const hullPoints = getConvexHull(points);
      
      // Create path from hull points
      const pathData = hullPoints.map((point, i) => 
        (i === 0 ? 'M' : 'L') + point[0] + ',' + point[1]
      ).join(' ') + 'Z';
      
      cells.push({
        id: `cell-${index}`,
        path: pathData,
        color: player.color,
        name: player.name,
        goals: player.goals,
        assists: player.assists,
        percentage: player.percentage,
        x: labelX,
        y: labelY
      });
      
      // Update current angle for next cell
      currentAngle = endAngle;
    });
    
    setVoronoiCells(cells);
  };

  // Function to calculate convex hull (Graham scan algorithm)
  const getConvexHull = (points: [number, number][]) => {
    if (points.length <= 3) return points;
    
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
  const orientation = (p: [number, number], q: [number, number], r: [number, number]) => {
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
            <div className="relative h-[300px] w-[300px] mx-auto" ref={chartRef}>
              <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
                {/* Circle background */}
                <circle cx="150" cy="150" r="140" fill="rgba(255,255,255,0.05)" />
                
                {/* Voronoi cells */}
                {voronoiCells.map((cell) => (
                  <path
                    key={cell.id}
                    d={cell.path}
                    fill={cell.color}
                    stroke="rgba(0, 0, 0, 0.3)"
                    strokeWidth="1"
                    opacity="0.8"
                    onMouseEnter={(e) => {
                      const player = goalInvolvements.find(p => p.name === cell.name);
                      if (player) {
                        setHoveredPlayer(player);
                        if (chartRef.current) {
                          const rect = chartRef.current.getBoundingClientRect();
                          setTooltipPosition({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top - 70
                          });
                        }
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
                ))}
                
                {/* Player labels */}
                {voronoiCells.map((cell) => {
                  // Only show label for segments with enough space
                  if (cell.percentage < 5) return null;
                  
                  return (
                    <text
                      key={`label-${cell.id}`}
                      x={cell.x}
                      y={cell.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {cell.name.split(' ')[0]}
                    </text>
                  );
                })}
              </svg>
              
              {hoveredPlayer && (
                <div 
                  className="goal-involvement-tooltip"
                  style={{ 
                    left: `${tooltipPosition.x}px`, 
                    top: `${tooltipPosition.y}px`,
                    backgroundColor: hoveredPlayer.color + 'e6' // Add transparency
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
              {goalInvolvements.map((involvement, index) => (
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
                    {involvement.percentage.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
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