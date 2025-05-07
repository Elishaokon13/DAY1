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
  totalEarningsUSD?: string;
  averageEarning: string;
  averageEarningUSD?: string;
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
    payload: {
      earningsUSD?: number;
      averageUSD?: number;
    };
  }>;
  label?: string;
}

export function PlatformBreakdown({ zora, rodeo, className = '' }: PlatformBreakdownProps) {
  // Format data for the earnings comparison chart
  const earningsData = [
    {
      name: 'Zora',
      earnings: parseFloat(zora.totalEarnings),
      earningsUSD: zora.totalEarningsUSD ? parseFloat(zora.totalEarningsUSD) : undefined,
      average: parseFloat(zora.averageEarning),
      averageUSD: zora.averageEarningUSD ? parseFloat(zora.averageEarningUSD) : undefined,
    },
    {
      name: 'Rodeo',
      earnings: parseFloat(rodeo.totalEarnings),
      earningsUSD: rodeo.totalEarningsUSD ? parseFloat(rodeo.totalEarningsUSD) : undefined,
      average: parseFloat(rodeo.averageEarning),
      averageUSD: rodeo.averageEarningUSD ? parseFloat(rodeo.averageEarningUSD) : undefined,
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
          {payload.map((entry, index) => {
            const data = entry.payload;
            const usdValue = entry.name === 'Earnings' ? data.earningsUSD : data.averageUSD;
            return (
              <p key={`tooltip-${index}`} style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value.toFixed(2)} ZORA${usdValue ? ` ($${usdValue.toFixed(2)})` : ''}`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-[var(--app-card-background)] p-6 rounded-xl shadow-sm border border-[var(--app-border)] ${className}`}>
      <h3 className="text-xl font-semibold tracking-tight mb-6">Platform Breakdown</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Earnings comparison */}
        <div>
          <h4 className="text-sm font-medium text-[var(--app-foreground-muted)] mb-4">Earnings Comparison</h4>
          <div className="h-72">
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
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--app-accent)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--app-accent)" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--app-border)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: 'var(--app-foreground-muted)' }}
                  axisLine={{ stroke: 'var(--app-border)' }}
                />
                <YAxis 
                  tickFormatter={(value) => 
                    value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(1)
                  }
                  tick={{ fontSize: 12, fill: 'var(--app-foreground-muted)' }}
                  axisLine={{ stroke: 'var(--app-border)' }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  contentStyle={{
                    backgroundColor: 'var(--app-card-background)',
                    borderColor: 'var(--app-border)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-[var(--app-foreground-muted)]">{value}</span>
                  )}
                />
                <Bar 
                  dataKey="earnings" 
                  name="Earnings" 
                  fill="url(#colorEarnings)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
                <Bar 
                  dataKey="average" 
                  name="Average" 
                  fill="url(#colorAverage)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Community comparison */}
        <div>
          <h4 className="text-sm font-medium text-[var(--app-foreground-muted)] mb-4">Community Comparison</h4>
          <div className="h-72">
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
                <defs>
                  <linearGradient id="colorCollectors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--app-accent)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--app-accent)" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorTraders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--app-border)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: 'var(--app-foreground-muted)' }}
                  axisLine={{ stroke: 'var(--app-border)' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'var(--app-foreground-muted)' }}
                  axisLine={{ stroke: 'var(--app-border)' }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  contentStyle={{
                    backgroundColor: 'var(--app-card-background)',
                    borderColor: 'var(--app-border)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-[var(--app-foreground-muted)]">{value}</span>
                  )}
                />
                <Bar 
                  dataKey="collectors" 
                  name="Collectors" 
                  fill="url(#colorCollectors)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
                <Bar 
                  dataKey="traders" 
                  name="Traders" 
                  fill="url(#colorTraders)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Platform stats */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-[var(--app-foreground-muted)]">Zora</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--app-background)] p-4 rounded-lg">
              <div className="text-sm text-[var(--app-foreground-muted)] mb-2">Total Earnings</div>
              <div className="text-2xl font-bold tracking-tight">
                {parseFloat(zora.totalEarnings).toFixed(2)} ZORA
                {zora.totalEarningsUSD && (
                  <div className="text-sm text-[var(--app-foreground-muted)] mt-1">
                    ${parseFloat(zora.totalEarningsUSD).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-[var(--app-background)] p-4 rounded-lg">
              <div className="text-sm text-[var(--app-foreground-muted)] mb-2">Average Per Sale</div>
              <div className="text-2xl font-bold tracking-tight">
                {parseFloat(zora.averageEarning).toFixed(2)} ZORA
                {zora.averageEarningUSD && (
                  <div className="text-sm text-[var(--app-foreground-muted)] mt-1">
                    ${parseFloat(zora.averageEarningUSD).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-[var(--app-foreground-muted)]">Rodeo</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--app-background)] p-4 rounded-lg">
              <div className="text-sm text-[var(--app-foreground-muted)] mb-2">Total Earnings</div>
              <div className="text-2xl font-bold tracking-tight">
                {parseFloat(rodeo.totalEarnings).toFixed(2)} ZORA
                {rodeo.totalEarningsUSD && (
                  <div className="text-sm text-[var(--app-foreground-muted)] mt-1">
                    ${parseFloat(rodeo.totalEarningsUSD).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-[var(--app-background)] p-4 rounded-lg">
              <div className="text-sm text-[var(--app-foreground-muted)] mb-2">Posts</div>
              <div className="text-2xl font-bold tracking-tight">{rodeo.totalPosts}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 