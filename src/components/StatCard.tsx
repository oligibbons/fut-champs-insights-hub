
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number;
  subtitle?: string;
  className?: string;
}

const StatCard = ({ title, value, icon, trend, subtitle, className = '' }: StatCardProps) => {
  return (
    <Card className={`stat-card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-fifa-blue/20 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      
      {trend !== undefined && (
        <div className="mt-4 flex items-center">
          <span className={`text-xs font-medium ${
            trend > 0 ? 'text-fifa-green' : trend < 0 ? 'text-fifa-red' : 'text-gray-400'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-xs text-gray-500 ml-1">vs last week</span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
