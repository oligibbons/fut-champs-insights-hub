import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FutChampsWeek, Game } from '@/types/futChampions';
import { Trophy, Target, TrendingUp, BarChart3 } from 'lucide-react';

const CurrentRunStats = ({ week, games }: { week: FutChampsWeek | null, games: Game[] }) => {
    
    const runStats = useMemo(() => {
        if (!week || games.length === 0) return null;

        const totalGames = games.length;
        const totalWins = games.filter(g => g.result === 'win').length;
        const totalLosses = games.filter(g => g.result === 'loss').length;
        const totalGoals = games.reduce((sum, game) => sum + (game.user_goals || 0), 0);
        const totalConceded = games.reduce((sum, game) => sum + (game.opponent_goals || 0), 0);

        // Team stats aggregation from nested team_statistics
        const allTeamStats = games.map(g => g.team_statistics).flat().filter(Boolean);
        const totalPossession = allTeamStats.reduce((sum, stats) => sum + (stats.possession || 50), 0);
        const totalShots = allTeamStats.reduce((sum, stats) => sum + (stats.shots || 0), 0);
        const totalShotsOnTarget = allTeamStats.reduce((sum, stats) => sum + (stats.shots_on_target || 0), 0);
        
        const avgOpponentSkill = games.reduce((sum, game) => sum + game.opponent_skill, 0) / totalGames;
        const winRate = (totalWins / totalGames) * 100;
        const goalRatio = totalConceded > 0 ? totalGoals / totalConceded : totalGoals;
        
        return {
            totalGames,
            wins: totalWins,
            losses: totalLosses,
            goals: totalGoals,
            conceded: totalConceded,
            winRate,
            goalRatio: goalRatio.toFixed(2),
            avgOpponentSkill: avgOpponentSkill.toFixed(1),
            currentStreak: week.current_streak || 0,
            avgPossession: (totalPossession / totalGames).toFixed(1),
            shotAccuracy: totalShots > 0 ? ((totalShotsOnTarget / totalShots) * 100).toFixed(1) : '0',
        };
    }, [week, games]);

    if (!runStats) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Stats Yet</h3>
                    <p className="text-muted-foreground">Play your first game of the week to see your stats here.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{runStats.winRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">{runStats.wins}W - {runStats.losses}L</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Goal Ratio</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{runStats.goalRatio}</div>
                        <p className="text-xs text-muted-foreground">{runStats.goals} For / {runStats.conceded} Against</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{runStats.currentStreak}</div>
                        <p className="text-xs text-muted-foreground">games</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Opponent</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{runStats.avgOpponentSkill}/10</div>
                        <p className="text-xs text-muted-foreground">skill level</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CurrentRunStats;
