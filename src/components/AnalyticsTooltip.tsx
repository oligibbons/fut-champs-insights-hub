
import { ReactNode } from 'react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface AnalyticsTooltipProps {
  children: ReactNode;
  title: string;
  description: string;
  showIcon?: boolean;
  delay?: number;
}

const AnalyticsTooltip = ({ 
  children, 
  title, 
  description, 
  showIcon = true, 
  delay = 2000 
}: AnalyticsTooltipProps) => {
  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            {children}
            {showIcon && <Info className="h-4 w-4 text-gray-400 opacity-60 hover:opacity-100 transition-opacity" />}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm bg-gray-900/95 border border-white/20 text-white">
          <div className="space-y-2">
            <p className="font-semibold text-fifa-blue">{title}</p>
            <p className="text-sm text-gray-200 leading-relaxed">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AnalyticsTooltip;
