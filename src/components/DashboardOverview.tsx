import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameResult } from "@/types/futChampions";
import PerformanceRadar from "./PerformanceRadar";
import MatchTagAnalysis from "./MatchTagAnalysis";
import PositionalHeatMap from "./PositionalHeatMap";
import GoalInvolvementChart from "./GoalInvolvementChart"; // Import the new component
import { BarChart, LayoutGrid, Map, PieChart } from "lucide-react";

interface DashboardOverviewProps {
  games: GameResult[];
}

const DashboardOverview = ({ games }: DashboardOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="radar" className="w-full">
          <TabsList className="grid w-full grid-cols-4"> {/* Updated to 4 columns */}
            <TabsTrigger value="radar"><LayoutGrid className="h-4 w-4 mr-2" />Radar</TabsTrigger>
            <TabsTrigger value="heatmap"><Map className="h-4 w-4 mr-2" />Heatmap</TabsTrigger>
            <TabsTrigger value="tags"><BarChart className="h-4 w-4 mr-2" />Match Tags</TabsTrigger>
            <TabsTrigger value="goals"><PieChart className="h-4 w-4 mr-2" />Goals</TabsTrigger> {/* New Tab */}
          </TabsList>
          
          <TabsContent value="radar" className="mt-4">
            <PerformanceRadar games={games} />
          </TabsContent>
          <TabsContent value="heatmap" className="mt-4">
            <PositionalHeatMap games={games} />
          </TabsContent>
          <TabsContent value="tags" className="mt-4">
            <MatchTagAnalysis games={games} />
          </TabsContent>
          <TabsContent value="goals" className="mt-4"> {/* New Tab Content */}
            <GoalInvolvementChart />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DashboardOverview;
