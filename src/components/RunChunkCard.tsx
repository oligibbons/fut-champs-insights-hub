// src/components/RunChunkCard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChunkRecord } from '@/utils/runAnalytics';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface RunChunkCardProps {
  title: string;
  stats: ChunkRecord | null; // Can receive null
  runName?: string | null; // Can receive null or undefined
  onClick?: () => void;
  isLoading?: boolean;
}

export const RunChunkCard: React.FC<RunChunkCardProps> = ({
  title,
  stats,
  runName, // Can be null (for current) or '...' (for loading best/worst) or actual name
  onClick,
  isLoading,
}) => {
  // Determine if the footer should be rendered
  const showFooter = runName !== undefined && runName !== null;

  const cardClasses = cn(
    'flex flex-col justify-between text-center sm:text-left', // Center text on mobile
    onClick && 'cursor-pointer hover:border-primary/50 transition-colors'
  );

  if (isLoading) {
    return (
      <Card className={cardClasses}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <Skeleton className="h-8 w-16 sm:w-20 mb-2 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-20 sm:w-24 mx-auto sm:mx-0" />
        </CardContent>
        {showFooter && (
          <CardFooter className="pt-2 pb-4 justify-center sm:justify-start">
            <Skeleton className="h-4 w-24 sm:w-32" />
          </CardFooter>
        )}
      </Card>
    );
  }

  // Handle case where stats are null or gameCount is 0 after loading
  if (!stats || stats.gameCount === 0) {
    return (
      <Card className={cardClasses}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-2xl font-bold text-muted-foreground">-</p>
          <p className="text-xs text-muted-foreground">No games played</p>
        </CardContent>
        {/* Show footer even if no stats, but indicate N/A */}
        {showFooter && (
           <CardFooter className="pt-2 pb-4 justify-center sm:justify-start">
             {/* Use runName if available (might be '...'), otherwise 'N/A' */}
             <p className="text-xs text-muted-foreground truncate italic">
               {runName ? (runName === '...' ? runName : `from: ${runName}`) : 'N/A'}
             </p>
           </CardFooter>
        )}
      </Card>
    );
  }

  // If stats are valid
  const { wins, losses, goalsFor, goalsAgainst } = stats;
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
      <CardContent className="flex-1">
        <p className="text-2xl font-bold">{`${wins} - ${losses}`}</p>
        <div className="flex items-center justify-center sm:justify-start text-xs text-muted-foreground space-x-2">
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
      {/* Footer only shown if runName is provided (i.e., for best/worst) */}
      {showFooter && (
        <CardFooter className="pt-2 pb-4 justify-center sm:justify-start">
          <p className="text-xs text-muted-foreground truncate italic">
             {/* Show '...' if loading, otherwise format name */}
             {runName === '...' ? runName : `from: ${runName}`}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};
