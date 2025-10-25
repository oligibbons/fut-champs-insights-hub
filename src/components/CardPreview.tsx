import React, { useMemo } from 'react';
import { CardOptions } from './ShareableCardGenerator';
import { WeeklyPerformance, PlayerPerformance, Game } from '@/types/futChampions'; //
import { useTheme } from '@/hooks/useTheme'; //
import logo from '/fut-trackr-logo.jpg'; //
import { Trophy, ArrowUp, ArrowDown, Target, Percent, TrendingUp, TrendingDown, Users, Shield, Footprints, Clock, Wifi, HeartPulse, ListChecks, Goal, Star, Skull, GitFork } from 'lucide-react'; // Added more icons
import { calculateCPS } from '@/utils/gameRating'; // Assuming you have this util
import { cn } from '@/lib/utils'; //

// --- Helper Types ---
interface CalculatedStats {
  // General
  title?: string;
  record?: string; // "W-L"
  winRate?: number; // 0-100
  goalsScored?: number;
  goalsConceded?: number;
  goalDifference?: number;
  gamesPlayed?: number;
  avgServerQuality?: number; // 1-10
  avgStressLevel?: number; // 1-10

  // Team Stats (Averages)
  avgPossession?: number; // 0-100
  passAccuracy?: number; // 0-100
  shotAccuracy?: number; // 0-100
  dribbleAccuracy?: number; // 0-100
  xgFor?: number;
  xgAgainst?: number;
  xgDifferential?: number;
  passesPer90?: number;
  goalsPer90?: number;

  // Player Stats
  highestRatedPlayer?: { name: string; rating: number };
  averagePlayerRating?: number;
  highestScorer?: { name: string; goals: number };
  highestAssister?: { name: string; assists: number };
  cleanSheets?: number; // Overall only
  clubLegends?: { name: string; appearances: number }[]; // Overall only

  // Streaks & Records
  winStreak?: number;
  lossStreak?: number; // Overall only
  bestRecord?: string; // Overall only "W-L"
  worstRecord?: string; // Overall only "W-L"

  // Analysis
  cpsScore?: number; // Run only
  rageQuits?: number;
  formationsUsed?: string[]; // Top 3?
  favouriteFormation?: string; // Overall only
  matchTags?: { tag: string; count: number }[]; // Top 3?

  // Overall Profile Only
  totalRuns?: number;
  averageWins?: number;
  totalPlayersUsed?: number;
  totalFormationsUsed?: number;
}

