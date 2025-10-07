import { ReactNode } from 'react';

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
    <div className={`stat-card p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/80">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-primary/20 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      
      {trend !== undefined && (
        <div className="mt-4 flex items-center">
          <span className={`text-xs font-medium ${
            trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-xs text-muted-foreground/80 ml-1">vs last week</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
