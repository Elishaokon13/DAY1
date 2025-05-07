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
  totalEarningsUSD?: string;
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
    <div className="space-y-8">
      {/* User profile info */}
      {user && (
        <div className="flex items-center space-x-6 mb-8 bg-[var(--app-card-background)] p-6 rounded-xl shadow-sm border border-[var(--app-border)]">
          {user.profileImage && (
            <div className="w-16 h-16 rounded-full overflow-hidden relative ring-2 ring-[var(--app-accent)]">
              <Image 
                src={user.profileImage} 
                alt={user.displayName || 'Creator'} 
                fill={true}
                sizes="64px"
                className="object-cover"
              />
            </div>
          )}
          
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {user.displayName || 'Creator Dashboard'}
            </h2>
            <div className="flex space-x-4 text-sm text-[var(--app-foreground-muted)] mt-1">
              {user.zoraHandle && (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-[var(--app-accent)] rounded-full mr-2"></span>
                  Zora: @{user.zoraHandle}
                </span>
              )}
              {user.rodeoUsername && (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-[#4ade80] rounded-full mr-2"></span>
                  Rodeo: @{user.rodeoUsername}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Earnings"
          value={`${formattedEarnings} ZORA`}
          subtext={formattedEarningsUSD}
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
          value={`${(parseFloat(totalEarnings) / (platforms.zora.collectors + platforms.rodeo.collectors || 1)).toFixed(2)} ZORA`}
          subtext={totalEarningsUSD ? `$${(parseFloat(totalEarningsUSD) / (platforms.zora.collectors + platforms.rodeo.collectors || 1)).toFixed(2)} per collector` : ''}
          icon={<BarChart2 size={20} />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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