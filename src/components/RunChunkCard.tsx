// src/components/RunChunkCard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChunkRecord } from '@/utils/runAnalytics';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface RunChunkCardProps {
  title: string;
  stats: ChunkRecord | null;
  runName?: string | null;
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
  const cardClasses = cn(
    'flex flex-col justify-between',
    onClick && 'cursor-pointer hover:border-primary/50 transition-colors'
  );

  if (isLoading) {
    return (
      <Card className={cardClasses}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
        {runName !== undefined && (
          <CardFooter className="pt-2 pb-4">
            <Skeleton className="h-4 w-32" />
          </CardFooter>
        )}
      </Card>
    );
  }

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
        {runName !== undefined && (
          <CardFooter className="pt-2 pb-4">
            <p className="text-xs text-muted-foreground truncate italic">N/A</p>
          </CardFooter>
        )}
      </Card>
    );
  }

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
        <div className="flex items-center text-xs text-muted-foreground space-x-2">
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
      {runName !== undefined && (
        <CardFooter className="pt-2 pb-4">
          <p className="text-xs text-muted-foreground truncate italic">
            {runName ? `from: ${runName}` : '...'}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};
