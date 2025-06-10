import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDataSync } from '@/hooks/useDataSync';
import { PieChart } from 'lucide-react';
import * as d3 from 'd3';

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
  const [selectedPlayer, setSelectedPlayer] = useState<GoalInvolvement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

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

  // Create custom Voronoi Treemap visualization
  useEffect(() => {
    if (!chartRef.current || goalInvolvements.length === 0) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();
    
    const width = chartRef.current.clientWidth;
    const height = 300;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("font", "10px sans-serif");
    
    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);
    
    // Prepare data for treemap
    const data = {
      name: "Goal Involvements",
      children: goalInvolvements.map(player => ({
        name: player.name,
        value: player.percentage,
        goals: player.goals,
        assists: player.assists,
        percentage: player.percentage,
        color: player.color
      }))
    };
    
    // Create treemap layout
    const treemap = d3.treemap()
      .size([width, height])
      .padding(2)
      .round(true);
    
    // Create hierarchy
    const root = d3.hierarchy(data)
      .sum(d => (d as any).value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));
    
    // Apply treemap layout
    treemap(root);
    
    // Create cells
    const cell = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);
    
    // Add rectangles
    cell.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => (d.data as any).color)
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.2)
      .attr("rx", 4)
      .attr("ry", 4)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke-width", 3)
          .attr("stroke-opacity", 0.5);
        
        const player = goalInvolvements.find(p => p.name === (d.data as any).name);
        if (player) {
          setSelectedPlayer(player);
        }
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke-width", 1)
          .attr("stroke-opacity", 0.2);
      })
      .on("click", function(event, d) {
        const player = goalInvolvements.find(p => p.name === (d.data as any).name);
        if (player) {
          setSelectedPlayer(player);
        }
      });
    
    // Add text labels
    cell.append("text")
      .attr("x", 4)
      .attr("y", 14)
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text(d => {
        const width = d.x1 - d.x0;
        const name = (d.data as any).name;
        // Truncate text if too long for the cell
        if (name.length * 6 > width) {
          return name.substring(0, Math.floor(width / 6)) + "...";
        }
        return name;
      })
      .style("pointer-events", "none");
    
  }, [goalInvolvements, chartRef]);

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
            {/* Custom Voronoi Treemap */}
            <div 
              ref={chartRef} 
              className="h-[300px] w-full"
            />
            
            {/* Tooltip/popup div */}
            <div ref={tooltipRef} className="hidden"></div>
            
            {/* Player popup */}
            {selectedPlayer && (
              <div 
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-4 rounded-lg border border-white/20 shadow-xl z-50 w-64"
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