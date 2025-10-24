import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// --- FIX: Use useAccountData ---
import { useAccountData } from '@/hooks/useAccountData';
// --- FIX: Import Skeleton ---
import { Skeleton } from '@/components/ui/skeleton';
import { generateEnhancedAIInsights } from '@/utils/enhancedAiInsights'; // Assuming this generates insights
import { Lightbulb, Brain, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const PrimaryInsightCard = () => {
    // --- FIX: Use useAccountData and loading state ---
    const { weeklyData = [], currentWeek, loading } = useAccountData() || {};
    const { currentTheme } = useTheme();
    const [primaryInsight, setPrimaryInsight] = useState<any | null>(null);

    const completedWeeks = weeklyData.filter(week => week.isCompleted);

    useEffect(() => {
        // Only run if data is loaded and there are completed weeks
        if (!loading && completedWeeks.length > 0) {
            const insights = generateEnhancedAIInsights(completedWeeks, currentWeek);
            // Find the insight with the highest priority or a specific type
            const topInsight = insights.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            })[0]; // Get the highest priority insight
            setPrimaryInsight(topInsight || null);
        } else if (!loading) {
            setPrimaryInsight(null); // Clear insight if no data
        }
    }, [completedWeeks, currentWeek, loading]); // Add loading dependency

    const getInsightIcon = (category?: string) => {
        switch (category) {
            case 'strength': return <TrendingUp className="h-5 w-5 text-green-500" />;
            case 'weakness': return <TrendingDown className="h-5 w-5 text-red-500" />;
            case 'opportunity': return <Target className="h-5 w-5 text-blue-500" />;
            default: return <Brain className="h-5 w-5 text-purple-500" />;
        }
    };

    // --- FIX: Add loading state ---
    if (loading) {
        return (
            <Card 
                className="border-0 shadow-lg"
                style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}
            >
                <CardHeader>
                    <Skeleton className="h-6 w-3/5" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-5 w-4/5 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                    <div className="flex justify-between items-center mt-4">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!primaryInsight) {
        return (
            <Card 
                className="border-0 shadow-lg flex flex-col items-center justify-center text-center p-6 min-h-[150px]" // Added min height
                style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}
            >
                <Lightbulb className="h-8 w-8 mb-2" style={{ color: currentTheme.colors.muted }} />
                <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>AI Insights Loading</p>
                <p className="text-xs" style={{ color: currentTheme.colors.muted }}>Complete more weeks for personalized tips.</p>
            </Card>
        );
    }

    return (
        <Card 
            className="border-0 shadow-lg"
            style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}
        >
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                    {getInsightIcon(primaryInsight.category)}
                    Primary AI Insight
                </CardTitle>
            </CardHeader>
            <CardContent>
                <h4 className="font-medium mb-1" style={{ color: currentTheme.colors.text }}>{primaryInsight.title}</h4>
                <p className="text-sm mb-3" style={{ color: currentTheme.colors.muted }}>{primaryInsight.description}</p>
                {primaryInsight.actionableAdvice && (
                    <div className="p-2 rounded bg-white/5 mb-3 text-sm" style={{ color: currentTheme.colors.text }}>
                        <strong style={{ color: currentTheme.colors.primary }}>Advice:</strong> {primaryInsight.actionableAdvice}
                    </div>
                )}
                 <div className="flex items-center justify-between mt-2">
                      <Badge 
                        variant="outline"
                        className={`text-xs border-0 capitalize ${
                            primaryInsight.priority === 'low' ? 'bg-green-500/20 text-green-400' :
                            primaryInsight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {primaryInsight.priority} Priority
                      </Badge>
                      <span className="text-xs" style={{ color: currentTheme.colors.muted }}>{primaryInsight.confidence}% confidence</span>
                 </div>
            </CardContent>
        </Card>
    );
};

export default PrimaryInsightCard;
