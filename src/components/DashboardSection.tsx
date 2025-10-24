import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';
// Removed GripVertical as drag-and-drop is currently disabled

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
  // dragHandleProps?: React.HTMLAttributes<HTMLDivElement>; // Removed drag handle props
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ title, children /*, dragHandleProps */ }) => {
  const { currentTheme } = useTheme();

  return (
    <Card
      // --- FIX: Apply stronger shadow and specific background ---
      className="border-0 shadow-xl overflow-hidden rounded-2xl glass-card" // Ensure rounded corners and glass effect
      style={{
        backgroundColor: currentTheme.colors.surface, // Use 'surface' for the main section card
        borderColor: currentTheme.colors.border,
      }}
    >
      <CardHeader
        // --- FIX: Add padding and consistent styling ---
        className="flex flex-row items-center justify-between space-y-0 p-4" // Use p-4 consistently
        style={{ borderBottom: `1px solid ${currentTheme.colors.border}` }}
      >
        <CardTitle 
          className="text-lg font-semibold" 
          style={{ color: currentTheme.colors.text }} // Ensure title uses theme text color
        >
            {title}
        </CardTitle>
        {/* Removed drag handle div */}
      </CardHeader>
      <CardContent className="p-4"> 
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardSection;
