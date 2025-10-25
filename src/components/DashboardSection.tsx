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
      className="border-0 shadow-xl overflow-hidden rounded-2xl glass-card"
      style={{
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border,
      }}
    >
      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-4"
        style={{ borderBottom: `1px solid ${currentTheme.colors.border}` }}
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
