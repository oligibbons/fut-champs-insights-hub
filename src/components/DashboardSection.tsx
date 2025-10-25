import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ title, children }) => {
  const { currentTheme } = useTheme();

  return (
    <Card
      // --- MODIFIED: Added border-4, removed border-0, and set themed borderColor in style ---
      className="shadow-xl overflow-hidden rounded-2xl glass-card border-4"
      style={{
        backgroundColor: currentTheme.colors.surface,
        borderColor: 'hsl(var(--primary) / 0.2)', // Use primary theme color with 20% opacity
      }}
      // --- END MODIFIED ---
    >
      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-4"
        // --- MODIFIED: Thicker borderBottom ---
        style={{ borderBottom: `2px solid ${currentTheme.colors.border}` }}
        // --- END MODIFIED ---
      >
        <CardTitle
          // --- VISUAL FIX: Larger, bolder title ---
          className="text-xl font-semibold tracking-tight" // Increased size and tracking
          style={{ color: currentTheme.colors.text }}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardSection;
