
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
  
  if (!isEnabled) {
    return null;
  }
  
  return <>{children}</>;
};

export default DashboardSection;
