import { FutChampsWeek } from '@/types/futChampions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, BarChart2 } from 'lucide-react';

interface RunCardProps {
  run: FutChampsWeek;
  onSelectRun: (runId: string) => void;
  onDeleteRun?: (runId: string) => void; // Optional for completed runs
}

const RunCard = ({ run, onSelectRun, onDeleteRun }: RunCardProps) => {
  return (
    <Card className="flex flex-col justify-between hover:border-primary/50 transition-all">
      <CardHeader>
        <CardTitle>{run.custom_name || `Week ${run.week_number}`}</CardTitle>
        <p className="text-sm text-muted-foreground">{new Date(run.start_date).toLocaleDateString()}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-2xl font-bold">
          <span>{run.total_wins}W - {run.total_losses}L</span>
          <span className="text-sm font-normal text-muted-foreground">
            {(((run.total_wins || 0) / ((run.total_wins || 0) + (run.total_losses || 0) || 1)) * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex gap-2">
            <Button size="sm" className="w-full" onClick={() => onSelectRun(run.id)}>
                <BarChart2 className="mr-2 h-4 w-4" /> View Details
            </Button>
            {onDeleteRun && (
                <Button size="sm" variant="outline" onClick={() => onDeleteRun(run.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RunCard;
