import { Insight } from '@/utils/aiInsights';
import { CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PrimaryInsightCardProps {
  insight: Insight | null;
}

/**
 * A dedicated card to display the single, highest-priority AI insight on the main dashboard.
 */
const PrimaryInsightCard = ({ insight }: PrimaryInsightCardProps) => {
  // Renders a placeholder state if no insights are available yet.
  if (!insight) {
    return (
      <div className="primary-insight-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Your Primary Insight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Play at least 5 games and generate an analysis on the AI Insights page to see your top priority focus here.
          </p>
        </CardContent>
        <CardFooter>
           <Button asChild className="w-full" variant="outline">
             <Link to="/ai-insights">
               Go to AI Insights
               <ArrowRight className="h-4 w-4 ml-2" />
             </Link>
           </Button>
        </CardFooter>
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
    <div className="primary-insight-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
             <Lightbulb className="h-5 w-5 text-primary" />
             Your Top Priority Insight
          </span>
           <span className={`text-sm font-semibold capitalize ${
             insight.category === 'strength' ? 'text-green-400' :
             insight.category === 'weakness' ? 'text-red-400' :
             'text-blue-400'
           }`}>
            {insight.category}
           </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-start gap-4">
        <div className="mt-1">
          {getInsightIcon(insight.category)}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">{insight.title}</h3>
          <p className="text-muted-foreground">
            {insight.description}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to="/ai-insights">
            View Full Analysis & Generate New Insights
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </div>
  );
};

export default PrimaryInsightCard;
