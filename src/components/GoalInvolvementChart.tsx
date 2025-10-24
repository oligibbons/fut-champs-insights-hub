import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { useTheme } from '@/hooks/useTheme';
// --- FIX: Import useAccountData and Skeleton ---
import { useAccountData } from '@/hooks/useAccountData';
import { Skeleton } from '@/components/ui/skeleton';
import { Award } from 'lucide-react'; // Changed icon

const GoalInvolvementChart = () => {
    const { currentTheme } = useTheme();
    // --- FIX: Add data hook and loading state ---
    const { weeklyData = [], loading } = useAccountData() || {};

    const chartData = useMemo(() => {
        // This logic is safe with guarded weeklyData
        const playerStats: { [name: string]: { name: string; goals: number; assists: number; games: number } } = {};

        weeklyData.forEach(week => {
            (week.games || []).forEach(game => {
                (game.playerStats || []).forEach(player => {
                    if (!playerStats[player.name]) {
                        playerStats[player.name] = { name: player.name, goals: 0, assists: 0, games: 0 };
                    }
                    playerStats[player.name].goals += player.goals || 0;
                    playerStats[player.name].assists += player.assists || 0;
                    playerStats[player.name].games += 1;
                });
            });
        });

        return Object.values(playerStats)
            .filter(player => player.games >= 5) // Minimum 5 games
            .map(player => ({
                name: player.name,
                goals: player.goals,
                assists: player.assists,
                involvement: player.goals + player.assists,
            }))
            .sort((a, b) => b.involvement - a.involvement) // Sort by total involvement
            .slice(0, 7); // Show top 7
            
    }, [weeklyData]);

    // --- FIX: Add loading state ---
    if (loading) {
        return (
            <Card 
                style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}
                className="h-[400px]" // Approx height
            >
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (chartData.length === 0) {
        return (
            <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                         <Award className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                         Top Goal Contributors
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12" style={{ color: currentTheme.colors.muted }}>
                    <p>Play more games (min 5 per player) to see top contributors.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                    <Award className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                    Top Goal Contributors (G+A)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.colors.border} horizontal={false} />
                            <XAxis type="number" stroke={currentTheme.colors.muted} fontSize={10} />
                            <YAxis 
                                type="category" 
                                dataKey="name" 
                                stroke={currentTheme.colors.muted} 
                                fontSize={10} 
                                width={60} // Give more space for names
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: currentTheme.colors.surface,
                                    borderColor: currentTheme.colors.border,
                                    borderRadius: '0.75rem',
                                    color: currentTheme.colors.text,
                                }}
                                cursor={{ fill: `${currentTheme.colors.primary}1A`}}
                            />
                            <Bar dataKey="involvement" name="Goals + Assists" fill={currentTheme.colors.primary} radius={[0, 4, 4, 0]} barSize={20}>
                                {/* You could add Cells here if you want different colors */}
                            </Bar>
                             {/* Optional: Stacked bar for G vs A */}
                            {/* <Bar dataKey="goals" name="Goals" stackId="a" fill={currentTheme.colors.primary} /> */}
                            {/* <Bar dataKey="assists" name="Assists" stackId="a" fill={currentTheme.colors.accent} radius={[0, 4, 4, 0]} /> */}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default GoalInvolvementChart;
