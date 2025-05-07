import { NextRequest, NextResponse } from 'next/server'
import { RodeoClient } from '@rodeo/sdk'

// Define types for Rodeo Club post data
export type Post = {
  id: string
  timestamp: string
  title: string
  imageUrl?: string
  earnings: string
  collectCount: number
  collectors: {
    address: string
    isTrader: boolean
  }[]
}

export type RodeoEarningsResponse = {
  totalEarnings: string
  averageEarningPerPost: string
  totalPosts: number
  postsByTimeframe: {
    daily: { [date: string]: number }
    weekly: { [week: string]: number }
    monthly: { [month: string]: number }
  }
  posts: Post[]
  collectors: {
    address: string
    postsCollected: number
    isTrader: boolean
  }[]
  traders: {
    address: string
    postsCollected: number
    postsSold: number
  }[]
  username?: string
  profileImage?: string | null
}

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')
  // timeframe parameter is reserved for future implementation

  if (!username) {
    return NextResponse.json({ error: 'Missing Rodeo username' }, { status: 400 })
  }

  // Clean up the username input
  const cleanUsername = username.trim().replace(/^@/, '')

  try {
    // Initialize Rodeo client
    const rodeoClient = new RodeoClient({
      apiKey: process.env.RODEO_API_KEY
    })

    // Fetch user profile
    const profile = await rodeoClient.getProfile(cleanUsername)
    if (!profile) {
      return NextResponse.json({ error: 'Rodeo profile not found' }, { status: 404 })
    }

    // Fetch user's posts
    const posts = await rodeoClient.getUserPosts(cleanUsername)
    
    // Process posts data
    const processedPosts: Post[] = posts.map(post => ({
      id: post.id,
      timestamp: post.createdAt,
      title: post.title,
      imageUrl: post.imageUrl,
      earnings: post.earnings.toString(),
      collectCount: post.collectCount,
      collectors: post.collectors.map(collector => ({
        address: collector.address,
        isTrader: collector.isTrader
      }))
    }))

    // Calculate total earnings
    const totalEarnings = processedPosts
      .reduce((sum, post) => sum + parseFloat(post.earnings), 0)
      .toString()

    // Calculate average earning per post
    const postCount = processedPosts.length
    const averageEarningPerPost = postCount > 0
      ? (parseFloat(totalEarnings) / postCount).toString()
      : '0'

    // Process time-based data
    const postsByTimeframe = {
      daily: {} as { [date: string]: number },
      weekly: {} as { [week: string]: number },
      monthly: {} as { [month: string]: number }
    }

    processedPosts.forEach(post => {
      const postDate = new Date(post.timestamp)
      const dateKey = postDate.toISOString().split('T')[0]
      const weekKey = `2023-W${Math.ceil((postDate.getDate() + postDate.getDay()) / 7)}`
      const monthKey = postDate.toISOString().slice(0, 7)

      postsByTimeframe.daily[dateKey] = (postsByTimeframe.daily[dateKey] || 0) + 1
      postsByTimeframe.weekly[weekKey] = (postsByTimeframe.weekly[weekKey] || 0) + 1
      postsByTimeframe.monthly[monthKey] = (postsByTimeframe.monthly[monthKey] || 0) + 1
    })

    // Process collector data
    const collectorMap = new Map<string, { postsCollected: number, isTrader: boolean }>()
    
    processedPosts.forEach(post => {
      post.collectors.forEach(collector => {
        if (collectorMap.has(collector.address)) {
          const existing = collectorMap.get(collector.address)!
          collectorMap.set(collector.address, {
            postsCollected: existing.postsCollected + 1,
            isTrader: existing.isTrader || collector.isTrader
          })
        } else {
          collectorMap.set(collector.address, {
            postsCollected: 1,
            isTrader: collector.isTrader
          })
        }
      })
    })

    // Convert to array
    const collectors = Array.from(collectorMap.entries()).map(([address, data]) => ({
      address,
      postsCollected: data.postsCollected,
      isTrader: data.isTrader
    }))

    // Get traders
    const traders = collectors
      .filter(c => c.isTrader)
      .map(c => ({
        address: c.address,
        postsCollected: c.postsCollected,
        postsSold: Math.floor(c.postsCollected / 2) // This would need to be calculated from actual sales data
      }))

    // Combine all data into response
    const response: RodeoEarningsResponse = {
      totalEarnings,
      averageEarningPerPost,
      totalPosts: postCount,
      postsByTimeframe,
      posts: processedPosts,
      collectors,
      traders,
      username: cleanUsername,
      profileImage: profile.avatarUrl
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Rodeo API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch creator earnings from Rodeo Club',
      totalEarnings: '0',
      averageEarningPerPost: '0',
      totalPosts: 0,
      postsByTimeframe: { daily: {}, weekly: {}, monthly: {} },
      posts: [],
      collectors: [],
      traders: [],
      username: cleanUsername
    }, { status: 500 })
  }
} 