import React from 'react';
import Image from 'next/image';
import { StatCard } from './StatCard';
import { EarningsChart } from './EarningsChart';
import { CollectorTraderChart } from './CollectorTraderChart';
import { PlatformBreakdown } from './PlatformBreakdown';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnalyticsData } from "@/types/analytics"

// Import icons
import {
  DollarSign,
  Users,
  TrendingUp,
  BarChart2,
} from 'lucide-react';

interface DashboardProps {
  analyticsData: AnalyticsData;
}

export function Dashboard({ analyticsData }: DashboardProps) {
  const {
    totalEarnings,
    totalEarningsUSD,
    totalCollectors,
    totalTraders,
    collectorToTraderRatio,
    platforms,
    timeSeriesData,
    user
  } = analyticsData;

  // Format earnings to 2 decimal places
  const formattedEarnings = parseFloat(totalEarnings).toFixed(2);
  const formattedEarningsUSD = totalEarningsUSD ? `($${totalEarningsUSD})` : '';
  
  // Calculate percentage of traders
  const traderPercentage = totalCollectors > 0
    ? (totalTraders / totalCollectors) * 100
    : 0;

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm">
        <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white shadow-lg">
          <AvatarImage src={user.profileImage || undefined} alt={user.displayName || 'Profile'} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
            {user.displayName?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            {user.displayName || 'Anonymous Creator'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user.zoraHandle && `@${user.zoraHandle}`}
            {user.zoraHandle && user.rodeoUsername && ' • '}
            {user.rodeoUsername && `@${user.rodeoUsername}`}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {parseFloat(totalEarnings).toFixed(2)} ZORA
            </div>
            {totalEarningsUSD && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ${parseFloat(totalEarningsUSD).toFixed(2)} USD
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Collectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCollectors}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {totalTraders} traders ({collectorToTraderRatio.toFixed(2)} ratio)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {parseFloat(platforms.zora.averageEarning).toFixed(2)} ZORA
            </div>
            {platforms.zora.averageEarningUSD && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ${parseFloat(platforms.zora.averageEarningUSD).toFixed(2)} USD
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Platform Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {platforms.zora.collectors + platforms.rodeo.collectors}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Across {platforms.zora.collectors > 0 ? 'Zora' : ''} 
              {platforms.zora.collectors > 0 && platforms.rodeo.collectors > 0 ? ' & ' : ''}
              {platforms.rodeo.collectors > 0 ? 'Rodeo' : ''}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Earnings Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <EarningsChart data={timeSeriesData} />
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Platform Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformBreakdown data={platforms} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 