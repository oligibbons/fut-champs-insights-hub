import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDataSync } from '@/hooks/useDataSync';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Activity, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const PerformanceRadar = () => {
  const { weeklyData, getCurrentWeek } = useDataSync();
  const [selectedWeek, setSelectedWeek] = useState<string>('current');
  const [radarData, setRadarData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const currentWeek = getCurrentWeek();
  
  useEffect(() => {
    // Generate radar data for selected week
    const generateRadarData = () => {
      let weekToAnalyze;
      
      if (selectedWeek === 'current') {
        weekToAnalyze = currentWeek;
      } else if (selectedWeek === 'all-time') {
        // Calculate all-time averages
        const allGames = weeklyData.flatMap(week => week.games);
        
        if (allGames.length === 0) return;
        
        const totalWins = allGames.filter(game => game.result === 'win').length;
        const totalGoals = allGames.reduce((sum, game) => {
          const [goals] = game.scoreLine.split('-').map(Number);
          return sum + goals;
        }, 0);
        const totalConceded = allGames.reduce((sum, game) => {
          const [, conceded] = game.scoreLine.split('-').map(Number);
          return sum + conceded;
        }, 0);
        const totalXG = allGames.reduce((sum, game) => sum + (game.teamStats?.expectedGoals || 0), 0);
        const totalXGA = allGames.reduce((sum, game) => sum + (game.teamStats?.expectedGoalsAgainst || 0), 0);
        
        const avgOpponentSkill = allGames.reduce((sum, game) => sum + game.opponentSkill, 0) / allGames.length;
        
        const allRatings = allGames.flatMap(game => 
          game.playerStats.map(player => player.rating)
        );
        
        const avgRating = allRatings.length > 0 
          ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
          : 0;
        
        // Create virtual week for all-time stats
        weekToAnalyze = {
          games: allGames,
          totalWins,
          totalGoals,
          totalConceded,
          totalExpectedGoals: totalXG,
          totalExpectedGoalsAgainst: totalXGA,
          averageOpponentSkill: avgOpponentSkill,
          averageRating: avgRating
        };
      } else {
        // Find specific week by ID
        weekToAnalyze = weeklyData.find(week => week.id === selectedWeek);
      }
      
      if (!weekToAnalyze || weekToAnalyze.games.length === 0) {
        setRadarData([]);
        return;
      }
      
      // Calculate metrics for radar chart
      const winRate = (weekToAnalyze.totalWins / weekToAnalyze.games.length) * 100;
      
      const avgGoalsPerGame = weekToAnalyze.totalGoals / weekToAnalyze.games.length;
      const goalScore = Math.min(100, avgGoalsPerGame * 25); // Scale to 100
      
      const avgConcededPerGame = weekToAnalyze.totalConceded / weekToAnalyze.games.length;
      const defenseScore = Math.max(0, 100 - (avgConcededPerGame * 25)); // Scale to 100
      
      const xgEfficiency = weekToAnalyze.totalExpectedGoals > 0 
        ? (weekToAnalyze.totalGoals / weekToAnalyze.totalExpectedGoals) * 100 
        : 50;
      
      const xgaEfficiency = weekToAnalyze.totalExpectedGoalsAgainst > 0 
        ? Math.max(0, 100 - ((weekToAnalyze.totalConceded / weekToAnalyze.totalExpectedGoalsAgainst) * 100)) 
        : 50;
      
      const opponentLevel = (weekToAnalyze.averageOpponentSkill / 10) * 100;
      
      // Get average player rating if available
      let playerRating = 0;
      if (weekToAnalyze.averageRating) {
        playerRating = (weekToAnalyze.averageRating / 10) * 100;
      } else {
        const allRatings = weekToAnalyze.games.flatMap(game => 
          game.playerStats.map(player => player.rating)
        );
        
        playerRating = allRatings.length > 0 
          ? (allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length / 10) * 100 
          : 0;
      }
      
      // Create radar data
      const data = [
        { metric: 'Attack', value: goalScore, fullMark: 100 },
        { metric: 'Defense', value: defenseScore, fullMark: 100 },
        { metric: 'Win Rate', value: winRate, fullMark: 100 },
        { metric: 'Finishing', value: xgEfficiency, fullMark: 100 },
        { metric: 'Defending', value: xgaEfficiency, fullMark: 100 },
        { metric: 'Opposition', value: opponentLevel, fullMark: 100 },
        { metric: 'Player Rating', value: playerRating, fullMark: 100 }
      ];
      
      setRadarData(data);
    };
    
    // Generate comparison data (all-time vs current)
    const generateComparisonData = () => {
      if (!currentWeek || currentWeek.games.length === 0 || weeklyData.length === 0) {
        setComparisonData([]);
        return;
      }
      
      // Calculate all-time averages
      const allGames = weeklyData.flatMap(week => week.games);
      
      if (allGames.length === 0) {
        setComparisonData([]);
        return;
      }
      
      const allTimeWinRate = (allGames.filter(game => game.result === 'win').length / allGames.length) * 100;
      
      const allTimeGoalsPerGame = allGames.reduce((sum, game) => {
        const [goals] = game.scoreLine.split('-').map(Number);
        return sum + goals;
      }, 0) / allGames.length;
      
      const allTimeGoalScore = Math.min(100, allTimeGoalsPerGame * 25);
      
      const allTimeConcededPerGame = allGames.reduce((sum, game) => {
        const [, conceded] = game.scoreLine.split('-').map(Number);
        return sum + conceded;
      }, 0) / allGames.length;
      
      const allTimeDefenseScore = Math.max(0, 100 - (allTimeConcededPerGame * 25));
      
      const allTimeXG = allGames.reduce((sum, game) => sum + (game.teamStats?.expectedGoals || 0), 0);
      const allTimeGoals = allGames.reduce((sum, game) => {
        const [goals] = game.scoreLine.split('-').map(Number);
        return sum + goals;
      }, 0);
      
      const allTimeXGEfficiency = allTimeXG > 0 
        ? (allTimeGoals / allTimeXG) * 100 
        : 50;
      
      const allTimeXGA = allGames.reduce((sum, game) => sum + (game.teamStats?.expectedGoalsAgainst || 0), 0);
      const allTimeConceded = allGames.reduce((sum, game) => {
        const [, conceded] = game.scoreLine.split('-').map(Number);
        return sum + conceded;
      }, 0);
      
      const allTimeXGAEfficiency = allTimeXGA > 0 
        ? Math.max(0, 100 - ((allTimeConceded / allTimeXGA) * 100)) 
        : 50;
      
      const allTimeOpponentLevel = (allGames.reduce((sum, game) => sum + game.opponentSkill, 0) / allGames.length / 10) * 100;
      
      const allTimeRatings = allGames.flatMap(game => 
        game.playerStats.map(player => player.rating)
      );
      
      const allTimePlayerRating = allTimeRatings.length > 0 
        ? (allTimeRatings.reduce((sum, rating) => sum + rating, 0) / allTimeRatings.length / 10) * 100 
        : 0;
      
      // Calculate current week metrics
      const currentWinRate = (currentWeek.totalWins / currentWeek.games.length) * 100;
      
      const currentGoalsPerGame = currentWeek.totalGoals / currentWeek.games.length;
      const currentGoalScore = Math.min(100, currentGoalsPerGame * 25);
      
      const currentConcededPerGame = currentWeek.totalConceded / currentWeek.games.length;
      const currentDefenseScore = Math.max(0, 100 - (currentConcededPerGame * 25));
      
      const currentXGEfficiency = currentWeek.totalExpectedGoals > 0 
        ? (currentWeek.totalGoals / currentWeek.totalExpectedGoals) * 100 
        : 50;
      
      const currentXGAEfficiency = currentWeek.totalExpectedGoalsAgainst > 0 
        ? Math.max(0, 100 - ((currentWeek.totalConceded / currentWeek.totalExpectedGoalsAgainst) * 100)) 
        : 50;
      
      const currentOpponentLevel = (currentWeek.averageOpponentSkill / 10) * 100;
      
      const currentRatings = currentWeek.games.flatMap(game => 
        game.playerStats.map(player => player.rating)
      );
      
      const currentPlayerRating = currentRatings.length > 0 
        ? (currentRatings.reduce((sum, rating) => sum + rating, 0) / currentRatings.length / 10) * 100 
        : 0;
      
      // Create comparison data
      const data = [
        { 
          metric: 'Attack', 
          current: currentGoalScore, 
          allTime: allTimeGoalScore,
          fullMark: 100 
        },
        { 
          metric: 'Defense', 
          current: currentDefenseScore, 
          allTime: allTimeDefenseScore,
          fullMark: 100 
        },
        { 
          metric: 'Win Rate', 
          current: currentWinRate, 
          allTime: allTimeWinRate,
          fullMark: 100 
        },
        { 
          metric: 'Finishing', 
          current: currentXGEfficiency, 
          allTime: allTimeXGEfficiency,
          fullMark: 100 
        },
        { 
          metric: 'Defending', 
          current: currentXGAEfficiency, 
          allTime: allTimeXGAEfficiency,
          fullMark: 100 
        },
        { 
          metric: 'Opposition', 
          current: currentOpponentLevel, 
          allTime: allTimeOpponentLevel,
          fullMark: 100 
        },
        { 
          metric: 'Player Rating', 
          current: currentPlayerRating, 
          allTime: allTimePlayerRating,
          fullMark: 100 
        }
      ];
      
      setComparisonData(data);
    };
    
    generateRadarData();
    generateComparisonData();
  }, [weeklyData, currentWeek, selectedWeek]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-fifa-purple" />
            Performance Radar
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400 ml-1" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-medium mb-1">Performance Metrics</p>
                  <ul className="text-xs space-y-1">
                    <li><strong>Attack:</strong> Goals scored per game (scaled)</li>
                    <li><strong>Defense:</strong> Inverse of goals conceded (higher is better)</li>
                    <li><strong>Win Rate:</strong> Percentage of games won</li>
                    <li><strong>Finishing:</strong> Goals scored vs Expected Goals</li>
                    <li><strong>Defending:</strong> Goals conceded vs Expected Goals Against</li>
                    <li><strong>Opposition:</strong> Average opponent skill level</li>
                    <li><strong>Player Rating:</strong> Average player rating</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Week</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
                {weeklyData
                  .filter(week => week.isCompleted && week.games.length > 0)
                  .map(week => (
                    <SelectItem key={week.id} value={week.id}>
                      {week.customName || `Week ${week.weekNumber}`}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            
            <Badge 
              variant={showComparison ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setShowComparison(!showComparison)}
            >
              Compare
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {radarData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%\" height="100%">
              <RadarChart cx="50%\" cy="50%\" outerRadius="80%\" data={showComparison ? comparisonData : radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                
                {showComparison ? (
                  <>
                    <Radar
                      name="Current"
                      dataKey="current"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="All Time"
                      dataKey="allTime"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.3}
                    />
                  </>
                ) : (
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                )}
                
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    border: '1px solid rgba(59, 130, 246, 0.3)', 
                    borderRadius: '12px' 
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80 bg-white/5 rounded-lg">
            <div className="text-center">
              <Activity className="h-16 w-16 mx-auto mb-4 text-gray-500 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
              <p className="text-gray-400 max-w-md">
                Play more games to see your performance radar. This visualization helps you identify strengths and areas for improvement.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceRadar;