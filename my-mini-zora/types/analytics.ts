export interface AnalyticsData {
  totalEarnings: string;
  totalEarningsUSD?: string;
  totalCollectors: number;
  totalTraders: number;
  collectorToTraderRatio: number;
  platforms: {
    zora: {
      totalEarnings: string;
      totalEarningsUSD?: string;
      averageEarning: string;
      averageEarningUSD?: string;
      collectors: number;
      traders: number;
      salesByTimeframe: {
        daily: { [date: string]: { count: number; earnings: number; earningsUSD?: number } };
        weekly: { [week: string]: { count: number; earnings: number; earningsUSD?: number } };
        monthly: { [month: string]: { count: number; earnings: number; earningsUSD?: number } };
      };
    };
    rodeo: {
      totalEarnings: string;
      totalEarningsUSD?: string;
      averageEarning: string;
      averageEarningUSD?: string;
      totalPosts: number;
      collectors: number;
      traders: number;
      postsByTimeframe: {
        daily: { [date: string]: { count: number; earnings: number; earningsUSD?: number } };
        weekly: { [week: string]: { count: number; earnings: number; earningsUSD?: number } };
        monthly: { [month: string]: { count: number; earnings: number; earningsUSD?: number } };
      };
    };
  };
  timeSeriesData: {
    daily: { [date: string]: { earnings: number; earningsUSD?: number; count: number } };
    weekly: { [week: string]: { earnings: number; earningsUSD?: number; count: number } };
    monthly: { [month: string]: { earnings: number; earningsUSD?: number; count: number } };
  };
  user: {
    zoraHandle?: string | null;
    rodeoUsername?: string | null;
    profileImage?: string | null;
    displayName?: string | null;
  };
} 