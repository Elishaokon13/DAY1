import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface EarningsChartProps {
  data: {
    daily: { [date: string]: { earnings: number; earningsUSD?: number; count: number } }
    weekly: { [week: string]: { earnings: number; earningsUSD?: number; count: number } }
    monthly: { [month: string]: { earnings: number; earningsUSD?: number; count: number } }
  }
}

type Timeframe = 'daily' | 'weekly' | 'monthly'

export function EarningsChart({ data }: EarningsChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('daily')

  const chartData = Object.entries(data[timeframe])
    .map(([date, value]) => ({
      date,
      earnings: value.earnings,
      earningsUSD: value.earningsUSD,
      count: value.count
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="h-[400px] w-full">
      <div className="flex justify-end mb-4">
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as Timeframe)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1 text-sm"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey="date" 
            className="text-sm text-gray-500 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            className="text-sm text-gray-500 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
            tickFormatter={(value) => `${value.toFixed(2)} ZORA`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {data.earnings.toFixed(2)} ZORA
                      {data.earningsUSD && ` ($${data.earningsUSD.toFixed(2)})`}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {data.count} sales
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="earnings"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#8B5CF6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 