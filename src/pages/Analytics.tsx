import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Loader2 } from "lucide-react";
import KeyStatsSummary from "@/components/KeyStatsSummary";
import PerformanceOverTimeChart from "@/components/PerformanceOverTimeChart";
import { calculateAllTimeStats } from "@/utils/enhancedAiInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const AnalyticsPage = () => {
  const { weeklyData, loading } = useSupabaseData();

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const allTimeStats = calculateAllTimeStats(weeklyData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">A complete overview of your FUT Champs history.</p>
      </div>
      
      {weeklyData && weeklyData.length > 0 ? (
        <>
            <KeyStatsSummary stats={allTimeStats} />
            <PerformanceOverTimeChart data={weeklyData} />
        </>
      ) : (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    No Analytics Available
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    You need to complete at least one week of FUT Champions to see your performance analytics.
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;
