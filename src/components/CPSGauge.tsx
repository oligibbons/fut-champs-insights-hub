import React, { useMemo } from 'react';
import { GameResult } from '@/types/futChampions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CPSGaugeProps {
  games: GameResult[];
  size?: number;
}

const CPSGauge: React.FC<CPSGaugeProps> = ({ games, size = 150 }) => {
  const scoreDetails = useMemo(() => {
    if (games.length === 0) return { finalScore: 0, winRate: 0, attackScore: 0, defenseScore: 0, qualityScore: 0 };

    const totalGames = games.length;

    // --- 1. Win Rate & Dominance (Max 45 points) ---
    const wins = games.filter(g => g.result === 'win').length;
    const rageQuitsForced = games.filter(g => g.result === 'win' && g.duration < 45).length;
    const rageQuitsByUser = games.filter(g => g.result === 'loss' && g.duration < 45).length;
    const adjustedWinRate = ((wins + rageQuitsForced * 0.5 - rageQuitsByUser * 0.5) / totalGames);
    const winRateComponent = Math.max(0, adjustedWinRate) * 45;

    // --- 2. Attacking Performance (Max 25 points) ---
    const totalGoalsFor = games.reduce((sum, g) => sum + (g.teamStats?.actualGoals || 0), 0);
    const totalXGFor = games.reduce((sum, g) => sum + (g.teamStats?.expectedGoals || 0), 0);
    const goalsPerGame = totalGoalsFor / totalGames;
    const gpgScore = Math.min(goalsPerGame / 4.5, 1) * 15;
    const goalEfficiency = Math.max(0, Math.min((totalGoalsFor - totalXGFor) / totalGames, 2) / 2) * 10;
    const attackComponent = gpgScore + goalEfficiency;

    // --- 3. Defensive Solidity (Max 25 points) ---
    const totalGoalsAgainst = games.reduce((sum, g) => sum + (g.teamStats?.actualGoalsAgainst || 0), 0);
    const totalXGAgainst = games.reduce((sum, g) => sum + (g.teamStats?.expectedGoalsAgainst || 0), 0);
    const goalsAgainstPerGame = totalGoalsAgainst / totalGames;
    const gagScore = Math.max(0, 1 - (goalsAgainstPerGame / 3.0)) * 15;
    const defenseEfficiency = Math.max(0, Math.min((totalXGAgainst - totalGoalsAgainst) / totalGames, 2) / 2) * 10;
    const defenseComponent = gagScore + defenseEfficiency;

    // --- 4. Quality & Composure (Max 5 points) ---
    const avgOpponentSkill = games.reduce((sum, g) => sum + g.opponentSkill, 0) / totalGames;
    const opponentQualityScore = (avgOpponentSkill / 10) * 3;
    const avgStress = games.reduce((sum, g) => sum + (g.stressLevel || 5), 0) / totalGames;
    const composureScore = Math.max(0, 1 - (avgStress / 10)) * 2;
    const qualityComponent = opponentQualityScore + composureScore;

    // --- Final Calculation ---
    const rawScore = winRateComponent + attackComponent + defenseComponent + qualityComponent;
    const finalScore = Math.min(100, Math.round(103 * Math.pow(rawScore / 100, 1.2)));

    return {
      finalScore,
      winRate: (wins / totalGames) * 100,
      attackScore: attackComponent,
      defenseScore: defenseComponent,
      qualityScore: qualityComponent,
    };
  }, [games]);

  const { finalScore } = scoreDetails;
  const circumference = 2 * Math.PI * (size * 0.4);
  const strokeDashoffset = circumference - (finalScore / 100) * circumference;

  const getStrokeColor = (s: number) => {
    if (s > 90) return 'hsl(var(--primary))';
    if (s > 75) return 'hsl(190, 80%, 50%)';
    if (s > 50) return 'hsl(48, 90%, 50%)';
    return 'hsl(var(--destructive))';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex items-center justify-center cursor-pointer" style={{ width: size, height: size }}>
            <svg className="absolute inset-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <circle cx={size / 2} cy={size / 2} r={size * 0.4} stroke="hsl(var(--border))" strokeWidth="8" fill="transparent" />
              <circle
                cx={size / 2} cy={size / 2} r={size * 0.4} stroke={getStrokeColor(finalScore)} strokeWidth="8"
                fill="transparent" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </svg>
            <div className="text-center">
              <div className="text-3xl font-bold">{finalScore}</div>
              <div className="text-xs text-muted-foreground -mt-1">CPS</div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-bold">Champs Performance Score (CPS)</p>
          <p className="text-muted-foreground text-xs mt-1">A holistic rating of your performance from 1-100.</p>
          <div className="mt-2 text-xs space-y-1">
            <p>Win Rate: {scoreDetails.winRate.toFixed(1)}%</p>
            <p>Attack Score: {scoreDetails.attackScore.toFixed(1)} / 25</p>
            <p>Defense Score: {scoreDetails.defenseScore.toFixed(1)} / 25</p>
            <p>Quality/Composure: {scoreDetails.qualityScore.toFixed(1)} / 5</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CPSGauge;
