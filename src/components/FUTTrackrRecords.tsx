import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAccountData } from '@/hooks/useAccountData';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, TrendingUp, BarChart2, Zap, Trophy, Goal, HeartPulse, ShieldCheck, Flame, ShieldOff, Star, Repeat } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from '@/components/ui/card';

// Updated RecordItem to be a "Card" for the carousel
const RecordItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => {
  const { currentTheme } = useTheme();
  return (
    <Card 
      className="border-0 shadow-lg"
      style={{ 
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border 
      }}
    >
      <CardContent className="p-4 flex items-center">
        <div 
          className="p-3 rounded-lg mr-4"
          style={{ backgroundColor: currentTheme.colors.cardBg }}
        >
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>{value}</p>
          <p className="text-sm" style={{ color: currentTheme.colors.muted }}>{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export const FUTTrackrRecords = () => {
  const { weeklyData = [], loading } = useAccountData() || {};
  const stats = useDashboardStats(weeklyData); 
  const { currentTheme } = useTheme();

  if (loading) {
    return (
      <div className="flex space-x-4">
        <Skeleton className="h-24 w-full min-w-64 rounded-2xl" />
        <Skeleton className="h-24 w-full min-w-64 rounded-2xl hidden md:block" />
        <Skeleton className="h-24 w-full min-w-64 rounded-2xl hidden lg:block" />
      </div>
    );
  }
  
  if (weeklyData.length === 0) {
     return (
        <div 
          className="text-center py-12 rounded-2xl"
          style={{ backgroundColor: currentTheme.colors.surface }}
        >
          <Trophy className="h-16 w-16 mx-auto mb-4" style={{ color: currentTheme.colors.muted }} />
          <h3 className="text-xl font-semibold text-white mb-2">No Records Yet</h3>
          <p className="text-sm" style={{ color: currentTheme.colors.muted }}>
            Complete your first week to start tracking records.
          </p>
        </div>
    );
  }

  // --- FIX: Replaced grid with Carousel ---
  return (
    <Carousel 
      opts={{
        align: "start",
        loop: false,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<Trophy className="h-5 w-5 text-yellow-500" />}
            label="Best Record"
            value={`${stats.bestRecord} Wins`}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
            label="Average Wins"
            value={stats.averageWins.toFixed(1)}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<Flame className="h-5 w-5 text-orange-500" />}
            label="Longest Win Streak"
            value={stats.longestWinStreak}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<Goal className="h-5 w-5 text-green-500" />}
            label="Most Goals (Run)"
            value={stats.mostGoalsInRun}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<BarChart2 className="h-5 w-5 text-purple-500" />}
            label="Goal Difference"
            value={stats.overallGoalDifference > 0 ? `+${stats.overallGoalDifference}` : stats.overallGoalDifference}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<Star className="h-5 w-5 text-pink-500" />}
            label="Club MVP"
            value={stats.mvp}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<Award className="h-5 w-5 text-red-500" />}
            label="Avg Player Rating"
            value={stats.averagePlayerRating.toFixed(2)}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<ShieldCheck className="h-5 w-5 text-teal-500" />}
            label="Discipline"
            value={stats.disciplineIndex}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<Repeat className="h-5 w-5 text-gray-500" />}
            label="Avg Possession"
            value={`${stats.averagePossession.toFixed(0)}%`}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<ShieldOff className="h-5 w-5 text-green-600" />}
            label="Total Clean Sheets"
            value={stats.totalCleanSheets}
          />
        </Example>
      </CarouselContent>
      {/* Only show carousel arrows on desktop */}
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};
