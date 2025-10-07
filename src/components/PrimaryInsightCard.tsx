import { Insight } from '@/utils/aiInsights';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PrimaryInsightCardProps {
  insight: Insight | null;
}

const PrimaryInsightCard = ({ insight }: PrimaryInsightCardProps) => {
  // Renders a placeholder state if no insights are available yet.
  if (!insight) {
    return (
      <div className="p-6 bg-card/60 backdrop-blur-xl border-2 border-primary/30 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Your Primary Insight</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Play at least 5 games and generate an analysis on the AI Insights page to see your top priority focus here.
        </p>
        <Button asChild className="w-full" variant="outline">
          <Link to="/ai-insights">
            Go to AI Insights
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    );
  }

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'strength': return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'weakness': return <AlertTriangle className="h-8 w-8 text-red-500" />;
      case 'opportunity': return <TrendingUp className="h-8 w-8 text-blue-500" />;
      default: return <Lightbulb className="h-8 w-8 text-yellow-500" />;
    }
  };

  return (
    <div className="p-6 bg-card/60 backdrop-blur-xl border-2 border-primary/30 rounded-2xl shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 font-semibold">
           <Lightbulb className="h-5 w-5 text-primary" />
           Your Top Priority Insight
        </span>
         <span className={`text-sm font-semibold capitalize px-2 py-1 rounded-md ${
           insight.category === 'strength' ? 'text-green-400 bg-green-500/10' :
           insight.category === 'weakness' ? 'text-red-400 bg-red-500/10' :
           'text-blue-400 bg-blue-500/10'
         }`}>
          {insight.category}
         </span>
      </div>
      <div className="flex items-start gap-4">
        <div className="mt-1">
          {getInsightIcon(insight.category)}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">{insight.title}</h3>
          <p className="text-muted-foreground">
            {insight.description}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Button asChild className="w-full">
          <Link to="/ai-insights">
            View Full Analysis & Generate New Insights
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PrimaryInsightCard;
