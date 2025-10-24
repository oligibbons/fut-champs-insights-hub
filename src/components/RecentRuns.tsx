import { FutChampsWeek } from '@/types/futChampions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Calendar } from 'lucide-react';

interface RecentRunsProps {
  runs: FutChampsWeek[];
}

// FIX: Added ' = []' to default 'runs' to an empty array if it's undefined
const RecentRuns = ({ runs = [] }: RecentRunsProps) => {
  if (runs.length === 0) {
    return (
      <Card className="text-center">
        <CardContent className="p-8">
          <h3 className="text-lg font-semibold">No Recent Runs</h3>
          <p className="text-muted-foreground">You have not completed any FUT Champs runs for this game version yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Recent Runs</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {runs.map(run => (
            <Card key={run.id}>
            <CardHeader>
                <CardTitle>{run.custom_name || `Week ${run.week_number}`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center"><Trophy className="h-4 w-4 mr-2" /> Record</span>
                    <span>{run.total_wins} - {run.total_losses}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2" /> Date</span>
                    <span>{new Date(run.start_date).toLocaleDateString()}</span>
                </div>
            </CardContent>
            </Card>
        ))}
        </div>
    </div>
  );
};

export default RecentRuns;
