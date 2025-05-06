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
    <div className="bg-[var(--app-card-background)] p-5 rounded-lg shadow-sm border border-[var(--app-border)] flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-medium text-[var(--app-foreground-muted)]">{title}</div>
        {icon && <div className="text-[var(--app-accent)]">{icon}</div>}
      </div>
      
      <div className="text-2xl font-bold mb-1">{value}</div>
      
      {(subtext || trend) && (
        <div className="flex items-center mt-auto text-xs">
          {trend && (
            <span 
              className={`flex items-center font-medium mr-2 ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
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