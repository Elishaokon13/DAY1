import React from 'react';
import Image from 'next/image';
import { StatCard } from './StatCard';
import { EarningsChart } from './EarningsChart';
import { CollectorTraderChart } from './CollectorTraderChart';
import { PlatformBreakdown } from './PlatformBreakdown';

// Import icons
import {
  DollarSign,
  Users,
  TrendingUp,
  BarChart2,
} from 'lucide-react';

// Type for the analytics data
export interface AnalyticsData {
  totalEarnings: string;
  totalCollectors: number;
  totalTraders: number;
  collectorToTraderRatio: number;
  platforms: {
    zora: {
      totalEarnings: string;
      averageEarning: string;
      collectors: number;
      traders: number;
      salesByTimeframe: {
        daily: { [date: string]: number };
        weekly: { [week: string]: number };
        monthly: { [month: string]: number };
      };
    };
    rodeo: {
      totalEarnings: string;
      averageEarning: string;
      totalPosts: number;
      collectors: number;
      traders: number;
      postsByTimeframe: {
        daily: { [date: string]: number };
        weekly: { [week: string]: number };
        monthly: { [month: string]: number };
      };
    };
  };
  timeSeriesData: {
    daily: { [date: string]: { earnings: number; count: number } };
    weekly: { [week: string]: { earnings: number; count: number } };
    monthly: { [month: string]: { earnings: number; count: number } };
  };
  user: {
    zoraHandle?: string | null;
    rodeoUsername?: string | null;
    profileImage?: string | null;
    displayName?: string | null;
  };
}

interface DashboardProps {
  analyticsData: AnalyticsData;
}

export function Dashboard({ analyticsData }: DashboardProps) {
  if (!analyticsData) return null;

  const {
    totalEarnings,
    totalCollectors,
    totalTraders,
    collectorToTraderRatio,
    platforms,
    timeSeriesData,
    user
  } = analyticsData;

  // Format earnings to 2 decimal places
  const formattedEarnings = parseFloat(totalEarnings).toFixed(2);
  
  // Calculate percentage of traders
  const traderPercentage = totalCollectors > 0
    ? (totalTraders / totalCollectors) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* User profile info */}
      {user && (
        <div className="flex items-center space-x-4 mb-6">
          {user.profileImage && (
            <div className="w-14 h-14 rounded-full overflow-hidden relative">
              <Image 
                src={user.profileImage} 
                alt={user.displayName || 'Creator'} 
                fill={true}
                sizes="56px"
                className="object-cover"
              />
            </div>
          )}
          
          <div>
            <h2 className="text-xl font-bold">
              {user.displayName || 'Creator Dashboard'}
            </h2>
            <div className="flex space-x-3 text-sm text-[var(--app-foreground-muted)]">
              {user.zoraHandle && (
                <span>Zora: @{user.zoraHandle}</span>
              )}
              {user.rodeoUsername && (
                <span>Rodeo: @{user.rodeoUsername}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Earnings"
          value={`${formattedEarnings} ETH`}
          icon={<DollarSign size={20} />}
        />
        
        <StatCard
          title="Total Collectors"
          value={totalCollectors}
          icon={<Users size={20} />}
        />
        
        <StatCard
          title="Collector/Trader Ratio"
          value={collectorToTraderRatio.toFixed(2)}
          subtext={`${traderPercentage.toFixed(1)}% are traders`}
          icon={<TrendingUp size={20} />}
        />
        
        <StatCard
          title="Average Earnings"
          value={`${(parseFloat(totalEarnings) / (platforms.zora.collectors + platforms.rodeo.collectors || 1)).toFixed(2)} ETH`}
          subtext="Per collector"
          icon={<BarChart2 size={20} />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EarningsChart timeSeriesData={timeSeriesData} />
        </div>
        
        <div>
          <CollectorTraderChart
            totalCollectors={totalCollectors}
            totalTraders={totalTraders}
          />
        </div>
      </div>

      {/* Platform breakdown */}
      <PlatformBreakdown
        zora={platforms.zora}
        rodeo={platforms.rodeo}
      />
    </div>
  );
} 