import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type TimeframeOption = 'daily' | 'weekly' | 'monthly';

interface TimeSeriesData {
  daily: { [date: string]: { earnings: number; earningsUSD?: number; count: number } };
  weekly: { [week: string]: { earnings: number; earningsUSD?: number; count: number } };
  monthly: { [month: string]: { earnings: number; earningsUSD?: number; count: number } };
}

interface EarningsChartProps {
  timeSeriesData: TimeSeriesData;
  className?: string;
}

export function EarningsChart({ timeSeriesData, className = '' }: EarningsChartProps) {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('monthly');

  // Process data for the selected timeframe
  const processChartData = () => {
    const selectedData = timeSeriesData[timeframe];
    
    return Object.entries(selectedData)
      .map(([period, data]) => ({
        period,
        earnings: parseFloat(data.earnings.toFixed(2)),
        earningsUSD: data.earningsUSD ? parseFloat(data.earningsUSD.toFixed(2)) : undefined,
        count: data.count,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  };
  
  const chartData = processChartData();

  // Format date for display
  const formatPeriod = (period: string) => {
    if (timeframe === 'daily') {
      // Format: YYYY-MM-DD -> MM/DD
      const date = new Date(period);
      return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
    } else if (timeframe === 'weekly') {
      // Format: YYYY-Wnn -> Wnn
      return period.split('-')[1];
    } else {
      // Format: YYYY-MM -> MMM YYYY
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    }
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(1);
  };

  return (
    <div className={`bg-[var(--app-card-background)] p-6 rounded-xl shadow-sm border border-[var(--app-border)] ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold tracking-tight">Earnings Over Time</h3>
        
        <div className="flex space-x-2 bg-[var(--app-background)] p-1 rounded-lg">
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
              timeframe === 'daily'
                ? 'bg-[var(--app-accent)] text-white shadow-sm'
                : 'text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]'
            }`}
          >
            Daily
          </button>
          
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
              timeframe === 'weekly'
                ? 'bg-[var(--app-accent)] text-white shadow-sm'
                : 'text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]'
            }`}
          >
            Weekly
          </button>
          
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
              timeframe === 'monthly'
                ? 'bg-[var(--app-accent)] text-white shadow-sm'
                : 'text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      
      <div className="h-72">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--app-accent)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--app-accent)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--app-border)" />
              <XAxis 
                dataKey="period" 
                tickFormatter={formatPeriod} 
                tick={{ fontSize: 12, fill: 'var(--app-foreground-muted)' }}
                tickMargin={10}
                axisLine={{ stroke: 'var(--app-border)' }}
              />
              <YAxis 
                tickFormatter={formatYAxis} 
                tick={{ fontSize: 12, fill: 'var(--app-foreground-muted)' }}
                width={35}
                axisLine={{ stroke: 'var(--app-border)' }}
              />
              <Tooltip
                formatter={(value: number) => {
                  const data = chartData.find(d => d.earnings === value);
                  const usdValue = data?.earningsUSD;
                  return [`${value.toFixed(2)} ZORA${usdValue ? ` ($${usdValue.toFixed(2)})` : ''}`, 'Earnings'];
                }}
                labelFormatter={(period) => formatPeriod(period as string)}
                contentStyle={{
                  backgroundColor: 'var(--app-card-background)',
                  borderColor: 'var(--app-border)',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="earnings"
                stackId="1"
                stroke="var(--app-accent)"
                fill="url(#colorEarnings)"
                name="Earnings (ZORA)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--app-foreground-muted)]">
            No data available for the selected timeframe
          </div>
        )}
      </div>
    </div>
  );
} 