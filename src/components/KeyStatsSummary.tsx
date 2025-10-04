import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Gamepad2, 
  Trophy, 
  ShieldOff, 
  Goal, 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft, 
  ShieldCheck 
} from "lucide-react";

interface Stats {
  totalGames?: number;
  totalWins?: number;
  winRate?: number;
  goalsScored?: number;
  goalsConceded?: number;
  avgGoalsScored?: number;
  avgGoalsConceded?: number;
  goalDifference?: number;
  cleanSheets?: number;
}

const KeyStatsSummary = ({ stats }: { stats: Stats | null }) => {
  const StatCard = ({ title, value, icon: Icon, suffix = '' }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value ?? 'N/A'}{suffix}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
      <StatCard title="Total Games" value={stats?.totalGames} icon={Gamepad2} />
      <StatCard title="Total Wins" value={stats?.totalWins} icon={Trophy} />
      <StatCard title="Win Rate" value={stats?.winRate?.toFixed(1)} icon={BarChart} suffix="%" />

      <StatCard title="Goals Scored" value={stats?.goalsScored} icon={Goal} />
      <StatCard title="Goals Conceded" value={stats?.goalsConceded} icon={ShieldOff} />
      <StatCard title="Goal Difference" value={stats?.goalDifference} icon={ArrowRightLeft} />

      <StatCard title="Avg. Goals For" value={stats?.avgGoalsScored?.toFixed(2)} icon={TrendingUp} />
      <StatCard title="Avg. Goals Against" value={stats?.avgGoalsConceded?.toFixed(2)} icon={TrendingDown} />
      <StatCard title="Clean Sheets" value={stats?.cleanSheets} icon={ShieldCheck} />
    </div>
  );
};

export default KeyStatsSummary;

