import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { useLongPress } from '@/lib/utils';

interface DashboardSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ id, title, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const isMobile = useMobile();

  const longPressProps = useLongPress(() => {});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const mobileListeners = {
    ...listeners,
    ...longPressProps,
  };
  
  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden relative shimmer-effect glow-effect">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div {...attributes} {...(isMobile ? mobileListeners : listeners)} className="cursor-grab p-2">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardSection;
