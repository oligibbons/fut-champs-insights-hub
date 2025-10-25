import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { cn } from "@/lib/utils"; // Import cn utility

interface CompactStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColorClass?: string; // Add optional prop for color class
}

const CompactStatCard = ({ title, value, icon, iconColorClass = "text-primary" }: CompactStatCardProps) => {
  const { currentTheme } = useTheme();

  return (
    <Card
      className="border-0 shadow-lg overflow-hidden rounded-xl glass-card-content"
      style={{
        backgroundColor: `${currentTheme.colors.cardBg}E6`,
        borderColor: currentTheme.colors.border,
      }}
    >
      <CardContent className="p-4 flex items-center space-x-3">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: currentTheme.colors.surface }}
        >
          {/* --- VISUAL FIX: Apply color class directly to icon --- */}
          <span className={cn("h-5 w-5", iconColorClass)}> {/* Apply size and color */}
             {icon}
          </span>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider"
             style={{ color: currentTheme.colors.muted }}>
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight"
             style={{ color: currentTheme.colors.text }}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactStatCard;
