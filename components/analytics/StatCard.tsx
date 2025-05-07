import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, subtext, icon, trend }: StatCardProps) {
  return (
    <div className="bg-[var(--app-card-background)] p-6 rounded-xl shadow-sm border border-[var(--app-border)] hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="text-sm font-medium text-[var(--app-foreground-muted)] tracking-wide">{title}</div>
        {icon && (
          <div className="text-[var(--app-accent)] bg-[var(--app-accent-translucent)] p-2 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold mb-2 tracking-tight">{value}</div>
      
      {(subtext || trend) && (
        <div className="flex items-center mt-auto text-sm">
          {trend && (
            <span 
              className={`flex items-center font-medium mr-3 ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              <span className="mr-1">{trend.isPositive ? '↑' : '↓'}</span>
              {trend.value}%
            </span>
          )}
          
          {subtext && (
            <span className="text-[var(--app-foreground-muted)]">{subtext}</span>
          )}
        </div>
      )}
    </div>
  );
} 