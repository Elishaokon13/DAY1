import { NextRequest, NextResponse } from 'next/server'

export type CombinedAnalyticsResponse = {
  // Overall earnings
  totalEarnings: string
  totalEarningsUSD?: string
  totalCollectors: number
  totalTraders: number
  collectorToTraderRatio: number
  
  // Platform-specific data
  platforms: {
    zora: {
      totalEarnings: string
      totalEarningsUSD?: string
      averageEarning: string
      averageEarningUSD?: string
      collectors: number
      traders: number
      salesByTimeframe: {
        daily: { [date: string]: { count: number; earnings: number; earningsUSD?: number } }
        weekly: { [week: string]: { count: number; earnings: number; earningsUSD?: number } }
        monthly: { [month: string]: { count: number; earnings: number; earningsUSD?: number } }
      }
    },
    rodeo: {
      totalEarnings: string
      totalEarningsUSD?: string
      averageEarning: string
      averageEarningUSD?: string
      totalPosts: number
      collectors: number
      traders: number
      postsByTimeframe: {
        daily: { [date: string]: { count: number; earnings: number; earningsUSD?: number } }
        weekly: { [week: string]: { count: number; earnings: number; earningsUSD?: number } }
        monthly: { [month: string]: { count: number; earnings: number; earningsUSD?: number } }
      }
    }
  },
  
  // Aggregated time-series data for charts
  timeSeriesData: {
    daily: { [date: string]: { earnings: number; earningsUSD?: number; count: number } }
    weekly: { [week: string]: { earnings: number; earningsUSD?: number; count: number } }
    monthly: { [month: string]: { earnings: number; earningsUSD?: number; count: number } }
  },
  
  // User profile info
  user: {
    zoraHandle?: string | null
    rodeoUsername?: string | null
    profileImage?: string | null
    displayName?: string | null
  }
}

// Define collector interface for type safety
interface Collector {
  address: string
  isTrader: boolean
}

interface Transaction {
  timestamp: string;
  amount: string;
  amountUSD?: string;
}

