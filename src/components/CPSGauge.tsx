import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeeklyPerformance, CPS_WEIGHTS } from '@/types/futChampions';
import { Activity, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface CPSGaugeProps {
  weekData: WeeklyPerformance;
  historicalData?: WeeklyPerformance[];
}

const CPSGauge = ({ weekData, historicalData = [] }: CPSGaugeProps) => {
  const [cpsScore, setCpsScore] = useState(0);
  const [cpsBreakdown, setCpsBreakdown] = useState<Record<string, number>>({});
  const [trendData, setTrendData] = useState<any[]>([]);
  const [gaugeRef, setGaugeRef] = useState<HTMLDivElement | null>(null);
  const [gaugeInstance, setGaugeInstance] = useState<any>(null);

  useEffect(() => {
    // Calculate CPS score
    const calculateCPS = () => {
      // Initialize score components
      const components: Record<string, number> = {
        goalsScored: 0,
        xgDifferential: 0,
        playerRating: 0,
        goalsConceded: 0,
        cards: 0,
        result: 0
      };
      
      // Calculate goals scored component (30%)
      const avgGoalsPerGame = weekData.games.length > 0 
        ? weekData.totalGoals / weekData.games.length 
        : 0;
      
      components.goalsScored = Math.min(100, avgGoalsPerGame * 25) * CPS_WEIGHTS.goalsScored;
      
      // Calculate xG differential component (25%)
      const xgDiff = weekData.totalExpectedGoals - weekData.totalExpectedGoalsAgainst;
      components.xgDifferential = Math.min(100, Math.max(0, 50 + xgDiff * 10)) * CPS_WEIGHTS.xgDifferential;
      
      // Calculate player rating component (20%)
      const allRatings = weekData.games.flatMap(game => 
        game.playerStats.map(player => player.rating)
      );
      
      const avgRating = allRatings.length > 0 
        ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
        : 0;
      
      components.playerRating = Math.min(100, (avgRating / 10) * 100) * CPS_WEIGHTS.playerRating;
      
      // Calculate goals conceded component (15%)
      const avgConcededPerGame = weekData.games.length > 0 
        ? weekData.totalConceded / weekData.games.length 
        : 0;
      
      components.goalsConceded = Math.min(100, Math.max(0, 100 - avgConcededPerGame * 25)) * CPS_WEIGHTS.goalsConceded;
      
      // Calculate cards component (10%)
      const totalYellowCards = weekData.games.reduce((sum, game) => 
        sum + game.playerStats.reduce((s, p) => s + p.yellowCards, 0), 0
      );
      
      const totalRedCards = weekData.games.reduce((sum, game) => 
        sum + game.playerStats.reduce((s, p) => s + p.redCards, 0), 0
      );
      
      const cardPenalty = (totalYellowCards * 5) + (totalRedCards * 15);
      components.cards = Math.min(100, Math.max(0, 100 - cardPenalty)) * CPS_WEIGHTS.cards;
      
      // Calculate result component (30%)
      const winRate = weekData.games.length > 0 
        ? (weekData.totalWins / weekData.games.length) * 100 
        : 0;
      
      components.result = winRate * CPS_WEIGHTS.result;
      
      // Calculate total CPS
      const totalCPS = Object.values(components).reduce((sum, value) => sum + value, 0);
      
      // Ensure CPS is between 1 and 100 with 1 decimal place
      const finalCPS = Math.max(1, Math.min(100, parseFloat(totalCPS.toFixed(1))));
      
      setCpsScore(finalCPS);
      setCpsBreakdown(components);
      
      // Update the week's CPS score
      weekData.cpsScore = finalCPS;
      
      return finalCPS;
    };
    
    // Calculate historical trend
    const calculateTrend = () => {
      if (!historicalData || historicalData.length === 0) return;
      
      const trendPoints = historicalData
        .filter(week => week.games.length > 0)
        .map(week => {
          // Calculate CPS for each historical week
          const avgGoalsPerGame = week.totalGoals / week.games.length;
          const goalsComponent = Math.min(100, avgGoalsPerGame * 25) * CPS_WEIGHTS.goalsScored;
          
          const xgDiff = week.totalExpectedGoals - week.totalExpectedGoalsAgainst;
          const xgComponent = Math.min(100, Math.max(0, 50 + xgDiff * 10)) * CPS_WEIGHTS.xgDifferential;
          
          const winRate = (week.totalWins / week.games.length) * 100;
          const resultComponent = winRate * CPS_WEIGHTS.result;
          
          // Simplified calculation for historical data
          const cps = Math.max(1, Math.min(100, parseFloat((goalsComponent + xgComponent + resultComponent).toFixed(1))));
          
          return {
            week: `W${week.weekNumber}`,
            cps,
            wins: week.totalWins
          };
        });
      
      // Add current week
      if (weekData.games.length > 0) {
        trendPoints.push({
          week: `W${weekData.weekNumber}`,
          cps: cpsScore,
          wins: weekData.totalWins
        });
      }
      
      setTrendData(trendPoints);
    };
    
    const score = calculateCPS();
    calculateTrend();
    
    // Initialize Gauge.js if available
    const initGauge = async () => {
      if (gaugeRef && typeof window !== 'undefined') {
        try {
          // Import Gauge.js dynamically with proper handling
          const GaugeModule = await import('gauge-js');
          const Gauge = (GaugeModule as any).default || GaugeModule;
          
          // Create gauge instance
          const gauge = new Gauge(gaugeRef).setOptions({
            angle: 0.15,
            lineWidth: 0.44,
            radiusScale: 1,
            pointer: {
              length: 0.6,
              strokeWidth: 0.035,
              color: '#000000'
            },
            limitMax: false,
            limitMin: false,
            colorStart: '#6FADCF',
            colorStop: getCpsColor(score),
            strokeColor: '#E0E0E0',
            generateGradient: true,
            highDpiSupport: true,
            staticZones: [
              {min: 0, max: 40, color: "#ef4444"},
              {min: 40, max: 60, color: "#f59e0b"},
              {min: 60, max: 80, color: "#f59e0b"},
              {min: 80, max: 100, color: "#10b981"}
            ],
            staticLabels: {
              font: "10px sans-serif",
              labels: [0, 20, 40, 60, 80, 100],
              color: "#ffffff",
              fractionDigits: 0
            },
          });
          
          // Set gauge value
          gauge.maxValue = 100;
          gauge.setMinValue(0);
          gauge.animationSpeed = 32;
          gauge.set(score);
          
          // Save gauge instance for cleanup
          setGaugeInstance(gauge);
        } catch (error) {
          console.error('Error initializing gauge:', error);
        }
      }
    };
    
    initGauge();
    
    // Cleanup function
    return () => {
      if (gaugeInstance) {
        // No explicit cleanup needed for Gauge.js
      }
    };
  }, [weekData, historicalData, gaugeRef]);

  const getCpsColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="h-5 w-5 text-fifa-blue" />
          Champs Performance Score (CPS)
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-1">CPS Formula</p>
                <ul className="text-xs space-y-1">
                  <li>Goals Scored: 30% weight</li>
                  <li>xG Differential: 25% weight</li>
                  <li>Player Ratings: 20% weight</li>
                  <li>Goals Conceded: 15% weight</li>
                  <li>Card Discipline: 10% weight</li>
                  <li>Win/Loss: 30% weight</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CPS Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-[200px] h-[200px]">
              {/* Gauge.js canvas */}
              <canvas 
                ref={setGaugeRef}
                className="w-full h-full"
              />
              
              {/* Center value */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-3xl font-bold" style={{ color: getCpsColor(cpsScore) }}>{cpsScore.toFixed(1)}</div>
                <div className="text-sm text-gray-400">CPS</div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2 w-full max-w-xs">
              {Object.entries(cpsBreakdown).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {key === 'goalsScored' ? 'Goals Scored' :
                     key === 'xgDifferential' ? 'xG Differential' :
                     key === 'playerRating' ? 'Player Ratings' :
                     key === 'goalsConceded' ? 'Goals Conceded' :
                     key === 'cards' ? 'Card Discipline' :
                     key === 'result' ? 'Win/Loss' : key}
                  </div>
                  <Badge 
                    className="bg-white/10 text-white"
                    style={{ borderLeft: `3px solid ${getCpsColor(cpsScore)}` }}
                  >
                    +{Math.round(value)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          
          {/* CPS Trend Chart */}
          <div>
            <h4 className="text-white font-medium mb-3">CPS Trend</h4>
            {trendData.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                      border: '1px solid rgba(59, 130, 246, 0.3)', 
                      borderRadius: '12px' 
                    }} 
                  />
                  <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" />
                  <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" />
                  <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="cps" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#3b82f6' }}
                    activeDot={{ r: 6, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] bg-white/5 rounded-lg">
                <p className="text-gray-400">Not enough data for trend analysis</p>
              </div>
            )}
            
            <div className="mt-4">
              <h4 className="text-white font-medium mb-2">Performance Insights</h4>
              <div className="p-3 rounded-lg bg-white/5">
                {cpsScore >= 80 ? (
                  <p className="text-green-400 text-sm">
                    Elite performance! Your CPS of {cpsScore.toFixed(1)} puts you in the top tier of players.
                  </p>
                ) : cpsScore >= 60 ? (
                  <p className="text-yellow-400 text-sm">
                    Solid performance with a CPS of {cpsScore.toFixed(1)}. Focus on improving your {
                      Object.entries(cpsBreakdown)
                        .sort(([, a], [, b]) => a - b)[0][0] === 'goalsScored' ? 'goal scoring' :
                        Object.entries(cpsBreakdown)
                          .sort(([, a], [, b]) => a - b)[0][0] === 'xgDifferential' ? 'chance creation' :
                        Object.entries(cpsBreakdown)
                          .sort(([, a], [, b]) => a - b)[0][0] === 'playerRating' ? 'player performances' :
                        Object.entries(cpsBreakdown)
                          .sort(([, a], [, b]) => a - b)[0][0] === 'goalsConceded' ? 'defensive stability' :
                        Object.entries(cpsBreakdown)
                          .sort(([, a], [, b]) => a - b)[0][0] === 'cards' ? 'discipline' : 'win rate'
                    } to reach elite status.
                  </p>
                ) : (
                  <p className="text-red-400 text-sm">
                    Your CPS of {cpsScore.toFixed(1)} indicates room for improvement. Focus on increasing your win rate and goal scoring efficiency.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CPSGauge;