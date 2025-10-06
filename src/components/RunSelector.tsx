import { FutChampsWeek } from '@/types/futChampions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlusCircle, ArrowRight } from 'lucide-react';
import RunCard from './RunCard';

interface RunSelectorProps {
  runs: FutChampsWeek[];
  onSelectRun: (runId: string) => void;
  onStartNewRun: () => void;
}

const RunSelector = ({ runs, onSelectRun, onStartNewRun }: RunSelectorProps) => {
  const activeRun = runs.find(r => !r.is_completed);
  const completedRuns = runs.filter(r => r.is_completed);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">FUT Champs Tracker</h1>
        <p className="text-muted-foreground max-w-2xl">
          Welcome to your command center. Select an active run to continue tracking, review a completed run, or start a new journey to glory.
        </p>
      </div>

      {activeRun && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Active Run</h2>
          <Card 
            className="p-6 bg-secondary border-primary/20 hover:bg-primary/5 transition-all cursor-pointer"
            onClick={() => onSelectRun(activeRun.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{activeRun.custom_name || `Week ${activeRun.week_number}`}</h3>
                <p className="text-sm text-muted-foreground">{activeRun.total_wins}W - {activeRun.total_losses}L</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-primary font-semibold">Continue Run</p>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Run History</h2>
        {completedRuns.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedRuns.map(run => (
              <RunCard key={run.id} run={run} onSelectRun={onSelectRun} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No completed runs for this game version yet.</p>
          </div>
        )}
      </div>

       <div className="text-center pt-6">
        <Button size="lg" onClick={onStartNewRun}>
          <PlusCircle className="mr-2 h-5 w-5" /> Start New Run
        </Button>
      </div>
    </div>
  );
};

export default RunSelector;
