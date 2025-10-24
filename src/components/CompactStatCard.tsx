import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';

interface CompactStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const CompactStatCard = ({ title, value, icon }: CompactStatCardProps) => {
  const { currentTheme } = useTheme();

  return (
    <Card 
      // --- FIX: Apply lighter shadow and specific background ---
      className="border-0 shadow-lg overflow-hidden rounded-xl" // Use rounded-xl for inner cards
      style={{ 
        backgroundColor: currentTheme.colors.cardBg, // Use 'cardBg' for inner content cards
        borderColor: currentTheme.colors.border
      }}
    >
      <CardContent className="p-4 flex items-center space-x-3">
        <div 
          className="p-3 rounded-lg"
          // --- FIX: Use surface for the icon background for subtle contrast ---
          style={{ backgroundColor: currentTheme.colors.surface }} 
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: currentTheme.colors.muted }}>
            {title}
          </p>
          <p className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactStatCard;
