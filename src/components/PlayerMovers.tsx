import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopPerformers from "@/components/TopPerformers";
import LowestRatedPlayers from "@/components/LowestRatedPlayers";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const PlayerMovers = () => {
  const { currentTheme } = useTheme();

  return (
    <Tabs defaultValue="top">
      {/* These tabs are styled to sit cleanly inside the DashboardSection card */}
      <TabsList 
        className="grid w-full grid-cols-2 p-0 h-auto rounded-lg"
        style={{ 
          backgroundColor: currentTheme.colors.cardBg,
          borderColor: currentTheme.colors.border 
        }}
      >
        <TabsTrigger 
          value="top" 
          className="rounded-lg flex gap-2 items-center"
        >
          <TrendingUp className="h-4 w-4 text-green-500" />
          Top Performers
        </TabsTrigger>
        <TabsTrigger 
          value="bottom" 
          className="rounded-lg flex gap-2 items-center"
        >
          <TrendingDown className="h-4 w-4 text-red-500" />
          Needs Improvement
        </TabsTrigger>
      </TabsList>
      
      {/* The content for each tab is just the component we already built */}
      <TabsContent value="top" className="pt-4">
        <TopPerformers />
      </TabsContent>
      <TabsContent value="bottom" className="pt-4">
        <LowestRatedPlayers />
      </TabsContent>
    </Tabs>
  );
};

export default PlayerMovers;
