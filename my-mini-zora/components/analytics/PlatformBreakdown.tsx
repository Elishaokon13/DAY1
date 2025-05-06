import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PlatformData {
  totalEarnings: string;
  averageEarning: string;
  collectors: number;
  traders: number;
}

interface RodeoData extends PlatformData {
  totalPosts: number;
}

interface PlatformBreakdownProps {
  zora: PlatformData;
  rodeo: RodeoData;
  className?: string;
}

// Interface for tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

export function PlatformBreakdown({ zora, rodeo, className = '' }: PlatformBreakdownProps) {
  // Format data for the earnings comparison chart
  const earningsData = [
    {
      name: 'Zora',
      earnings: parseFloat(zora.totalEarnings),
      average: parseFloat(zora.averageEarning),
    },
    {
      name: 'Rodeo',
      earnings: parseFloat(rodeo.totalEarnings),
      average: parseFloat(rodeo.averageEarning),
    },
  ];

  // Format data for the community comparison chart
  const communityData = [
    {
      name: 'Zora',
      collectors: zora.collectors,
      traders: zora.traders,
    },
    {
      name: 'Rodeo',
      collectors: rodeo.collectors,
      traders: rodeo.traders,
    },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--app-card-background)] p-3 border border-[var(--app-border)] rounded-md text-xs">
          <p className="font-bold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(2)} ${entry.name === 'Earnings' || entry.name === 'Average' ? 'ETH' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`bg-[var(--app-card-background)] p-5 rounded-lg shadow-sm border border-[var(--app-border)] ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Platform Breakdown</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Earnings comparison */}
        <div>
          <h4 className="text-sm font-medium text-[var(--app-foreground-muted)] mb-2">Earnings Comparison</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={earningsData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => 
                    value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(1)
                  } 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="earnings" 
                  name="Earnings" 
                  fill="var(--app-accent)" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="average" 
                  name="Average" 
                  fill="#4ade80" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Community comparison */}
        <div>
          <h4 className="text-sm font-medium text-[var(--app-foreground-muted)] mb-2">Community Comparison</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={communityData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="collectors" 
                  name="Collectors" 
                  fill="var(--app-accent)" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="traders" 
                  name="Traders" 
                  fill="#4ade80" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Platform stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Zora</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--app-background)] p-3 rounded-md">
              <div className="text-xs text-[var(--app-foreground-muted)] mb-1">Total Earnings</div>
              <div className="text-lg font-bold">{parseFloat(zora.totalEarnings).toFixed(2)} ETH</div>
            </div>
            <div className="bg-[var(--app-background)] p-3 rounded-md">
              <div className="text-xs text-[var(--app-foreground-muted)] mb-1">Average Per Sale</div>
              <div className="text-lg font-bold">{parseFloat(zora.averageEarning).toFixed(2)} ETH</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Rodeo</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--app-background)] p-3 rounded-md">
              <div className="text-xs text-[var(--app-foreground-muted)] mb-1">Total Earnings</div>
              <div className="text-lg font-bold">{parseFloat(rodeo.totalEarnings).toFixed(2)} ETH</div>
            </div>
            <div className="bg-[var(--app-background)] p-3 rounded-md">
              <div className="text-xs text-[var(--app-foreground-muted)] mb-1">Posts</div>
              <div className="text-lg font-bold">{rodeo.totalPosts}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 