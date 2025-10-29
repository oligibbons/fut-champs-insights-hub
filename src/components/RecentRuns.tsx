import { useAccountData } from '@/hooks/useAccountData';
import { WeeklyPerformance } from '@/types/futChampions';
import RunCard from '@/components/RunCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme';
import { Gamepad2 } from 'lucide-react'; // Example icon

const RecentRuns = () => {
  // 1. Fetch data directly, just like the other dashboard components
  const { weeklyData = [], loading } = useAccountData() || {};
  const { currentTheme } = useTheme();

  // 2. Filter for completed weeks and sort them (most recent first)
  const completedRuns = weeklyData
    .filter(week => week.isCompleted)
    .sort((a, b) => b.weekNumber - a.weekNumber);

  // 3. Show skeletons while data is loading
  if (loading) {
    return (
      <div className="flex space-x-4">
        <Skeleton className="h-48 w-full min-w-80 rounded-2xl" />
        <Skeleton className="h-48 w-full min-w-80 rounded-2xl hidden md:block" />
        <Skeleton className="h-48 w-full min-w-80 rounded-2xl hidden lg:block" />
      </div>
    );
  }

  // 4. Show a "no runs" message if there's no data
  if (completedRuns.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center p-8 rounded-2xl"
        style={{ backgroundColor: currentTheme.colors.surface }}
      >
        <Gamepad2 className="h-12 w-12 mb-4" style={{ color: currentTheme.colors.muted }} />
        <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>No Completed Runs</h3>
        <p style={{ color: currentTheme.colors.muted }}>
          Complete a FUT Champs run to see it here.
        </p>
      </div>
    );
  }

  // 5. Render the new Carousel layout
  return (
    <Carousel 
      opts={{
        align: "start",
        loop: false,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {completedRuns.map((run) => (
          
          // --- THIS IS THE FIX ---
          // Changed md:basis-1/2 lg:basis-1/3
          // to lg:basis-1/2 xl:basis-1/3
          // This stops the carousel from showing 2 items on tablets.
          <CarouselItem key={run.weekId} className="pl-4 lg:basis-1/2 xl:basis-1/3">
            <RunCard week={run} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* Only show carousel arrows on desktop */}
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};

export default RecentRuns;