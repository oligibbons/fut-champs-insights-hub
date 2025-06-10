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

// D3 Voronoi implementation
const computeVoronoi = (
  data: GoalInvolvement[],
  width: number,
  height: number
) => {
  // Create a container for all cells
  const cells: Array<{
    points: string;
    color: string;
    data: GoalInvolvement;
    centroid: [number, number];
  }> = [];

  // Total percentage for angle calculation
  const totalPercentage = data.reduce((sum, d) => sum + d.percentage, 0);
  
  // Center of the chart
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;
  
  // Starting angle
  let startAngle = 0;
  
  // Create cells for each data point
  data.forEach((d) => {
    // Calculate angle based on percentage
    const angle = (d.percentage / totalPercentage) * (2 * Math.PI);
    const endAngle = startAngle + angle;
    
    // Create points for the cell
    const points: [number, number][] = [];
    
    // Add center point
    points.push([centerX, centerY]);
    
    // Add points along the arc
    const numPoints = Math.max(8, Math.floor(d.percentage));
    for (let i = 0; i <= numPoints; i++) {
      const pointAngle = startAngle + (i / numPoints) * angle;
      
      // Vary the radius slightly for organic shape
      const variableRadius = radius * (0.85 + Math.random() * 0.15);
      
      const x = centerX + Math.cos(pointAngle) * variableRadius;
      const y = centerY + Math.sin(pointAngle) * variableRadius;
      
      points.push([x, y]);
    }
    
    // Calculate centroid for label placement
    const midAngle = startAngle + angle / 2;
    const labelRadius = radius * 0.6;
    const centroidX = centerX + Math.cos(midAngle) * labelRadius;
    const centroidY = centerY + Math.sin(midAngle) * labelRadius;
    
    // Create SVG path
    const pathPoints = points.map(p => p.join(',')).join(' ');
    
    // Add cell
    cells.push({
      points: pathPoints,
      color: d.color,
      data: d,
      centroid: [centroidX, centroidY]
    });
    
    // Update start angle for next cell
    startAngle = endAngle;
  });
  
  return cells;
};

const GoalInvolvementChart = () => {
  const { weeklyData } = useDataSync();
  const [goalInvolvements, setGoalInvolvements] = useState<GoalInvolvement[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<GoalInvolvement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [voronoiCells, setVoronoiCells] = useState<any[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Compute Voronoi cells when data or container size changes
  useEffect(() => {
    if (goalInvolvements.length === 0 || !containerRef.current) return;
    
    const updateVoronoi = () => {
      const containerWidth = containerRef.current?.clientWidth || 300;
      const containerHeight = containerRef.current?.clientHeight || 300;
      
      // Compute Voronoi cells
      const cells = computeVoronoi(goalInvolvements, containerWidth, containerHeight);
      setVoronoiCells(cells);
    };
    
    updateVoronoi();
    
    // Update on window resize
    window.addEventListener('resize', updateVoronoi);
    return () => window.removeEventListener('resize', updateVoronoi);
  }, [goalInvolvements]);

  const handleCellClick = (involvement: GoalInvolvement) => {
    setSelectedPlayer(involvement);
  };

  const closePopup = () => {
    setSelectedPlayer(null);
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
            <div 
              ref={containerRef} 
              className="relative h-[300px] w-full max-w-[300px] mx-auto"
            >
              <svg 
                ref={svgRef} 
                width="100%" 
                height="100%" 
                viewBox="0 0 300 300" 
                className="mx-auto"
                style={{ overflow: 'visible' }}
              >
                {/* Background circle */}
                <circle 
                  cx="150" 
                  cy="150" 
                  r="140" 
                  fill="rgba(255,255,255,0.05)" 
                  stroke="rgba(255,255,255,0.1)" 
                  strokeWidth="1"
                />
                
                {/* Voronoi cells */}
                {voronoiCells.map((cell, i) => (
                  <g key={i} onClick={() => handleCellClick(cell.data)}>
                    <polygon
                      points={cell.points}
                      fill={cell.color}
                      stroke="rgba(0,0,0,0.3)"
                      strokeWidth="1"
                      opacity="0.8"
                      style={{ 
                        cursor: 'pointer',
                        transition: 'opacity 0.2s, transform 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.setAttribute('opacity', '1');
                        e.currentTarget.setAttribute('stroke-width', '2');
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.setAttribute('opacity', '0.8');
                        e.currentTarget.setAttribute('stroke-width', '1');
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Add labels for cells that are large enough */}
                    {cell.data.percentage >= 8 && (
                      <text
                        x={cell.centroid[0]}
                        y={cell.centroid[1]}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                        pointerEvents="none"
                      >
                        {cell.data.name.split(' ')[0]}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
              
              {/* Player popup */}
              {selectedPlayer && (
                <div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-4 rounded-lg border border-white/20 shadow-xl z-10 w-64"
                  style={{ borderColor: selectedPlayer.color }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-bold">{selectedPlayer.name}</h3>
                    <button 
                      onClick={closePopup}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center p-2 bg-white/10 rounded-lg">
                      <p className="text-lg font-bold text-fifa-green">{selectedPlayer.goals}</p>
                      <p className="text-xs text-gray-400">Goals</p>
                    </div>
                    <div className="text-center p-2 bg-white/10 rounded-lg">
                      <p className="text-lg font-bold text-fifa-blue">{selectedPlayer.assists}</p>
                      <p className="text-xs text-gray-400">Assists</p>
                    </div>
                  </div>
                  
                  <div className="text-center p-2 bg-white/10 rounded-lg mb-3">
                    <p className="text-lg font-bold text-fifa-gold">{selectedPlayer.percentage.toFixed(1)}%</p>
                    <p className="text-xs text-gray-400">of Total Involvements</p>
                  </div>
                  
                  {selectedPlayer.account && (
                    <div className="text-center text-sm text-gray-400">
                      {selectedPlayer.account}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {goalInvolvements.map((involvement, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedPlayer(involvement)}
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