import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PlatformBreakdownProps {
  data: {
    zora: {
      totalEarnings: string
      totalEarningsUSD?: string
      averageEarning: string
      averageEarningUSD?: string
      collectors: number
      traders: number
    }
    rodeo: {
      totalEarnings: string
      totalEarningsUSD?: string
      averageEarning: string
      averageEarningUSD?: string
      totalPosts: number
      collectors: number
      traders: number
    }
  }
}

export function PlatformBreakdown({ data }: PlatformBreakdownProps) {
  const chartData = [
    {
      name: 'Zora',
      earnings: parseFloat(data.zora.totalEarnings),
      earningsUSD: data.zora.totalEarningsUSD ? parseFloat(data.zora.totalEarningsUSD) : undefined,
      collectors: data.zora.collectors,
      traders: data.zora.traders
    },
    {
      name: 'Rodeo',
      earnings: parseFloat(data.rodeo.totalEarnings),
      earningsUSD: data.rodeo.totalEarningsUSD ? parseFloat(data.rodeo.totalEarningsUSD) : undefined,
      collectors: data.rodeo.collectors,
      traders: data.rodeo.traders
    }
  ]

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey="name" 
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
                      {data.collectors} collectors • {data.traders} traders
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar
            dataKey="earnings"
            fill="#8B5CF6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 