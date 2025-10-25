import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RecordCardProps {
  id: string;
  title: string;
  value: string | number;
  tooltip: string;
  trend: 'up' | 'down' | 'neutral';
}

export function RecordCard({ id, title, value, tooltip, trend }: RecordCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const trendIcon = {
    up: <ArrowUp className="text-green-500" />,
    down: <ArrowDown className="text-red-500" />,
    neutral: <Minus className="text-gray-500" />,
  }[trend];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-4 flex flex-col justify-between touch-none",
        "shimmer-effect glow-effect"
      )}
    >
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger onClick={(e) => e.preventDefault()}>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex justify-between items-end mt-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {trendIcon}
      </div>
    </div>
  );
}