// --- Calculation Logic ---
const calculateAllStats = (runData?: WeeklyPerformance | null, allRunsData?: WeeklyPerformance[] | null, cardType?: 'run' | 'overall'): CalculatedStats => {
    const stats: CalculatedStats = {};

    if (cardType === 'run' && runData) {
        const games = runData.games?.filter(g => g) ?? []; // Filter null games
        stats.gamesPlayed = games.length;
        stats.title = runData.custom_name || `Week ${runData.week_number}`;
        stats.winStreak = runData.best_streak ?? 0;

        if (stats.gamesPlayed > 0) {
            stats.wins = runData.total_wins ?? games.filter(g => g.result === 'win').length;
            stats.losses = stats.gamesPlayed - stats.wins;
            stats.record = `${stats.wins}-${stats.losses}`;
            stats.winRate = (stats.wins / stats.gamesPlayed) * 100;
            stats.goalsScored = runData.total_goals ?? games.reduce((sum, g) => sum + (g.user_goals ?? 0), 0);
            stats.goalsConceded = runData.total_conceded ?? games.reduce((sum, g) => sum + (g.opponent_goals ?? 0), 0);
            stats.goalDifference = stats.goalsScored - stats.goalsConceded;
            stats.cpsScore = calculateCPS(games); // Calculate CPS for the run

            // Averages from games
            let serverSum = 0, stressSum = 0, rqSum = 0;
            let possessionSum = 0, passAccSum = 0, shotSum = 0, shotOnTargetSum = 0, dribbleSum = 0;
            let xgForSum = 0, xgAgainstSum = 0, passesSum = 0, gameDurationSum = 0;
            let gamesWithStats = 0, gamesWithDribble = 0;
            const playerTotals: Record<string, { goals: number, assists: number, ratingSum: number, count: number, name: string }> = {};
            const tagCounts: Record<string, number> = {};
            const formationCounts: Record<string, number> = {}; // Assuming squad indicates formation? Needs logic

            games.forEach(g => {
                serverSum += g.server_quality ?? 5;
                stressSum += g.stress_level ?? 5;
                if (g.game_context === 'rage_quit' || g.game_context === 'rage_quit_own') rqSum++;
                gameDurationSum += g.duration ?? 90;

                (g.tags ?? []).forEach(tag => tagCounts[tag] = (tagCounts[tag] || 0) + 1);
                // TODO: Extract formation from squad_used if possible

                if (g.team_stats) {
                    gamesWithStats++;
                    possessionSum += g.team_stats.possession ?? 50;
                    passAccSum += g.team_stats.pass_accuracy ?? 75;
                    shotSum += g.team_stats.shots ?? 0;
                    shotOnTargetSum += g.team_stats.shots_on_target ?? 0;
                    xgForSum += g.team_stats.expected_goals ?? 0;
                    xgAgainstSum += g.team_stats.expected_goals_against ?? 0;
                    passesSum += g.team_stats.passes ?? 0;
                    if (g.team_stats.dribble_success_rate != null) {
                        dribbleSum += g.team_stats.dribble_success_rate;
                        gamesWithDribble++;
                    }
                }

                (g.player_performances ?? []).forEach(p => {
                    if (!p) return;
                    const id = p.player_id || p.player_name; // Use ID preferably
                    if (!playerTotals[id]) playerTotals[id] = { goals: 0, assists: 0, ratingSum: 0, count: 0, name: p.player_name };
                    playerTotals[id].goals += p.goals ?? 0;
                    playerTotals[id].assists += p.assists ?? 0;
                    playerTotals[id].ratingSum += p.rating ?? 0;
                    playerTotals[id].count++;
                });
            });

            stats.avgServerQuality = serverSum / stats.gamesPlayed;
            stats.avgStressLevel = stressSum / stats.gamesPlayed;
            stats.rageQuits = rqSum;

            if (gamesWithStats > 0) {
                stats.avgPossession = possessionSum / gamesWithStats;
                stats.passAccuracy = passAccSum / gamesWithStats;
                stats.shotAccuracy = shotSum > 0 ? (shotOnTargetSum / shotSum) * 100 : 0;
                stats.xgFor = xgForSum / gamesWithStats;
                stats.xgAgainst = xgAgainstSum / gamesWithStats;
                stats.xgDifferential = stats.xgFor - stats.xgAgainst;
                const totalMinutesApproximation = gameDurationSum; // Simple sum, could refine
                stats.passesPer90 = totalMinutesApproximation > 0 ? (passesSum / totalMinutesApproximation) * 90 : 0;
                stats.goalsPer90 = totalMinutesApproximation > 0 ? (stats.goalsScored / totalMinutesApproximation) * 90 : 0;
            }
             if (gamesWithDribble > 0) {
                 stats.dribbleAccuracy = dribbleSum / gamesWithDribble;
             }

            // Player Stats for Run
            const playersArray = Object.values(playerTotals);
            if (playersArray.length > 0) {
                playersArray.sort((a, b) => (b.ratingSum / b.count) - (a.ratingSum / a.count)); // Sort by avg rating
                stats.highestRatedPlayer = { name: playersArray[0].name, rating: playersArray[0].ratingSum / playersArray[0].count };
                stats.averagePlayerRating = playersArray.reduce((sum, p) => sum + p.ratingSum, 0) / playersArray.reduce((sum, p) => sum + p.count, 0);

                playersArray.sort((a, b) => b.goals - a.goals); // Sort by goals
                stats.highestScorer = { name: playersArray[0].name, goals: playersArray[0].goals };

                playersArray.sort((a, b) => b.assists - a.assists); // Sort by assists
                stats.highestAssister = { name: playersArray[0].name, assists: playersArray[0].assists };
            }

            stats.matchTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tag, count]) => ({ tag, count }));
            // stats.formationsUsed = Object.entries(formationCounts).sort((a,b) => b[1]-a[1]).slice(0,3).map(([f]) => f);

        }

    } else if (cardType === 'overall' && allRunsData && allRunsData.length > 0) {
        stats.title = 'Overall Stats';
        stats.totalRuns = allRunsData.length;

        let totalGames = 0, totalWins = 0, totalLosses = 0, totalGF = 0, totalGA = 0;
        let serverSum = 0, stressSum = 0, rqSum = 0, possessionSum = 0, passAccSum = 0;
        let shotSum = 0, shotOnTargetSum = 0, dribbleSum = 0, xgForSum = 0, xgAgainstSum = 0;
        let passesSum = 0, gameDurationSum = 0, gamesWithStats = 0, gamesWithDribble = 0;
        let maxWinStreak = 0, maxLossStreak = 0;
        let bestWinRate = -1, worstWinRate = 101;
        let bestRecordStr = '0-0', worstRecordStr = '0-0';
        const playerTotals: Record<string, { goals: number, assists: number, ratingSum: number, count: number, name: string, appearances: number }> = {};
        const tagCounts: Record<string, number> = {};
        const formationCounts: Record<string, number> = {}; // Needs logic
        const uniquePlayers = new Set<string>();
        const uniqueFormations = new Set<string>();
        let totalCleanSheets = 0; // Requires GK logic or team conceded = 0

        allRunsData.forEach(run => {
            const games = run.games?.filter(g => g) ?? [];
            const runGamesPlayed = games.length;
            if (runGamesPlayed === 0) return;

            const runWins = run.total_wins ?? games.filter(g => g.result === 'win').length;
            const runLosses = runGamesPlayed - runWins;
            const runGF = run.total_goals ?? games.reduce((sum, g) => sum + (g.user_goals ?? 0), 0);
            const runGA = run.total_conceded ?? games.reduce((sum, g) => sum + (g.opponent_goals ?? 0), 0);

            totalGames += runGamesPlayed;
            totalWins += runWins;
            totalLosses += runLosses;
            totalGF += runGF;
            totalGA += runGA;

            maxWinStreak = Math.max(maxWinStreak, run.best_streak ?? 0);
            maxLossStreak = Math.max(maxLossStreak, run.worst_streak ?? 0); // Assuming worst_streak is loss streak

            const runWinRate = (runWins / runGamesPlayed) * 100;
            if (runWinRate > bestWinRate) {
                bestWinRate = runWinRate;
                bestRecordStr = `${runWins}-${runLosses}`;
            }
            if (runWinRate < worstWinRate) {
                worstWinRate = runWinRate;
                worstRecordStr = `${runWins}-${runLosses}`;
            }

            games.forEach(g => {
                serverSum += g.server_quality ?? 5;
                stressSum += g.stress_level ?? 5;
                if (g.game_context === 'rage_quit' || g.game_context === 'rage_quit_own') rqSum++;
                gameDurationSum += g.duration ?? 90;

                (g.tags ?? []).forEach(tag => tagCounts[tag] = (tagCounts[tag] || 0) + 1);
                // TODO: Extract formation

                if (g.team_stats) {
                    gamesWithStats++;
                    possessionSum += g.team_stats.possession ?? 50;
                    passAccSum += g.team_stats.pass_accuracy ?? 75;
                    shotSum += g.team_stats.shots ?? 0;
                    shotOnTargetSum += g.team_stats.shots_on_target ?? 0;
                    xgForSum += g.team_stats.expected_goals ?? 0;
                    xgAgainstSum += g.team_stats.expected_goals_against ?? 0;
                    passesSum += g.team_stats.passes ?? 0;
                     if (g.team_stats.dribble_success_rate != null) {
                        dribbleSum += g.team_stats.dribble_success_rate;
                        gamesWithDribble++;
                    }
                }
                if ((g.opponent_goals ?? 0) === 0) {
                    totalCleanSheets++;
                }

                (g.player_performances ?? []).forEach(p => {
                    if (!p) return;
                    const id = p.player_id || p.player_name;
                    uniquePlayers.add(id);
                    if (!playerTotals[id]) playerTotals[id] = { goals: 0, assists: 0, ratingSum: 0, count: 0, name: p.player_name, appearances: 0 };
                    playerTotals[id].goals += p.goals ?? 0;
                    playerTotals[id].assists += p.assists ?? 0;
                    playerTotals[id].ratingSum += p.rating ?? 0;
                    playerTotals[id].count++;
                    playerTotals[id].appearances++; // Increment appearances
                });
            });
        });

        if (totalGames > 0) {
            stats.record = `${totalWins}-${totalLosses}`;
            stats.winRate = (totalWins / totalGames) * 100;
            stats.goalsScored = totalGF;
            stats.goalsConceded = totalGA;
            stats.goalDifference = totalGF - totalGA;
            stats.avgServerQuality = serverSum / totalGames;
            stats.avgStressLevel = stressSum / totalGames;
            stats.rageQuits = rqSum;
            stats.averageWins = totalWins / stats.totalRuns!;
            stats.cleanSheets = totalCleanSheets;
        }

         if (gamesWithStats > 0) {
            stats.avgPossession = possessionSum / gamesWithStats;
            stats.passAccuracy = passAccSum / gamesWithStats;
            stats.shotAccuracy = shotSum > 0 ? (shotOnTargetSum / shotSum) * 100 : 0;
            stats.xgFor = xgForSum / gamesWithStats;
            stats.xgAgainst = xgAgainstSum / gamesWithStats;
            stats.xgDifferential = stats.xgFor - stats.xgAgainst; // Use overall averages
            const totalMinutesApproximation = gameDurationSum;
            stats.passesPer90 = totalMinutesApproximation > 0 ? (passesSum / totalMinutesApproximation) * 90 : 0;
            stats.goalsPer90 = totalMinutesApproximation > 0 ? (totalGF / totalMinutesApproximation) * 90 : 0;
         }
          if (gamesWithDribble > 0) {
              stats.dribbleAccuracy = dribbleSum / gamesWithDribble;
          }


        // Player Stats Overall
        const playersArray = Object.values(playerTotals);
        if (playersArray.length > 0) {
             playersArray.sort((a, b) => (b.ratingSum / b.count) - (a.ratingSum / a.count)); // Avg rating
             stats.highestRatedPlayer = { name: playersArray[0].name, rating: playersArray[0].ratingSum / playersArray[0].count };
             stats.averagePlayerRating = playersArray.reduce((sum, p) => sum + p.ratingSum, 0) / playersArray.reduce((sum, p) => sum + p.count, 0);

             playersArray.sort((a, b) => b.goals - a.goals); // Goals
             stats.highestScorer = { name: playersArray[0].name, goals: playersArray[0].goals };

             playersArray.sort((a, b) => b.assists - a.assists); // Assists
             stats.highestAssister = { name: playersArray[0].name, assists: playersArray[0].assists };

             // Club Legends (Top 3 by appearances)
             playersArray.sort((a, b) => b.appearances - a.appearances);
             stats.clubLegends = playersArray.slice(0, 3).map(p => ({ name: p.name, appearances: p.appearances }));
        }

        stats.winStreak = maxWinStreak;
        stats.lossStreak = maxLossStreak;
        stats.bestRecord = bestRecordStr;
        stats.worstRecord = worstRecordStr;
        stats.totalPlayersUsed = uniquePlayers.size;
        // stats.totalFormationsUsed = uniqueFormations.size;
        // stats.favouriteFormation = Object.entries(formationCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        stats.matchTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tag, count]) => ({ tag, count }));
    }

    return stats;
};

