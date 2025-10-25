import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';
// --- FIX: Import useAccountData and Skeleton ---
import { useAccountData } from '@/hooks/useAccountData';
import { Skeleton } from '@/components/ui/skeleton';
import { Map } from 'lucide-react'; // Example icon

// Define broader position groups
type PositionGroup = 'GK' | 'DEF' | 'MID' | 'ATT' | 'Unknown';
const getPositionGroup = (position: string): PositionGroup => {
    if (!position) return 'Unknown';
    const p = position.toUpperCase();
    if (p === 'GK') return 'GK';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p)) return 'DEF';
    if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p)) return 'MID';
    if (['CF', 'ST', 'LW', 'RW'].includes(p)) return 'ATT';
    return 'Unknown';
};

const PositionalHeatMap = () => {
    const { currentTheme } = useTheme();
    // --- FIX: Add data hook and loading state ---
    const { weeklyData = [], loading } = useAccountData() || {};

    const heatmapData = useMemo(() => {
        // This logic is safe
        const positionStats: Record<PositionGroup, { totalRating: number; count: number; goals: number; assists: number }> = {
            GK: { totalRating: 0, count: 0, goals: 0, assists: 0 },
            DEF: { totalRating: 0, count: 0, goals: 0, assists: 0 },
            MID: { totalRating: 0, count: 0, goals: 0, assists: 0 },
            ATT: { totalRating: 0, count: 0, goals: 0, assists: 0 },
            Unknown: { totalRating: 0, count: 0, goals: 0, assists: 0 },
        };

        weeklyData.forEach(week => {
            (week.games || []).forEach(game => {
                (game.playerStats || []).forEach(player => {
                    const group = getPositionGroup(player.position);
                    if (group !== 'Unknown') {
                        positionStats[group].totalRating += player.rating || 0;
                        positionStats[group].count += 1;
                        positionStats[group].goals += player.goals || 0;
                        positionStats[group].assists += player.assists || 0;
                    }
                });
            });
        });

        return (Object.entries(positionStats) as [PositionGroup, typeof positionStats[PositionGroup]][])
            .filter(([group, stats]) => group !== 'Unknown' && stats.count > 0)
            .map(([group, stats]) => ({
                group,
                avgRating: parseFloat((stats.totalRating / stats.count).toFixed(1)),
                totalGoals: stats.goals,
                totalAssists: stats.assists,
                contribution: stats.goals + stats.assists, // Simple contribution metric
                count: stats.count
            }));
            
    }, [weeklyData]);

     const getRatingColor = (rating: number): string => {
        const minRating = 5;
        const maxRating = 9; // Cap color scaling around 9.0
        const normalized = Math.max(0, Math.min(1, (rating - minRating) / (maxRating - minRating)));
        
        // Interpolate between red (low) -> yellow (mid) -> green (high)
        // Using HSL: Hue from 0 (red) to 120 (green)
        const hue = normalized * 120; 
        const saturation = 70; // Keep saturation consistent
        const lightness = 50; // Keep lightness consistent
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };


    // --- FIX: Add loading state ---
    if (loading) {
        return (
            <Card 
                style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}
                 className="h-[350px]" // Approx height
            >
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                    <div className="grid grid-cols-4 gap-2 mt-4">
                         <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (heatmapData.length === 0) {
        return (
            <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                        <Map className="h-5 w-5" style={{ color: currentTheme.colors.primary }}/>
                        Positional Performance
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12" style={{ color: currentTheme.colors.muted }}>
                    <p>Add player stats (including position) to games to see this analysis.</p>
                </CardContent>
            </Card>
        );
    }


    return (
        <Card style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                    <Map className="h-5 w-5" style={{ color: currentTheme.colors.primary }} />
                    Positional Performance Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                 {/* Simple Grid Representation */}
                 <div className="grid grid-cols-1 gap-4">
                     {heatmapData.sort((a,b) => { // Sort GK, DEF, MID, ATT
                         const order = { GK: 1, DEF: 2, MID: 3, ATT: 4 };
                         return order[a.group] - order[b.group];
                     }).map(data => (
                         <div 
                             key={data.group} 
                             className="p-4 rounded-lg flex justify-between items-center border"
                             style={{ 
                                 backgroundColor: currentTheme.colors.surface,
                                 borderColor: getRatingColor(data.avgRating) // Use rating color for border
                             }}
                         >
                             <div>
                                <p className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>{data.group}</p>
                                <p className="text-xs" style={{ color: currentTheme.colors.muted }}>{data.count} Player Appearances</p>
                             </div>
                             <div className="text-right">
                                <p className="text-2xl font-bold" style={{ color: getRatingColor(data.avgRating) }}>
                                     {data.avgRating.toFixed(1)}
                                 </p>
                                <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Avg Rating</p>
                                {/* Optionally show G+A for MID/ATT */}
                                {(data.group === 'MID' || data.group === 'ATT') && (
                                    <p className="text-xs mt-1" style={{ color: currentTheme.colors.muted }}>
                                        {data.contribution} (G+A)
                                    </p>
                                )}
                             </div>
                         </div>
                     ))}
                 </div>
                 {/* Placeholder for future visual heatmap */}
                 {/* <div className="mt-4 text-center text-sm" style={{ color: currentTheme.colors.muted }}>
                     (Visual heatmap coming soon)
                 </div> */}
            </CardContent>
        </Card>
    );
};

export default PositionalHeatMap;
