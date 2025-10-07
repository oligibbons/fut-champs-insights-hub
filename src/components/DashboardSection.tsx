import { ReactNode } from 'react';
import { useDataSync } from '@/hooks/useDataSync';

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
  
  const sectionSettings = settings[settingsSection] || {};
  const isEnabled = sectionSettings[settingKey as keyof typeof sectionSettings];
  
  // Default to true if setting doesn't exist
  if (isEnabled === undefined) {
    return <div className="glass-card p-6">{children}</div>;
  }
  
  if (!isEnabled) {
    return null;
  }
  
  return <div className="glass-card p-6">{children}</div>;
};

export default DashboardSection;