// --- Small Stat Component ---
interface StatDisplayProps {
    Icon: React.ElementType;
    label: string;
    value: string | number | undefined | null;
    unit?: string;
    colorClass?: string;
    iconColorClass?: string;
}
const StatDisplay: React.FC<StatDisplayProps> = ({ Icon, label, value, unit, colorClass = "text-foreground", iconColorClass }) => {
    if (value === undefined || value === null || value === "" || Number.isNaN(value)) return null;
    const displayValue = typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value;

    return (
        <div className="flex flex-col items-center justify-center text-center bg-foreground/5 p-2 rounded-md h-full">
            <Icon className={cn("h-4 w-4 mb-0.5", iconColorClass || "text-primary/80")} />
            <p className={cn("text-base sm:text-lg font-bold leading-tight", colorClass)}>
                {displayValue}{unit}
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight">{label}</p>
        </div>
    );
};


// --- Card Preview Component ---
interface CardPreviewProps {
  runData?: WeeklyPerformance | null;
  allRunsData?: WeeklyPerformance[] | null;
  options: CardOptions;
  cardType: 'run' | 'overall';
}

const CardPreview: React.FC<CardPreviewProps> = ({ runData, allRunsData, options, cardType }) => {
  const { currentTheme } = useTheme();
  const stats = useMemo(() => calculateAllStats(runData, allRunsData, cardType), [runData, allRunsData, cardType]);

  const winColor = currentTheme.colors.win || 'text-green-500';
  const lossColor = currentTheme.colors.loss || 'text-red-500';
  const neutralColor = 'text-primary'; // Or foreground

  const getGoalDiffColor = (diff?: number) => {
      if (diff === undefined || diff === null) return 'text-muted-foreground';
      return diff > 0 ? winColor : diff < 0 ? lossColor : 'text-muted-foreground';
  }

  return (
    <div className={`h-full w-full flex flex-col p-3 sm:p-4 text-sm ${currentTheme.name === 'dark' ? 'dark-gradient-bg text-foreground' : 'light-gradient-bg text-gray-800'}`}> {/* Adjusted padding & added gradient classes */}

      {/* Header */}
      <div className="text-center mb-3 sm:mb-4 border-b border-border/30 pb-2">
        <h2 className="text-lg sm:text-xl font-bold leading-tight">{stats.title || 'Stat Card'}</h2>
        {options.showRecord && <p className={cn("text-base sm:text-lg font-semibold", neutralColor)}>{stats.record || 'N/A'}</p>}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        {options.showWinRate && <StatDisplay Icon={Percent} label="Win Rate" value={stats.winRate} unit="%" colorClass={stats.winRate && stats.winRate >= 50 ? winColor : lossColor} />}
        {options.showGoalsScored && <StatDisplay Icon={ArrowUp} label="Goals For" value={stats.goalsScored} iconColorClass={winColor} />}
        {options.showGoalsConceded && <StatDisplay Icon={ArrowDown} label="Goals Against" value={stats.goalsConceded} iconColorClass={lossColor} />}
        {options.showGoalDifference && <StatDisplay Icon={TrendingUp} label="Goal Diff" value={stats.goalDifference} colorClass={getGoalDiffColor(stats.goalDifference)} iconColorClass={getGoalDiffColor(stats.goalDifference)} />}
        {options.showGamesPlayed && <StatDisplay Icon={Clock} label="Played" value={stats.gamesPlayed} />}
        {options.showCPS && cardType === 'run' && <StatDisplay Icon={Star} label="CPS" value={stats.cpsScore} colorClass={neutralColor} />}

        {/* Team Stats */}
        {options.showAvgPossession && <StatDisplay Icon={Footprints} label="Avg Poss" value={stats.avgPossession} unit="%" />}
        {options.showPassAccuracy && <StatDisplay Icon={Target} label="Pass Acc" value={stats.passAccuracy} unit="%" />}
        {options.showShotAccuracy && <StatDisplay Icon={Goal} label="Shot Acc" value={stats.shotAccuracy} unit="%" />}
        {options.showDribbleAccuracy && <StatDisplay Icon={TrendingUp} label="Dribble %" value={stats.dribbleAccuracy} unit="%" />}
        {options.showXGFor && <StatDisplay Icon={TrendingUp} label="Avg xG For" value={stats.xgFor} />}
        {options.showXGAgainst && <StatDisplay Icon={TrendingDown} label="Avg xG Against" value={stats.xgAgainst} />}
        {options.showXGDifferential && <StatDisplay Icon={TrendingUp} label="Avg xG Diff" value={stats.xgDifferential} colorClass={getGoalDiffColor(stats.xgDifferential)} iconColorClass={getGoalDiffColor(stats.xgDifferential)} />}
        {options.showPassesPer90 && <StatDisplay Icon={ListChecks} label="Passes/90" value={stats.passesPer90} />}
        {options.showGoalsPer90 && <StatDisplay Icon={Goal} label="Goals/90" value={stats.goalsPer90} />}

         {/* Streaks & Records */}
         {options.showWinStreak && <StatDisplay Icon={TrendingUp} label="Best Win Streak" value={stats.winStreak} colorClass={winColor} />}
         {options.showLossStreak && cardType === 'overall' && <StatDisplay Icon={TrendingDown} label="Worst Loss Streak" value={stats.lossStreak} colorClass={lossColor} />}
         {options.showBestRecord && cardType === 'overall' && <StatDisplay Icon={Trophy} label="Best Run" value={stats.bestRecord} colorClass={winColor} />}
         {options.showWorstRecord && cardType === 'overall' && <StatDisplay Icon={Skull} label="Worst Run" value={stats.worstRecord} colorClass={lossColor} />}

         {/* Analysis */}
         {options.showRageQuits && <StatDisplay Icon={Skull} label="Rage Quits" value={stats.rageQuits} />}

         {/* Overall Only */}
         {options.showTotalRuns && cardType === 'overall' && <StatDisplay Icon={ListChecks} label="Total Runs" value={stats.totalRuns} />}
         {options.showAverageWins && cardType === 'overall' && <StatDisplay Icon={Trophy} label="Avg Wins/Run" value={stats.averageWins} />}
         {options.showCleanSheets && cardType === 'overall' && <StatDisplay Icon={Shield} label="Clean Sheets" value={stats.cleanSheets} />}
         {options.showTotalPlayersUsed && cardType === 'overall' && <StatDisplay Icon={Users} label="Players Used" value={stats.totalPlayersUsed} />}
         {options.showTotalFormationsUsed && cardType === 'overall' && <StatDisplay Icon={GitFork} label="Formations Used" value={stats.totalFormationsUsed} />}
         {options.showFavouriteFormation && cardType === 'overall' && <StatDisplay Icon={GitFork} label="Fav Formation" value={stats.favouriteFormation || 'N/A'} />}

         {/* General Extra */}
         {options.showAvgServerQuality && <StatDisplay Icon={Wifi} label="Avg Server" value={stats.avgServerQuality ? `${stats.avgServerQuality.toFixed(1)}/10` : 'N/A'} />}
         {options.showAvgStressLevel && <StatDisplay Icon={HeartPulse} label="Avg Stress" value={stats.avgStressLevel ? `${stats.avgStressLevel.toFixed(1)}/10` : 'N/A'} />}
      </div>

       {/* Player Highlights Section */}
       {(options.showHighestRatedPlayer || options.showHighestScorer || options.showHighestAssister || options.showAveragePlayerRating || (options.showClubLegends && cardType === 'overall')) && (
            <div className='mb-3 sm:mb-4 space-y-1.5'>
                <h3 className='text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider'>Player Highlights</h3>
                <div className='grid grid-cols-2 gap-1.5 sm:gap-2'>
                    {options.showHighestRatedPlayer && stats.highestRatedPlayer && (
                        <div className="bg-foreground/5 p-1.5 sm:p-2 rounded text-center">
                            <p className="text-[10px] sm:text-[11px] text-muted-foreground">MVP</p>
                            <p className="text-xs sm:text-sm font-semibold truncate">{stats.highestRatedPlayer.name}</p>
                            <p className="text-xs text-primary">{stats.highestRatedPlayer.rating.toFixed(1)} Avg Rating</p>
                        </div>
                    )}
                    {options.showHighestScorer && stats.highestScorer && (
                         <div className="bg-foreground/5 p-1.5 sm:p-2 rounded text-center">
                            <p className="text-[10px] sm:text-[11px] text-muted-foreground">Top Scorer</p>
                            <p className="text-xs sm:text-sm font-semibold truncate">{stats.highestScorer.name}</p>
                            <p className="text-xs text-primary">{stats.highestScorer.goals} Goals</p>
                        </div>
                    )}
                     {options.showHighestAssister && stats.highestAssister && (
                         <div className="bg-foreground/5 p-1.5 sm:p-2 rounded text-center">
                            <p className="text-[10px] sm:text-[11px] text-muted-foreground">Top Assister</p>
                            <p className="text-xs sm:text-sm font-semibold truncate">{stats.highestAssister.name}</p>
                            <p className="text-xs text-primary">{stats.highestAssister.assists} Assists</p>
                        </div>
                    )}
                     {options.showAveragePlayerRating && (
                         <div className="bg-foreground/5 p-1.5 sm:p-2 rounded text-center">
                            <p className="text-[10px] sm:text-[11px] text-muted-foreground">Avg Team Rating</p>
                            <p className="text-sm font-bold mt-1">{stats.averagePlayerRating?.toFixed(1) ?? 'N/A'}</p>
                        </div>
                    )}
                     {options.showClubLegends && cardType === 'overall' && stats.clubLegends && stats.clubLegends.length > 0 && (
                        <div className="col-span-2 bg-foreground/5 p-1.5 sm:p-2 rounded text-center">
                           <p className="text-[10px] sm:text-[11px] text-muted-foreground mb-1">Club Legends (Apps)</p>
                           <div className='flex justify-around text-xs'>
                               {stats.clubLegends.map(p => <span key={p.name} className='font-semibold'>{p.name} ({p.appearances})</span>)}
                           </div>
                       </div>
                    )}
                </div>
            </div>
        )}

        {/* Other Analysis */}
        {options.showMatchTagAnalysis && stats.matchTags && stats.matchTags.length > 0 && (
             <div className='mb-3 sm:mb-4 space-y-1'>
                <h3 className='text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider'>Top Match Tags</h3>
                <div className='flex flex-wrap justify-center gap-1 text-[10px] sm:text-[11px]'>
                    {stats.matchTags.map(t => <span key={t.tag} className='bg-primary/20 text-primary px-1.5 py-0.5 rounded'>{t.tag} ({t.count})</span>)}
                </div>
            </div>
        )}

      {/* --- TODO: Conditionally add small charts (recharts) here if options allow --- */}


      {/* Footer */}
      <div className="mt-auto pt-2 border-t border-border/30 flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground/80">
        <img src={logo} alt="FUT Trackr Logo" className="h-5 w-5 opacity-70" />
        <span>Stats via FUTTrackr.com</span>
      </div>
    </div>
  );
};

export default CardPreview;
