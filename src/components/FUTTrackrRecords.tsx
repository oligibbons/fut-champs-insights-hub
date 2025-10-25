import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAccountData } from '@/hooks/useAccountData';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, TrendingUp, BarChart2, Zap, Trophy, Goal, HeartPulse, ShieldCheck, Flame, ShieldOff, Star, Repeat } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from '@/components/ui/card';

// --- VISUAL FIX: Updated RecordItem Styling ---
const RecordItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => {
  const { currentTheme } = useTheme();
  return (
    <Card
      className="border-0 shadow-lg overflow-hidden rounded-xl glass-card-content" // Use new class
      style={{
        backgroundColor: `${currentTheme.colors.cardBg}E6`, // Example: 90% opacity
        borderColor: currentTheme.colors.border,
        // backdropFilter: 'blur(8px)',
      }}
    >
      <CardContent className="p-4 flex items-center space-x-3">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: currentTheme.colors.surface }} // Icon background
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" // Uppercase title
             style={{ color: currentTheme.colors.muted }}>
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight" // Larger, bolder value
             style={{ color: currentTheme.colors.text }}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
// --- END VISUAL FIX ---

export const FUTTrackrRecords = () => {
  const { weeklyData = [], loading } = useAccountData() || {};
  const stats = useDashboardStats(weeklyData);
  const { currentTheme } = useTheme();

  if (loading) {
    // Skeletons remain the same
     return (
      <div className="flex space-x-4 overflow-x-auto pb-4"> {/* Added overflow for safety */}
        <Skeleton className="h-24 w-full min-w-64 rounded-xl flex-shrink-0" />
        <Skeleton className="h-24 w-full min-w-64 rounded-xl flex-shrink-0" />
        <Skeleton className="h-24 w-full min-w-64 rounded-xl flex-shrink-0" />
      </div>
    );
  }

  if (weeklyData.length === 0) {
      // No data state remains the same
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

  // Carousel structure remains the same, but uses the updated RecordItem
  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
        dragFree: true, // Allow free scrolling like mobile apps
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        <CarouselItem className="pl-4 basis-auto md:basis-1/2 lg:basis-1/3"> {/* Use basis-auto for natural sizing */}
          <RecordItem
            icon={<Trophy className="h-5 w-5 text-yellow-500" />}
            label="Best Record"
            value={`${stats.bestRecord} Wins`}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
            label="Average Wins"
            value={stats.averageWins.toFixed(1)}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<Flame className="h-5 w-5 text-orange-500" />}
            label="Longest Win Streak"
            value={stats.longestWinStreak}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<Goal className="h-5 w-5 text-green-500" />}
            label="Most Goals (Run)"
            value={stats.mostGoalsInRun}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<BarChart2 className="h-5 w-5 text-purple-500" />}
            label="Goal Difference"
            value={stats.overallGoalDifference > 0 ? `+${stats.overallGoalDifference}` : stats.overallGoalDifference}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<Star className="h-5 w-5 text-pink-500" />}
            label="Club MVP"
            value={stats.mvp}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<Award className="h-5 w-5 text-red-500" />}
            label="Avg Player Rating"
            value={stats.averagePlayerRating.toFixed(2)}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<ShieldCheck className="h-5 w-5 text-teal-500" />}
            label="Discipline"
            value={stats.disciplineIndex}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<Repeat className="h-5 w-5 text-gray-500" />}
            label="Avg Possession"
            value={`${stats.averagePossession.toFixed(0)}%`}
          />
        </CarouselItem>
        <CarouselItem className="pl-4 basis-auto md:basis-1/2 lg:basis-1/3">
          <RecordItem
            icon={<ShieldOff className="h-5 w-5 text-green-600" />}
            label="Total Clean Sheets"
            value={stats.totalCleanSheets}
          />
        </CarouselItem>
      </CarouselContent>
      {/* Conditionally hide arrows if not needed or on mobile? For now, keep as desktop only */}
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};

// Default export might be needed if FUTTrackrRecords is the main export
// export default FUTTrackrRecords;
