// src/components/RunChunkCard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChunkRecord } from '@/utils/runAnalytics';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface RunChunkCardProps {
  title: string;
  stats: ChunkRecord | null; // Can receive null
  runName?: string | null; // Can receive null, undefined, or '...'
  onClick?: () => void;
  isLoading?: boolean;
}

export const RunChunkCard: React.FC<RunChunkCardProps> = ({
  title,
  stats,
  runName,
  onClick,
  isLoading,
}) => {
  // Determine if the footer should be rendered (only if runName is provided and not null)
  const showFooter = runName !== undefined && runName !== null;

  const cardClasses = cn(
    'flex flex-col justify-between text-center sm:text-left h-full', // Ensure consistent height
    onClick && 'cursor-pointer hover:border-primary/50 transition-colors'
  );

  // --- Loading State ---
  if (isLoading) {
    return (
      <Card className={cardClasses}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center sm:items-start justify-center">
          <Skeleton className="h-8 w-16 sm:w-20 mb-2" />
          <Skeleton className="h-4 w-20 sm:w-24" />
        </CardContent>
        {/* Show skeleton footer only if a runName is expected */}
        {showFooter && (
          <CardFooter className="pt-2 pb-4 justify-center sm:justify-start">
            <Skeleton className="h-4 w-24 sm:w-32" />
          </CardFooter>
        )}
      </Card>
    );
  }

  // --- No Stats State (after loading) ---
  if (!stats || stats.gameCount === 0) {
    return (
      <Card className={cardClasses}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center sm:items-start justify-center">
          <p className="text-2xl font-bold text-muted-foreground">-</p>
          <p className="text-xs text-muted-foreground">No games played</p>
        </CardContent>
        {/* Show footer even if no stats, but indicate N/A or '...' */}
        {showFooter && (
           <CardFooter className="pt-2 pb-4 justify-center sm:justify-start">
             <p className="text-xs text-muted-foreground truncate italic">
               {/* Display '...' if runName indicates loading, else 'N/A' */}
               {runName === '...' ? runName : 'N/A'}
             </p>
           </CardFooter>
        )}
      </Card>
    );
  }

  // --- Valid Stats State ---
  // Safely access stats properties, default to 0 if somehow undefined/null
  const wins = stats.wins ?? 0;
  const losses = stats.losses ?? 0;
  const goalsFor = stats.goalsFor ?? 0;
  const goalsAgainst = stats.goalsAgainst ?? 0;
  const goalDiff = goalsFor - goalsAgainst;
  const gdColor =
    goalDiff > 0
      ? 'text-green-500'
      : goalDiff < 0
      ? 'text-red-500'
      : 'text-muted-foreground';

  return (
    <Card className={cardClasses} onClick={onClick}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1"> {/* Removed justify-center for top alignment */}
        <p className="text-2xl font-bold">{`${wins} - ${losses}`}</p>
        <div className="flex items-center justify-center sm:justify-start text-xs text-muted-foreground space-x-2 mt-1">
          <span className="flex items-center">
            <ArrowUp className="h-3 w-3 text-green-500 mr-0.5" /> {goalsFor}
          </span>
          <span className="flex items-center">
            <ArrowDown className="h-3 w-3 text-red-500 mr-0.5" /> {goalsAgainst}
          </span>
          <span className={cn('font-medium', gdColor)}>
            GD: {goalDiff > 0 ? '+' : ''}
            {goalDiff}
          </span>
        </div>
      </CardContent>
      {/* Footer only shown if runName is provided and valid */}
      {showFooter && runName !== '...' && (
        <CardFooter className="pt-2 pb-4 justify-center sm:justify-start">
          <p className="text-xs text-muted-foreground truncate italic">
             {`from: ${runName}`}
          </p>
        </CardFooter>
      )}
       {/* Footer for '...' loading state */}
       {showFooter && runName === '...' && (
         <CardFooter className="pt-2 pb-4 justify-center sm:justify-start">
             <p className="text-xs text-muted-foreground truncate italic">...</p>
         </CardFooter>
       )}
    </Card>
  );
};
