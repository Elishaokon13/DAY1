import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface CollectorTraderChartProps {
  totalCollectors: number;
  totalTraders: number;
  className?: string;
}

export function CollectorTraderChart({
  totalCollectors,
  totalTraders,
  className = '',
}: CollectorTraderChartProps) {
  // Calculate pure collectors (collectors who aren't traders)
  const pureCollectors = totalCollectors - totalTraders;
  
  const data = [
    { name: 'Collectors', value: pureCollectors },
    { name: 'Traders', value: totalTraders },
  ];
  
  const COLORS = ['var(--app-accent)', '#4ade80'];
  
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--app-card-background)] p-2 border border-[var(--app-border)] rounded-md text-xs">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`bg-[var(--app-card-background)] p-5 rounded-lg shadow-sm border border-[var(--app-border)] ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Collectors vs Traders</h3>
      
      <div className="h-64">
        {totalCollectors > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--app-foreground-muted)]">
            No collector or trader data available
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-[var(--app-background)] p-3 rounded-md">
          <div className="text-sm text-[var(--app-foreground-muted)] mb-1">Collectors (Hold)</div>
          <div className="text-xl font-bold">{pureCollectors}</div>
          <div className="text-xs text-[var(--app-foreground-muted)]">
            {totalCollectors > 0
              ? `${((pureCollectors / totalCollectors) * 100).toFixed(1)}% of total`
              : 'No data'}
          </div>
        </div>
        
        <div className="bg-[var(--app-background)] p-3 rounded-md">
          <div className="text-sm text-[var(--app-foreground-muted)] mb-1">Traders (Buy & Sell)</div>
          <div className="text-xl font-bold">{totalTraders}</div>
          <div className="text-xs text-[var(--app-foreground-muted)]">
            {totalCollectors > 0
              ? `${((totalTraders / totalCollectors) * 100).toFixed(1)}% of total`
              : 'No data'}
          </div>
        </div>
      </div>
    </div>
  );
} 