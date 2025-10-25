import React from 'react';
import { Switch } from '@/components/ui/switch'; //
import { Label } from '@/components/ui/label'; //
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'; //
import { CardOptions, MetricDefinition } from './ShareableCardGenerator'; // Import shared types

interface CardCustomizerProps {
  options: CardOptions;
  onChange: (optionKey: keyof CardOptions, value: boolean) => void;
  availableMetrics: MetricDefinition[];
  cardType: 'run' | 'overall';
}

const CardCustomizer: React.FC<CardCustomizerProps> = ({ options, onChange, availableMetrics, cardType }) => {

  // Group metrics and filter based on cardType
  const groupedMetrics = availableMetrics.reduce((acc, metric) => {
    // Determine if the metric should be shown for the current card type
    const isRelevant = !( (cardType === 'run' && metric.overallOnly) || (cardType === 'overall' && metric.runOnly) );

    if (isRelevant) {
        const group = metric.group || 'Other';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(metric);
    }
    return acc;
  }, {} as Record<string, MetricDefinition[]>);

  // Define the order of groups
  const groupOrder: (keyof typeof groupedMetrics)[] = [
    'General',
    'Team Stats',
    'Player Stats',
    'Streaks & Records',
    'Analysis',
    'Overall Profile',
    // Add 'Other' if it exists, or any other custom groups
  ].filter(group => groupedMetrics[group]); // Only include groups that have relevant metrics

  return (
    <Accordion type="multiple" defaultValue={groupOrder} className="w-full">
      {groupOrder.map((groupName) => (
        <AccordionItem value={groupName} key={groupName}>
          <AccordionTrigger className="text-base font-medium hover:no-underline px-1"> {/* Adjust padding/style */}
            {groupName}
          </AccordionTrigger>
          <AccordionContent className="pt-0"> {/* Remove top padding */}
            <div className="space-y-3 pt-2"> {/* Adjust spacing */}
              {groupedMetrics[groupName].map((metric) => (
                <div key={metric.id} className="flex items-center justify-between space-x-2 px-1 py-1.5 rounded-md hover:bg-muted/30"> {/* Adjust padding/hover */}
                  <Label htmlFor={metric.id} className="text-sm font-normal cursor-pointer flex-1 mr-2"> {/* Allow wrapping */}
                    {metric.label}
                  </Label>
                  <Switch
                    id={metric.id}
                    checked={options[metric.id]}
                    onCheckedChange={(checked) => onChange(metric.id, checked)}
                    className="flex-shrink-0" // Prevent switch from shrinking
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default CardCustomizer;
