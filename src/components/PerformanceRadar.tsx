import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// --- FIX: Use useAccountData ---
import { useAccountData } from '@/hooks/useAccountData';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// --- FIX: Import Skeleton ---
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme'; // Assuming you have useTheme hook

const PerformanceRadar = () => {
  // --- FIX: Use useAccountData and add loading ---
  const { weeklyData = [], currentWeek, loading } = useAccountData() || {};
  const { currentTheme } = useTheme(); // Use theme hook

  const [selectedWeek, setSelectedWeek] = useState<string>('current');
  const [radarData, setRadarData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  // --- FIX: isLoading is now derived from useAccountData's loading ---
  // const [isLoading, setIsLoading] = useState(true); 
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile (remains the same)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // No need for setIsLoading(true) here anymore
    
    const generateRadarData = () => {
      let weekToAnalyze;
      
      if (selectedWeek === 'current') {
        weekToAnalyze = currentWeek;
      } else if (selectedWeek === 'all-time') {
        const allGames = weeklyData.flatMap(week => week.games);
        if (allGames.length === 0) {
          setRadarData([]); return; 
        }
        
        const totalWins = allGames.filter(game => game.result === 'win').length;
        const totalGoals = allGames.reduce((sum, game) => sum + (parseInt(game.scoreLine.split('-')[0]) || 0), 0);
        const totalConceded = allGames.reduce((sum, game) => sum + (parseInt(game.scoreLine.split('-')[1]) || 0), 0);
        const totalXG = allGames.reduce((sum, game) => sum + (game.teamStats?.expectedGoals || 0), 0);
        const totalXGA = allGames.reduce((sum, game) => sum + (game.teamStats?.expectedGoalsAgainst || 0), 0);
        const avgOpponentSkill = allGames.reduce((sum, game) => sum + game.opponentSkill, 0) / allGames.length;
        const allRatings = allGames.flatMap(game => game.playerStats?.map(p => p.rating) || []);
        const avgRating = allRatings.length > 0 ? allRatings.reduce((s, r) => s + r, 0) / allRatings.length : 0;
        
        weekToAnalyze = { games: allGames, totalWins, totalGoals, totalConceded, totalExpectedGoals: totalXG, totalExpectedGoalsAgainst: totalXGA, averageOpponentSkill: avgOpponentSkill, averageRating: avgRating };
      } else {
        weekToAnalyze = weeklyData.find(week => week.weekId === selectedWeek); // Use weekId for matching
      }
      
      if (!weekToAnalyze || !weekToAnalyze.games || weekToAnalyze.games.length === 0) {
        setRadarData([]); return;
      }
      
      const numGames = weekToAnalyze.games.length;
      const winRate = (weekToAnalyze.totalWins / numGames) * 100;
      const avgGoalsPerGame = weekToAnalyze.totalGoals / numGames;
      const goalScore = Math.min(100, avgGoalsPerGame * 25);
      const avgConcededPerGame = weekToAnalyze.totalConceded / numGames;
      const defenseScore = Math.max(0, 100 - (avgConcededPerGame * 25));
      const xgEfficiency = weekToAnalyze.totalExpectedGoals > 0 ? (weekToAnalyze.totalGoals / weekToAnalyze.totalExpectedGoals) * 50 + 50 : 50; // Scaled 50-150 range mapped to 0-100? More complex scaling might be better. Let's simplify for now.
      const simpleXGEfficiency = weekToAnalyze.totalExpectedGoals > 0 ? Math.min(100, (weekToAnalyze.totalGoals / weekToAnalyze.totalExpectedGoals) * 100) : 50;
      const xgaEfficiency = weekToAnalyze.totalExpectedGoalsAgainst > 0 ? Math.max(0, 100 - ((weekToAnalyze.totalConceded / weekToAnalyze.totalExpectedGoalsAgainst) * 50)) : 50; // Scaled similarly, inverted.
      const simpleXGAEfficiency = weekToAnalyze.totalExpectedGoalsAgainst > 0 ? Math.max(0, 100 - ((weekToAnalyze.totalConceded / weekToAnalyze.totalExpectedGoalsAgainst) * 100)) : 50;
      const opponentLevel = (weekToAnalyze.averageOpponentSkill / 10) * 100;

      let playerRating = 0;
      if (weekToAnalyze.averageRating) {
          playerRating = (weekToAnalyze.averageRating / 10) * 100;
      } else {
          // Fallback if averageRating isn't pre-calculated for the 'all-time' object
          const allRatings = weekToAnalyze.games.flatMap(game => game.playerStats?.map(p => p.rating) || []);
          playerRating = allRatings.length > 0 ? (allRatings.reduce((s, r) => s + r, 0) / allRatings.length / 10) * 100 : 0;
      }
      
      const data = [
        { metric: 'Attack', value: goalScore, fullMark: 100 },
        { metric: 'Defense', value: defenseScore, fullMark: 100 },
        { metric: 'Win Rate', value: winRate, fullMark: 100 },
        { metric: 'Finishing', value: simpleXGEfficiency, fullMark: 100 }, // Using simplified
        { metric: 'Defending', value: simpleXGAEfficiency, fullMark: 100 }, // Using simplified
        { metric: 'Opposition', value: opponentLevel, fullMark: 100 },
        { metric: 'Player Rating', value: playerRating, fullMark: 100 }
      ];
      
      setRadarData(data);
      // No need for setIsLoading(false) here anymore
    };
    
    // Comparison data generation remains similar, just ensure it uses guarded data
    const generateComparisonData = () => {
        if (!currentWeek || !currentWeek.games || currentWeek.games.length === 0 || weeklyData.length === 0) {
            setComparisonData([]); return;
        }
        const allGames = weeklyData.flatMap(week => week.games);
        if (allGames.length === 0) {
            setComparisonData([]); return;
        }

        // Calculate all-time metrics (simplified versions used)
        const allTimeWins = allGames.filter(game => game.result === 'win').length;
        const allTimeTotalGoals = allGames.reduce((sum, game) => sum + (parseInt(game.scoreLine.split('-')[0]) || 0), 0);
        const allTimeTotalConceded = allGames.reduce((sum, game) => sum + (parseInt(game.scoreLine.split('-')[1]) || 0), 0);
        const allTimeTotalXG = allGames.reduce((sum, game) => sum + (game.teamStats?.expectedGoals || 0), 0);
        const allTimeTotalXGA = allGames.reduce((sum, game) => sum + (game.teamStats?.expectedGoalsAgainst || 0), 0);
        const allTimeAvgOpponentSkill = allGames.reduce((sum, game) => sum + game.opponentSkill, 0) / allGames.length;
        const allTimeRatings = allGames.flatMap(game => game.playerStats?.map(p => p.rating) || []);
        const allTimeAvgRating = allTimeRatings.length > 0 ? allTimeRatings.reduce((s, r) => s + r, 0) / allTimeRatings.length : 0;

        const allTimeWinRate = (allTimeWins / allGames.length) * 100;
        const allTimeGoalScore = Math.min(100, (allTimeTotalGoals / allGames.length) * 25);
        const allTimeDefenseScore = Math.max(0, 100 - ((allTimeTotalConceded / allGames.length) * 25));
        const allTimeXGEfficiency = allTimeTotalXG > 0 ? Math.min(100, (allTimeTotalGoals / allTimeTotalXG) * 100) : 50;
        const allTimeXGAEfficiency = allTimeTotalXGA > 0 ? Math.max(0, 100 - ((allTimeTotalConceded / allTimeTotalXGA) * 100)) : 50;
        const allTimeOpponentLevel = (allTimeAvgOpponentSkill / 10) * 100;
        const allTimePlayerRating = (allTimeAvgRating / 10) * 100;

        // Calculate current week metrics (simplified versions used)
        const currentNumGames = currentWeek.games.length;
        const currentWinRate = (currentWeek.totalWins / currentNumGames) * 100;
        const currentGoalScore = Math.min(100, (currentWeek.totalGoals / currentNumGames) * 25);
        const currentDefenseScore = Math.max(0, 100 - ((currentWeek.totalConceded / currentNumGames) * 25));
        const currentXGEfficiency = currentWeek.totalExpectedGoals > 0 ? Math.min(100, (currentWeek.totalGoals / currentWeek.totalExpectedGoals) * 100) : 50;
        const currentXGAEfficiency = currentWeek.totalExpectedGoalsAgainst > 0 ? Math.max(0, 100 - ((currentWeek.totalConceded / currentWeek.totalExpectedGoalsAgainst) * 100)) : 50;
        const currentOpponentLevel = (currentWeek.averageOpponentSkill / 10) * 100;
        const currentRatings = currentWeek.games.flatMap(game => game.playerStats?.map(p => p.rating) || []);
        const currentAvgRating = currentRatings.length > 0 ? currentRatings.reduce((s, r) => s + r, 0) / currentRatings.length : 0;
        const currentPlayerRating = (currentAvgRating / 10) * 100;
      
        const data = [
            { metric: 'Attack', current: currentGoalScore, allTime: allTimeGoalScore, fullMark: 100 },
            { metric: 'Defense', current: currentDefenseScore, allTime: allTimeDefenseScore, fullMark: 100 },
            { metric: 'Win Rate', current: currentWinRate, allTime: allTimeWinRate, fullMark: 100 },
            { metric: 'Finishing', current: currentXGEfficiency, allTime: allTimeXGEfficiency, fullMark: 100 },
            { metric: 'Defending', current: currentXGAEfficiency, allTime: allTimeXGAEfficiency, fullMark: 100 },
            { metric: 'Opposition', current: currentOpponentLevel, allTime: allTimeOpponentLevel, fullMark: 100 },
            { metric: 'Player Rating', current: currentPlayerRating, allTime: allTimePlayerRating, fullMark: 100 }
        ];
        setComparisonData(data);
    };
    
    // Only run calculations if data is loaded
    if (!loading) {
        generateRadarData();
        generateComparisonData();
    }
  }, [weeklyData, currentWeek, selectedWeek, loading]); // Add loading dependency

  // --- FIX: Use loading state for skeleton ---
  if (loading) {
    return (
      <Card 
        className="glass-card h-[450px]" // Approx height of the final component
        style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <Skeleton className="h-full w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
        className="glass-card"
        style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}
    >
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-fifa-purple" />
            Performance Radar
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400 ml-1 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {/* Tooltip content remains the same */}
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
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger 
                className="flex-1 sm:w-40"
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Week</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
                {weeklyData
                  .filter(week => week.isCompleted && week.games?.length > 0)
                  .sort((a,b) => b.weekNumber - a.weekNumber) // Sort recent first
                  .map(week => (
                    <SelectItem key={week.weekId} value={week.weekId}>
                      {week.customName || `Week ${week.weekNumber}`}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            
            {/* Disable compare if current week or all-time isn't ready */}
            <Badge 
              variant={showComparison ? "default" : "outline"}
              className={`cursor-pointer ${(!currentWeek || currentWeek.games.length === 0 || weeklyData.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                  if (currentWeek && currentWeek.games.length > 0 && weeklyData.length > 0) {
                      setShowComparison(!showComparison)
                  }
              }}
              style={{
                  borderColor: currentTheme.colors.border,
                  color: showComparison ? currentTheme.colors.accentText : currentTheme.colors.text,
                  backgroundColor: showComparison ? currentTheme.colors.accent : 'transparent'
              }}
            >
              Compare
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Loading state handled above */}
        {radarData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "60%" : "75%"} data={showComparison ? comparisonData : radarData}>
                <PolarGrid stroke={currentTheme.colors.border} />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ 
                    fill: currentTheme.colors.muted, 
                    fontSize: isMobile ? 9 : 12,
                  }} 
                  tickLine={false}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ 
                    fill: currentTheme.colors.muted, 
                    fontSize: isMobile ? 8 : 10 
                  }}
                  tickCount={isMobile ? 3 : 5}
                />
                
                {showComparison ? (
                  <>
                    <Radar
                      name="Current"
                      dataKey="current"
                      stroke={currentTheme.colors.primary}
                      fill={currentTheme.colors.primary}
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="All Time"
                      dataKey="allTime"
                      stroke={currentTheme.colors.accent}
                      fill={currentTheme.colors.accent}
                      fillOpacity={0.4}
                    />
                    <Legend 
                      iconSize={isMobile ? 8 : 10}
                      wrapperStyle={{ fontSize: isMobile ? 10 : 12, paddingTop: isMobile ? '10px' : '0' }}
                    />
                  </>
                ) : (
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke={currentTheme.colors.primary}
                    fill={currentTheme.colors.primary}
                    fillOpacity={0.6}
                  />
                )}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div 
            className="flex items-center justify-center h-80 rounded-lg"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <div className="text-center">
              <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: currentTheme.colors.muted }} />
              <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
              <p className="max-w-md" style={{ color: currentTheme.colors.muted }}>
                Play more games to see your performance radar.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceRadar;
