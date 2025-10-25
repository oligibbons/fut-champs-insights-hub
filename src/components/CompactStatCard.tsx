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
      // --- VISUAL FIX: Use cardBg with less transparency, enhance shadow ---
      className="border-0 shadow-lg overflow-hidden rounded-xl glass-card-content" // Added new class
      style={{
        // Use cardBg but make it less transparent (adjust alpha as needed, e.g., 'E6' for 90%)
        backgroundColor: `${currentTheme.colors.cardBg}E6`, // Example: 90% opacity
        borderColor: currentTheme.colors.border,
        // backdropFilter: 'blur(8px)', // Keep or adjust blur if needed
      }}
    >
      <CardContent className="p-4 flex items-center space-x-3">
        <div
          className="p-3 rounded-lg"
          // --- VISUAL FIX: Use surface for subtle icon background contrast ---
          style={{ backgroundColor: currentTheme.colors.surface }}
        >
          {/* Ensure icon color contrasts well */}
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" // Uppercase for style
             style={{ color: currentTheme.colors.muted }}>
            {title}
          </p>
          {/* --- VISUAL FIX: Significantly larger and bolder value --- */}
          <p className="text-2xl font-bold tracking-tight" // Bolder and tighter tracking
             style={{ color: currentTheme.colors.text }}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactStatCard;
