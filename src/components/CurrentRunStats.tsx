// src/components/CurrentRunStats.tsx
import { useMemo } from 'react';
import { Game } from '@/types/futChampions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Target, Shield, Percent, Bot } from 'lucide-react'; // Added Bot for Dribble Success
import { useTheme } from '@/hooks/useTheme';

interface CurrentRunStatsProps {
  games: Game[];
}

const CurrentRunStats = ({ games }: CurrentRunStatsProps) => {
  const { currentTheme } = useTheme();

  const stats = useMemo(() => {
    if (!games || games.length === 0) {
      return {
        wins: 0, losses: 0, winRate: 0,
        goalsFor: 0, goalsAgainst: 0, goalDiff: 0,
        avgGF: 0, avgGA: 0,
        avgOpponentSkill: 0, avgStress: 0, avgServerQuality: 0,
        totalXG: 0, totalXGA: 0, avgXG: 0, avgXGA: 0, xGDiff: 0,
        avgPossession: 0, avgPassAccuracy: 0, avgDribbleSuccess: 0, // Added avgDribbleSuccess
        rageQuits: 0, disconnects: 0,
      };
    }

    let wins = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    let opponentSkillSum = 0;
    let stressSum = 0;
    let serverQualitySum = 0;
    let xgSum = 0;
    let xgaSum = 0;
    let possessionSum = 0;
    let passAccuracySum = 0;
    let dribbleSuccessSum = 0; // Added
    let gamesWithStats = 0;
    let gamesWithDribbleStats = 0; // Added
    let rageQuits = 0;
    let disconnects = 0;

    games.forEach(game => {
      if (game.result === 'win') wins++;
      goalsFor += game.user_goals || 0;
      goalsAgainst += game.opponent_goals || 0;
      opponentSkillSum += game.opponent_skill || 5; // Default to 5 if missing
      stressSum += game.stress_level || 5; // Default to 5
      serverQualitySum += game.server_quality || 5; // Default to 5

      if (game.team_stats) {
        gamesWithStats++;
        xgSum += game.team_stats.expected_goals || 0;
        xgaSum += game.team_stats.expected_goals_against || 0;
        possessionSum += game.team_stats.possession || 50; // Default to 50
        passAccuracySum += game.team_stats.pass_accuracy || 75; // Default to 75
        // Added Dribble Success aggregation
        if (game.team_stats.dribble_success_rate !== null && game.team_stats.dribble_success_rate !== undefined) {
          dribbleSuccessSum += game.team_stats.dribble_success_rate;
          gamesWithDribbleStats++;
        }
      }

      if (game.game_context === 'rage_quit') rageQuits++;
      if (game.game_context === 'disconnect') disconnects++;
    });

    const losses = games.length - wins;
    const winRate = games.length > 0 ? (wins / games.length) * 100 : 0;
    const goalDiff = goalsFor - goalsAgainst;
    const avgGF = games.length > 0 ? goalsFor / games.length : 0;
    const avgGA = games.length > 0 ? goalsAgainst / games.length : 0;
    const avgOpponentSkill = games.length > 0 ? opponentSkillSum / games.length : 0;
    const avgStress = games.length > 0 ? stressSum / games.length : 0;
    const avgServerQuality = games.length > 0 ? serverQualitySum / games.length : 0;
    const avgXG = gamesWithStats > 0 ? xgSum / gamesWithStats : 0;
    const avgXGA = gamesWithStats > 0 ? xgaSum / gamesWithStats : 0;
    const xGDiff = xgSum - xgaSum; // Total difference
    const avgPossession = gamesWithStats > 0 ? possessionSum / gamesWithStats : 0;
    const avgPassAccuracy = gamesWithStats > 0 ? passAccuracySum / gamesWithStats : 0;
    const avgDribbleSuccess = gamesWithDribbleStats > 0 ? dribbleSuccessSum / gamesWithDribbleStats : 0; // Added calculation


    return {
      wins, losses, winRate,
      goalsFor, goalsAgainst, goalDiff,
      avgGF, avgGA,
      avgOpponentSkill, avgStress, avgServerQuality,
      totalXG: xgSum, totalXGA: xgaSum, avgXG, avgXGA, xGDiff,
      avgPossession, avgPassAccuracy, avgDribbleSuccess, // Added
      rageQuits, disconnects,
    };
  }, [games]);

  const statItems = [
    { label: "Win Rate", value: `${stats.winRate.toFixed(0)}%`, Icon: TrendingUp, color: currentTheme.colors.win },
    { label: "Wins", value: stats.wins, Icon: TrendingUp, color: currentTheme.colors.win },
    { label: "Losses", value: stats.losses, Icon: TrendingDown, color: currentTheme.colors.loss },
    { label: "Goals For", value: stats.goalsFor, Icon: Target, color: currentTheme.colors.foreground },
    { label: "Goals Against", value: stats.goalsAgainst, Icon: Shield, color: currentTheme.colors.foreground },
    { label: "Goal Diff", value: stats.goalDiff, Icon: TrendingUp, color: stats.goalDiff >= 0 ? currentTheme.colors.win : currentTheme.colors.loss },
    { label: "Avg Poss.", value: `${stats.avgPossession.toFixed(0)}%`, Icon: Percent, color: currentTheme.colors.foreground },
    { label: "Avg Pass Acc.", value: `${stats.avgPassAccuracy.toFixed(0)}%`, Icon: Percent, color: currentTheme.colors.foreground },
    { label: "Avg Dribble %", value: stats.avgDribbleSuccess !== undefined ? `${stats.avgDribbleSuccess.toFixed(0)}%` : 'N/A', Icon: Bot, color: currentTheme.colors.foreground }, // Added display
    { label: "Avg Opponent", value: stats.avgOpponentSkill.toFixed(1), Icon: Users, color: currentTheme.colors.foreground },
    { label: "Avg xG", value: stats.avgXG.toFixed(1), Icon: TrendingUp, color: currentTheme.colors.foreground },
    { label: "Avg xGA", value: stats.avgXGA.toFixed(1), Icon: TrendingDown, color: currentTheme.colors.foreground },
  ];

  return (
    <div>
       <h3 className="text-lg font-semibold mb-4 text-white">Current Run Stats ({games.length} Games)</h3>
       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {statItems.map(({ label, value, Icon, color }) => (
                <div key={label} className="bg-background/20 rounded-lg p-3 text-center transition-colors hover:bg-background/40">
                    <Icon className="h-5 w-5 mx-auto mb-1.5" style={{ color: color }}/>
                    <p className="text-sm font-semibold text-white truncate">{value}</p>
                    <p className="text-xs text-muted-foreground truncate">{label}</p>
                </div>
            ))}
        </div>
    </div>
  );
};

export default CurrentRunStats;
