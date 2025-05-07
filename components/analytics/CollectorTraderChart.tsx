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

// Define interface for pie chart data
interface PieChartData {
  name: string;
  value: number;
}

// Define interface for label props
interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

// Define interface for tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
}

export function CollectorTraderChart({
  totalCollectors,
  totalTraders,
  className = '',
}: CollectorTraderChartProps) {
  // Calculate pure collectors (collectors who aren't traders)
  const pureCollectors = totalCollectors - totalTraders;
  
  const data: PieChartData[] = [
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
  }: LabelProps) => {
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
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
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
    <div className={`bg-[var(--app-card-background)] p-6 rounded-xl shadow-sm border border-[var(--app-border)] ${className}`}>
      <h3 className="text-xl font-semibold tracking-tight mb-6">Collectors vs Traders</h3>
      
      <div className="h-72">
        {totalCollectors > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1000}
                animationBegin={0}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="var(--app-card-background)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
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
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-[var(--app-foreground-muted)]">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--app-foreground-muted)]">
            No collector or trader data available
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-[var(--app-background)] p-4 rounded-lg">
          <div className="text-sm font-medium text-[var(--app-foreground-muted)] mb-2">Collectors (Hold)</div>
          <div className="text-2xl font-bold tracking-tight">{pureCollectors}</div>
          <div className="text-sm text-[var(--app-foreground-muted)] mt-1">
            {totalCollectors > 0
              ? `${((pureCollectors / totalCollectors) * 100).toFixed(1)}% of total`
              : 'No data'}
          </div>
        </div>
        
        <div className="bg-[var(--app-background)] p-4 rounded-lg">
          <div className="text-sm font-medium text-[var(--app-foreground-muted)] mb-2">Traders (Buy & Sell)</div>
          <div className="text-2xl font-bold tracking-tight">{totalTraders}</div>
          <div className="text-sm text-[var(--app-foreground-muted)] mt-1">
            {totalCollectors > 0
              ? `${((totalTraders / totalCollectors) * 100).toFixed(1)}% of total`
              : 'No data'}
          </div>
        </div>
      </div>
    </div>
  );
} 