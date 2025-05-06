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
  daily: { [date: string]: { earnings: number; count: number } };
  weekly: { [week: string]: { earnings: number; count: number } };
  monthly: { [month: string]: { earnings: number; count: number } };
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
    <div className={`bg-[var(--app-card-background)] p-5 rounded-lg shadow-sm border border-[var(--app-border)] ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Earnings Over Time</h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-2 py-1 text-xs rounded ${
              timeframe === 'daily'
                ? 'bg-[var(--app-accent)] text-white'
                : 'bg-[var(--app-background)] text-[var(--app-foreground-muted)]'
            }`}
          >
            Daily
          </button>
          
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-2 py-1 text-xs rounded ${
              timeframe === 'weekly'
                ? 'bg-[var(--app-accent)] text-white'
                : 'bg-[var(--app-background)] text-[var(--app-foreground-muted)]'
            }`}
          >
            Weekly
          </button>
          
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-2 py-1 text-xs rounded ${
              timeframe === 'monthly'
                ? 'bg-[var(--app-accent)] text-white'
                : 'bg-[var(--app-background)] text-[var(--app-foreground-muted)]'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      
      <div className="h-64">
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="period" 
                tickFormatter={formatPeriod} 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                tickFormatter={formatYAxis} 
                tick={{ fontSize: 12 }}
                width={35}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)} ETH`, 'Earnings']}
                labelFormatter={(period) => formatPeriod(period as string)}
                contentStyle={{
                  backgroundColor: 'var(--app-card-background)',
                  borderColor: 'var(--app-border)',
                  borderRadius: '0.375rem',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="earnings"
                stackId="1"
                stroke="var(--app-accent)"
                fill="var(--app-accent-translucent)"
                name="Earnings (ETH)"
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