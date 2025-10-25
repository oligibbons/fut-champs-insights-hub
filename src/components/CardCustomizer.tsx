import React from 'react';
import { Switch } from '@/components/ui/switch'; //
import { Label } from '@/components/ui/label'; //
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'; //
import { CardOptions, availableMetrics } from './ShareableCardGenerator'; // Import shared types

interface CardCustomizerProps {
  options: CardOptions;
  onChange: (optionKey: keyof CardOptions, value: boolean) => void;
  availableMetrics: typeof availableMetrics; // Use the defined list
  cardType: 'run' | 'overall';
}

const CardCustomizer: React.FC<CardCustomizerProps> = ({ options, onChange, availableMetrics, cardType }) => {

  // Group metrics by their 'group' property
  const groupedMetrics = availableMetrics.reduce((acc, metric) => {
    const group = metric.group || 'Other';
    if (!acc[group]) {
      acc[group] = [];
    }
    // --- TODO: Add logic here to disable metrics irrelevant to cardType ---
    // Example: Disable 'showBestRank' if cardType is 'run'
    // metric.disabled = (cardType === 'run' && metric.id === 'showBestRank');
    acc[group].push(metric);
    return acc;
  }, {} as Record<string, typeof availableMetrics>);

  return (
    <Accordion type="multiple" defaultValue={Object.keys(groupedMetrics)} className="w-full">
      {Object.entries(groupedMetrics).map(([groupName, metrics]) => (
        <AccordionItem value={groupName} key={groupName}>
          <AccordionTrigger className="text-base font-semibold">{groupName}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {metrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-muted/50">
                  <Label htmlFor={metric.id} className="text-sm cursor-pointer">
                    {metric.label}
                  </Label>
                  <Switch
                    id={metric.id}
                    checked={options[metric.id as keyof CardOptions]}
                    onCheckedChange={(checked) => onChange(metric.id as keyof CardOptions, checked)}
                    // disabled={metric.disabled} // Optional: Add disabled logic
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
