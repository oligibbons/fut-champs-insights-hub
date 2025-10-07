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
  
  if (isEnabled === false) {
    return null;
  }
  
  // We apply the glass-card style directly to this wrapper div.
  // The p-6 class adds padding inside the card.
  return <div className="glass-card p-6">{children}</div>;
};

export default DashboardSection;
