import { ReactNode } from 'react';
import { useDataSync } from '@/hooks/useDataSync.tsx'; // Ensure path ends with .tsx

interface DashboardSectionProps {
  settingKey: string;
  settingsSection?: 'dashboardSettings' | 'currentWeekSettings';
  children: ReactNode;
}

const DashboardSection = ({ 
  settingKey, 
  settingsSection = 'dashboardSettings', 
  children 
}: DashboardSectionProps) => {
  const { settings } = useDataSync();
  
  const sectionSettings = settings[settingsSection as keyof typeof settings] || {};
  const isEnabled = sectionSettings[settingKey as keyof typeof sectionSettings];
  
  if (isEnabled === false) {
    return null;
  }
  
  return (
    <div className="p-6 bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
      {children}
    </div>
  );
};

export default DashboardSection;
