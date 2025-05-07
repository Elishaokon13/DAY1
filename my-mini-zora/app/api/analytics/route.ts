import { NextRequest, NextResponse } from 'next/server'

export type CombinedAnalyticsResponse = {
  // Overall earnings
  totalEarnings: string
  totalCollectors: number
  totalTraders: number
  collectorToTraderRatio: number
  
  // Platform-specific data
  platforms: {
    zora: {
      totalEarnings: string
      averageEarning: string
      collectors: number
      traders: number
      salesByTimeframe: {
        daily: { [date: string]: number }
        weekly: { [week: string]: number }
        monthly: { [month: string]: number }
      }
    },
    rodeo: {
      totalEarnings: string
      averageEarning: string
      totalPosts: number
      collectors: number
      traders: number
      postsByTimeframe: {
        daily: { [date: string]: number }
        weekly: { [week: string]: number }
        monthly: { [month: string]: number }
      }
    }
  },
  
  // Aggregated time-series data for charts
  timeSeriesData: {
    daily: { [date: string]: { earnings: number, earningsUSD?: number, count: number } }
    weekly: { [week: string]: { earnings: number, earningsUSD?: number, count: number } }
    monthly: { [month: string]: { earnings: number, earningsUSD?: number, count: number } }
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
    const totalEarnings = (zoraTotalEarnings + rodeoTotalEarnings).toString()
    
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
      daily: {} as { [date: string]: { earnings: number, earningsUSD?: number, count: number } },
      weekly: {} as { [week: string]: { earnings: number, earningsUSD?: number, count: number } },
      monthly: {} as { [month: string]: { earnings: number, earningsUSD?: number, count: number } }
    }
    
    // Process Zora time data
    if (zoraData?.salesByTimeframe) {
      // Process daily data
      Object.entries(zoraData.salesByTimeframe.daily).forEach(([date, count]) => {
        if (!timeSeriesData.daily[date]) {
          timeSeriesData.daily[date] = { earnings: 0, earningsUSD: 0, count: 0 }
        }
        // For this example, we're estimating earnings by dividing total by count
        const values = Object.values(zoraData.salesByTimeframe.daily) as number[]
        const sumValues = values.reduce((a, b) => a + b, 0)
        
        const dailyEarnings = zoraTotalEarnings * (Number(count)) / sumValues
        const dailyEarningsUSD = zoraData.totalEarningsUSD ? 
          (parseFloat(zoraData.totalEarningsUSD) * (Number(count)) / sumValues) : undefined
        
        timeSeriesData.daily[date].earnings += dailyEarnings
        timeSeriesData.daily[date].earningsUSD = (timeSeriesData.daily[date].earningsUSD || 0) + (dailyEarningsUSD || 0)
        timeSeriesData.daily[date].count += Number(count)
      })
      
      // Process weekly data
      Object.entries(zoraData.salesByTimeframe.weekly).forEach(([week, count]) => {
        if (!timeSeriesData.weekly[week]) {
          timeSeriesData.weekly[week] = { earnings: 0, earningsUSD: 0, count: 0 }
        }
        const values = Object.values(zoraData.salesByTimeframe.weekly) as number[]
        const sumValues = values.reduce((a, b) => a + b, 0)
        
        const weeklyEarnings = zoraTotalEarnings * (Number(count)) / sumValues
        const weeklyEarningsUSD = zoraData.totalEarningsUSD ? 
          (parseFloat(zoraData.totalEarningsUSD) * (Number(count)) / sumValues) : undefined
        
        timeSeriesData.weekly[week].earnings += weeklyEarnings
        timeSeriesData.weekly[week].earningsUSD = (timeSeriesData.weekly[week].earningsUSD || 0) + (weeklyEarningsUSD || 0)
        timeSeriesData.weekly[week].count += Number(count)
      })
      
      // Process monthly data
      Object.entries(zoraData.salesByTimeframe.monthly).forEach(([month, count]) => {
        if (!timeSeriesData.monthly[month]) {
          timeSeriesData.monthly[month] = { earnings: 0, earningsUSD: 0, count: 0 }
        }
        const values = Object.values(zoraData.salesByTimeframe.monthly) as number[]
        const sumValues = values.reduce((a, b) => a + b, 0)
        
        const monthlyEarnings = zoraTotalEarnings * (Number(count)) / sumValues
        const monthlyEarningsUSD = zoraData.totalEarningsUSD ? 
          (parseFloat(zoraData.totalEarningsUSD) * (Number(count)) / sumValues) : undefined
        
        timeSeriesData.monthly[month].earnings += monthlyEarnings
        timeSeriesData.monthly[month].earningsUSD = (timeSeriesData.monthly[month].earningsUSD || 0) + (monthlyEarningsUSD || 0)
        timeSeriesData.monthly[month].count += Number(count)
      })
    }
    
    // Process Rodeo time data
    if (rodeoData?.postsByTimeframe) {
      // Process daily data
      Object.entries(rodeoData.postsByTimeframe.daily).forEach(([date, count]) => {
        if (!timeSeriesData.daily[date]) {
          timeSeriesData.daily[date] = { earnings: 0, earningsUSD: 0, count: 0 }
        }
        const values = Object.values(rodeoData.postsByTimeframe.daily) as number[]
        const sumValues = values.reduce((a, b) => a + b, 0)
        
        const dailyEarnings = rodeoTotalEarnings * (Number(count)) / sumValues
        const dailyEarningsUSD = rodeoData.totalEarningsUSD ? 
          (parseFloat(rodeoData.totalEarningsUSD) * (Number(count)) / sumValues) : undefined
        
        timeSeriesData.daily[date].earnings += dailyEarnings
        timeSeriesData.daily[date].earningsUSD = (timeSeriesData.daily[date].earningsUSD || 0) + (dailyEarningsUSD || 0)
        timeSeriesData.daily[date].count += Number(count)
      })
      
      // Process weekly data
      Object.entries(rodeoData.postsByTimeframe.weekly).forEach(([week, count]) => {
        if (!timeSeriesData.weekly[week]) {
          timeSeriesData.weekly[week] = { earnings: 0, earningsUSD: 0, count: 0 }
        }
        const values = Object.values(rodeoData.postsByTimeframe.weekly) as number[]
        const sumValues = values.reduce((a, b) => a + b, 0)
        
        const weeklyEarnings = rodeoTotalEarnings * (Number(count)) / sumValues
        const weeklyEarningsUSD = rodeoData.totalEarningsUSD ? 
          (parseFloat(rodeoData.totalEarningsUSD) * (Number(count)) / sumValues) : undefined
        
        timeSeriesData.weekly[week].earnings += weeklyEarnings
        timeSeriesData.weekly[week].earningsUSD = (timeSeriesData.weekly[week].earningsUSD || 0) + (weeklyEarningsUSD || 0)
        timeSeriesData.weekly[week].count += Number(count)
      })
      
      // Process monthly data
      Object.entries(rodeoData.postsByTimeframe.monthly).forEach(([month, count]) => {
        if (!timeSeriesData.monthly[month]) {
          timeSeriesData.monthly[month] = { earnings: 0, earningsUSD: 0, count: 0 }
        }
        const values = Object.values(rodeoData.postsByTimeframe.monthly) as number[]
        const sumValues = values.reduce((a, b) => a + b, 0)
        
        const monthlyEarnings = rodeoTotalEarnings * (Number(count)) / sumValues
        const monthlyEarningsUSD = rodeoData.totalEarningsUSD ? 
          (parseFloat(rodeoData.totalEarningsUSD) * (Number(count)) / sumValues) : undefined
        
        timeSeriesData.monthly[month].earnings += monthlyEarnings
        timeSeriesData.monthly[month].earningsUSD = (timeSeriesData.monthly[month].earningsUSD || 0) + (monthlyEarningsUSD || 0)
        timeSeriesData.monthly[month].count += Number(count)
      })
    }
    
    // Prepare the combined response
    const response: CombinedAnalyticsResponse = {
      totalEarnings,
      totalCollectors,
      totalTraders,
      collectorToTraderRatio,
      
      platforms: {
        zora: {
          totalEarnings: zoraData?.totalEarnings || '0',
          averageEarning: zoraData?.averageEarningPerSale || '0',
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
          averageEarning: rodeoData?.averageEarningPerPost || '0',
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