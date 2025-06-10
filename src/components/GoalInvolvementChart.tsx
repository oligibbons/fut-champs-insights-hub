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
    const cells: VoronoiCell[] = [];
    
    // Create random points for each player based on their percentage
    const totalPoints = 500; // Total number of points to distribute
    const points: Array<{x: number, y: number, player: string}> = [];
    
    // Distribute points based on player percentages
    involvements.forEach(player => {
      const playerPoints = Math.max(5, Math.round((player.percentage / 100) * totalPoints));
      
      for (let i = 0; i < playerPoints; i++) {
        // Generate random point within the circle
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        points.push({
          x,
          y,
          player: player.name
        });
      }
    });
    
    // Create Voronoi cells using a simplified approach
    // For each player, find their territory by checking which points belong to them
    involvements.forEach((player, playerIndex) => {
      const playerPoints = points.filter(point => point.player === player.name);
      
      if (playerPoints.length === 0) return;
      
      // Find the centroid of the player's points
      const centroidX = playerPoints.reduce((sum, point) => sum + point.x, 0) / playerPoints.length;
      const centroidY = playerPoints.reduce((sum, point) => sum + point.y, 0) / playerPoints.length;
      
      // Find the boundary points of the player's territory
      const boundaryPoints: Array<[number, number]> = [];
      
      // Divide the circle into sectors and find the farthest point in each sector
      const numSectors = 16;
      for (let i = 0; i < numSectors; i++) {
        const sectorAngle = (i / numSectors) * 2 * Math.PI;
        const sectorStart = sectorAngle - (Math.PI / numSectors);
        const sectorEnd = sectorAngle + (Math.PI / numSectors);
        
        // Find points in this sector
        const sectorPoints = playerPoints.filter(point => {
          const angle = Math.atan2(point.y - centerY, point.x - centerX);
          const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
          return normalizedAngle >= sectorStart && normalizedAngle <= sectorEnd;
        });
        
        if (sectorPoints.length > 0) {
          // Find the point farthest from the center in this sector
          let farthestPoint = sectorPoints[0];
          let maxDistance = Math.sqrt(
            Math.pow(farthestPoint.x - centerX, 2) + 
            Math.pow(farthestPoint.y - centerY, 2)
          );
          
          sectorPoints.forEach(point => {
            const distance = Math.sqrt(
              Math.pow(point.x - centerX, 2) + 
              Math.pow(point.y - centerY, 2)
            );
            
            if (distance > maxDistance) {
              farthestPoint = point;
              maxDistance = distance;
            }
          });
          
          boundaryPoints.push([farthestPoint.x, farthestPoint.y]);
        } else {
          // If no points in this sector, add a point on the circle boundary
          const x = centerX + Math.cos(sectorAngle) * radius * 0.9;
          const y = centerY + Math.sin(sectorAngle) * radius * 0.9;
          boundaryPoints.push([x, y]);
        }
      }
      
      // Create a path from the boundary points
      const pathData = boundaryPoints.map((point, i) => 
        (i === 0 ? 'M' : 'L') + point[0] + ',' + point[1]
      ).join(' ') + 'Z';
      
      cells.push({
        id: `cell-${playerIndex}`,
        path: pathData,
        color: player.color,
        name: player.name,
        goals: player.goals,
        assists: player.assists,
        percentage: player.percentage,
        x: centroidX,
        y: centroidY
      });
    });
    
    setVoronoiCells(cells);
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