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

  // --- MODIFIED: Convert text color to border color ---
  const borderColorClass = iconColorClass.replace('text-', 'border-');
  // --- END MODIFIED ---

  return (
    <Card
      // --- MODIFIED: Apply dynamic border color and thickness ---
      className={cn(
        "shadow-lg overflow-hidden rounded-xl glass-card-content border-2", // Removed border-0, added border-2
        borderColorClass // Apply the dynamic border color
      )}
      style={{
        backgroundColor: `${currentTheme.colors.cardBg}E6`,
        // Removed static borderColor: currentTheme.colors.border,
      }}
      // --- END MODIFIED ---
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
