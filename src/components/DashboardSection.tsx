import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';
import { GripVertical } from 'lucide-react'; // Import a drag handle icon

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>; // Accept drag handle props
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ title, children, dragHandleProps }) => {
  const { currentTheme } = useTheme();

  return (
    <Card
      className="border-0 shadow-lg overflow-hidden" // Added overflow-hidden for potential child issues
      style={{
        backgroundColor: currentTheme.colors.cardBg,
        borderColor: currentTheme.colors.border,
      }}
    >
      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-4"
        style={{ borderBottom: `1px solid ${currentTheme.colors.border}` }}
      >
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {/* Apply dragHandleProps to this div if they exist */}
        {dragHandleProps && (
           <div {...dragHandleProps} className="cursor-grab text-muted-foreground hover:text-foreground p-1">
              <GripVertical size={18} />
           </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardSection;