export async function GET(req: NextRequest) {
  const zoraHandle = req.nextUrl.searchParams.get('zora')
  const rodeoUsername = req.nextUrl.searchParams.get('rodeo')
  const timeframe = req.nextUrl.searchParams.get('timeframe') || 'all'
  
  if (!zoraHandle && !rodeoUsername) {
    return NextResponse.json(
      { error: 'At least one platform username/handle is required' }, 
      { status: 400 }
    )
  }
  
  try {
    // Fetch data from both platforms in parallel
    const zoraPromise = zoraHandle 
      ? fetch(`${req.nextUrl.origin}/api/creator-earnings?handle=${encodeURIComponent(zoraHandle)}&timeframe=${timeframe}`)
          .then(res => res.json())
      : Promise.resolve(null)
      
    const rodeoPromise = rodeoUsername
      ? fetch(`${req.nextUrl.origin}/api/rodeo-earnings?username=${encodeURIComponent(rodeoUsername)}&timeframe=${timeframe}`)
          .then(res => res.json())
      : Promise.resolve(null)
    
    const [zoraData, rodeoData] = await Promise.all([zoraPromise, rodeoPromise])
    
    // Calculate overall totals
    const zoraTotalEarnings = zoraData ? parseFloat(zoraData.totalEarnings || '0') : 0
    const rodeoTotalEarnings = rodeoData ? parseFloat(rodeoData.totalEarnings || '0') : 0
    const totalEarnings = (zoraTotalEarnings + rodeoTotalEarnings).toFixed(2)
    
    // Calculate USD totals
    const zoraTotalEarningsUSD = zoraData?.totalEarningsUSD ? parseFloat(zoraData.totalEarningsUSD) : 0
    const rodeoTotalEarningsUSD = rodeoData?.totalEarningsUSD ? parseFloat(rodeoData.totalEarningsUSD) : 0
    const totalEarningsUSD = (zoraTotalEarningsUSD + rodeoTotalEarningsUSD).toFixed(2)
    
    // Collect unique addresses across both platforms
    const collectorAddresses = new Set<string>()
    const traderAddresses = new Set<string>()
    
    if (zoraData?.collectors) {
      zoraData.collectors.forEach((collector: Collector) => {
        collectorAddresses.add(collector.address)
        if (collector.isTrader) {
          traderAddresses.add(collector.address)
        }
      })
    }
    
    if (rodeoData?.collectors) {
      rodeoData.collectors.forEach((collector: Collector) => {
        collectorAddresses.add(collector.address)
        if (collector.isTrader) {
          traderAddresses.add(collector.address)
        }
      })
    }
    
    const totalCollectors = collectorAddresses.size
    const totalTraders = traderAddresses.size
    const collectorToTraderRatio = totalCollectors > 0 
      ? totalTraders / totalCollectors 
      : 0
    
    // Combine time-series data for charts
    const timeSeriesData = {
      daily: {} as { [date: string]: { earnings: number; earningsUSD?: number; count: number } },
      weekly: {} as { [week: string]: { earnings: number; earningsUSD?: number; count: number } },
      monthly: {} as { [month: string]: { earnings: number; earningsUSD?: number; count: number } }
    }
    
    // Process Zora time data
    if (zoraData?.transactions) {
      zoraData.transactions.forEach((transaction: Transaction) => {
        const date = new Date(transaction.timestamp)
        const dateKey = date.toISOString().split('T')[0]
        const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`
        const monthKey = date.toISOString().slice(0, 7)
        
        // Update daily data
        if (!timeSeriesData.daily[dateKey]) {
          timeSeriesData.daily[dateKey] = { earnings: 0, earningsUSD: 0, count: 0 }
        }
        timeSeriesData.daily[dateKey].earnings += parseFloat(transaction.amount)
        timeSeriesData.daily[dateKey].earningsUSD = (timeSeriesData.daily[dateKey].earningsUSD || 0) + 
          (parseFloat(transaction.amountUSD || '0'))
        timeSeriesData.daily[dateKey].count++
        
        // Update weekly data
        if (!timeSeriesData.weekly[weekKey]) {
          timeSeriesData.weekly[weekKey] = { earnings: 0, earningsUSD: 0, count: 0 }
        }
        timeSeriesData.weekly[weekKey].earnings += parseFloat(transaction.amount)
        timeSeriesData.weekly[weekKey].earningsUSD = (timeSeriesData.weekly[weekKey].earningsUSD || 0) + 
          (parseFloat(transaction.amountUSD || '0'))
        timeSeriesData.weekly[weekKey].count++
        
        // Update monthly data
        if (!timeSeriesData.monthly[monthKey]) {
          timeSeriesData.monthly[monthKey] = { earnings: 0, earningsUSD: 0, count: 0 }
        }
        timeSeriesData.monthly[monthKey].earnings += parseFloat(transaction.amount)
        timeSeriesData.monthly[monthKey].earningsUSD = (timeSeriesData.monthly[monthKey].earningsUSD || 0) + 
          (parseFloat(transaction.amountUSD || '0'))
        timeSeriesData.monthly[monthKey].count++
      })
    }
    
    // Process Rodeo time data
    if (rodeoData?.transactions) {
      rodeoData.transactions.forEach((transaction: Transaction) => {
        const date = new Date(transaction.timestamp)
        const dateKey = date.toISOString().split('T')[0]
        const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`
        const monthKey = date.toISOString().slice(0, 7)
        
        // Update daily data
        if (!timeSeriesData.daily[dateKey]) {
          timeSeriesData.daily[dateKey] = { earnings: 0, earningsUSD: 0, count: 0 }
        }
        timeSeriesData.daily[dateKey].earnings += parseFloat(transaction.amount)
        timeSeriesData.daily[dateKey].earningsUSD = (timeSeriesData.daily[dateKey].earningsUSD || 0) + 
          (parseFloat(transaction.amountUSD || '0'))
        timeSeriesData.daily[dateKey].count++
        
        // Update weekly data
        if (!timeSeriesData.weekly[weekKey]) {
          timeSeriesData.weekly[weekKey] = { earnings: 0, earningsUSD: 0, count: 0 }
        }
        timeSeriesData.weekly[weekKey].earnings += parseFloat(transaction.amount)
        timeSeriesData.weekly[weekKey].earningsUSD = (timeSeriesData.weekly[weekKey].earningsUSD || 0) + 
          (parseFloat(transaction.amountUSD || '0'))
        timeSeriesData.weekly[weekKey].count++
        
        // Update monthly data
        if (!timeSeriesData.monthly[monthKey]) {
          timeSeriesData.monthly[monthKey] = { earnings: 0, earningsUSD: 0, count: 0 }
        }
        timeSeriesData.monthly[monthKey].earnings += parseFloat(transaction.amount)
        timeSeriesData.monthly[monthKey].earningsUSD = (timeSeriesData.monthly[monthKey].earningsUSD || 0) + 
          (parseFloat(transaction.amountUSD || '0'))
        timeSeriesData.monthly[monthKey].count++
      })
    }
    
    // Prepare the combined response
    const response: CombinedAnalyticsResponse = {
      totalEarnings,
      totalEarningsUSD,
      totalCollectors,
      totalTraders,
      collectorToTraderRatio,
      
      platforms: {
        zora: {
          totalEarnings: zoraData?.totalEarnings || '0',
          totalEarningsUSD: zoraData?.totalEarningsUSD,
          averageEarning: zoraData?.averageEarningPerSale || '0',
          averageEarningUSD: zoraData?.averageEarningPerSaleUSD,
          collectors: zoraData?.collectors?.length || 0,
          traders: zoraData?.traders?.length || 0,
          salesByTimeframe: zoraData?.salesByTimeframe || {
            daily: {},
            weekly: {},
            monthly: {}
          }
        },
        rodeo: {
          totalEarnings: rodeoData?.totalEarnings || '0',
          totalEarningsUSD: rodeoData?.totalEarningsUSD,
          averageEarning: rodeoData?.averageEarningPerPost || '0',
          averageEarningUSD: rodeoData?.averageEarningPerPostUSD,
          totalPosts: rodeoData?.totalPosts || 0,
          collectors: rodeoData?.collectors?.length || 0,
          traders: rodeoData?.traders?.length || 0,
          postsByTimeframe: rodeoData?.postsByTimeframe || {
            daily: {},
            weekly: {},
            monthly: {}
          }
        }
      },
      
      timeSeriesData,
      
      user: {
        zoraHandle: zoraData?.profileHandle || null,
        rodeoUsername: rodeoData?.username || null,
        profileImage: zoraData?.profileImage || rodeoData?.profileImage || null,
        displayName: zoraData?.displayName || rodeoData?.username || null
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch analytics data',
      totalEarnings: '0',
      totalCollectors: 0,
      totalTraders: 0,
      collectorToTraderRatio: 0,
      platforms: {
        zora: { totalEarnings: '0', averageEarning: '0', collectors: 0, traders: 0, salesByTimeframe: { daily: {}, weekly: {}, monthly: {} } },
        rodeo: { totalEarnings: '0', averageEarning: '0', totalPosts: 0, collectors: 0, traders: 0, postsByTimeframe: { daily: {}, weekly: {}, monthly: {} } }
      },
      timeSeriesData: { daily: {}, weekly: {}, monthly: {} },
      user: {}
    }, { status: 500 })
  }
} 