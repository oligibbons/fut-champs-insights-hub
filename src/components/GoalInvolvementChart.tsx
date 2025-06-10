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
  weight: number;
}

const GoalInvolvementChart = () => {
  const { weeklyData } = useDataSync();
  const [goalInvolvements, setGoalInvolvements] = useState<GoalInvolvement[]>([]);
  const [voronoiCells, setVoronoiCells] = useState<VoronoiCell[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<GoalInvolvement | null>(null);
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
    if (involvements.length === 0) return;
    
    const centerX = 150;
    const centerY = 150;
    const radius = 140;
    
    // Create cells array
    const cells: VoronoiCell[] = [];
    
    // Calculate total weight
    const totalWeight = involvements.reduce((sum, player) => sum + player.percentage, 0);
    
    // Generate initial seed points based on sunburst layout
    // This gives us a better starting distribution than random points
    let currentAngle = 0;
    involvements.forEach((player, index) => {
      // Calculate angle based on percentage
      const angleSize = (player.percentage / totalWeight) * (2 * Math.PI);
      const angle = currentAngle + (angleSize / 2);
      
      // Calculate distance from center based on weight
      // Larger percentages are closer to center
      const distance = radius * (0.3 + (Math.random() * 0.4));
      
      // Calculate position
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Create cell
      cells.push({
        id: `cell-${index}`,
        path: '', // Will be calculated later
        color: player.color,
        name: player.name,
        goals: player.goals,
        assists: player.assists,
        percentage: player.percentage,
        x: x,
        y: y,
        weight: player.percentage
      });
      
      // Update angle for next player
      currentAngle += angleSize;
    });
    
    // Generate Voronoi cells using weighted Voronoi algorithm
    generateWeightedVoronoiCells(cells, centerX, centerY, radius);
    
    setVoronoiCells(cells);
  };
  
  // Generate weighted Voronoi cells
  const generateWeightedVoronoiCells = (cells: VoronoiCell[], centerX: number, centerY: number, radius: number) => {
    // Number of points to sample for cell boundaries
    const numSamplePoints = 360;
    
    // For each cell, calculate its boundary
    cells.forEach(cell => {
      const boundaryPoints: [number, number][] = [];
      
      // Sample points around the circle
      for (let i = 0; i < numSamplePoints; i++) {
        const angle = (i / numSamplePoints) * (2 * Math.PI);
        const sampleX = centerX + Math.cos(angle) * radius;
        const sampleY = centerY + Math.sin(angle) * radius;
        
        // Find which cell this point belongs to
        let minDistanceRatio = Infinity;
        let closestCellIndex = -1;
        
        cells.forEach((otherCell, index) => {
          // Calculate weighted distance
          // Distance is divided by square root of weight to give larger cells more influence
          const dx = sampleX - otherCell.x;
          const dy = sampleY - otherCell.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const weightedDistance = distance / Math.sqrt(otherCell.weight);
          
          if (weightedDistance < minDistanceRatio) {
            minDistanceRatio = weightedDistance;
            closestCellIndex = index;
          }
        });
        
        // If this point belongs to our cell, add it to boundary
        if (closestCellIndex === cells.indexOf(cell)) {
          boundaryPoints.push([sampleX, sampleY]);
        }
      }
      
      // Add points for the cell center
      boundaryPoints.push([cell.x, cell.y]);
      
      // Sort boundary points by angle from cell center
      boundaryPoints.sort((a, b) => {
        const angleA = Math.atan2(a[1] - cell.y, a[0] - cell.x);
        const angleB = Math.atan2(b[1] - cell.y, b[0] - cell.x);
        return angleA - angleB;
      });
      
      // Remove duplicate points
      const uniquePoints: [number, number][] = [];
      for (let i = 0; i < boundaryPoints.length; i++) {
        const point = boundaryPoints[i];
        const nextPoint = boundaryPoints[(i + 1) % boundaryPoints.length];
        
        // Skip if too close to next point
        if (Math.abs(point[0] - nextPoint[0]) < 0.1 && Math.abs(point[1] - nextPoint[1]) < 0.1) {
          continue;
        }
        
        uniquePoints.push(point);
      }
      
      // Create SVG path from boundary points
      if (uniquePoints.length > 2) {
        const pathData = uniquePoints.map((point, i) => 
          (i === 0 ? 'M' : 'L') + point[0] + ',' + point[1]
        ).join(' ') + 'Z';
        
        cell.path = pathData;
      } else {
        // Fallback for cells with too few points - create a small circle
        const radius = 5;
        cell.path = `M ${cell.x - radius},${cell.y} a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 ${-radius * 2},0`;
      }
    });
    
    // Calculate cell centers based on boundary points
    cells.forEach(cell => {
      if (!cell.path) return;
      
      // Parse path to get points
      const pointsRegex = /[ML]([0-9.-]+),([0-9.-]+)/g;
      const points: [number, number][] = [];
      let match;
      
      while ((match = pointsRegex.exec(cell.path)) !== null) {
        points.push([parseFloat(match[1]), parseFloat(match[2])]);
      }
      
      // Calculate centroid
      if (points.length > 0) {
        const sumX = points.reduce((sum, point) => sum + point[0], 0);
        const sumY = points.reduce((sum, point) => sum + point[1], 0);
        
        cell.x = sumX / points.length;
        cell.y = sumY / points.length;
      }
    });
  };

  const handleCellClick = (cell: VoronoiCell) => {
    const player = goalInvolvements.find(p => p.name === cell.name);
    if (player) {
      setSelectedPlayer(player);
    }
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
                    onClick={() => handleCellClick(cell)}
                    style={{ cursor: 'pointer' }}
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