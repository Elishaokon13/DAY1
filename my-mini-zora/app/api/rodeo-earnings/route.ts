import { NextRequest, NextResponse } from 'next/server'

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
    // TODO: In a real implementation, we would make API calls to Rodeo Club
    // to fetch actual creator earnings data. For now, we'll use mock data.
    
    // Mock posts data
    const mockPosts: Post[] = [
      {
        id: '1',
        timestamp: '2023-01-10T15:30:00Z',
        title: 'My First NFT Post',
        imageUrl: 'https://example.com/image1.jpg',
        earnings: '0.3',
        collectCount: 5,
        collectors: [
          { address: '0xcollector1', isTrader: false },
          { address: '0xcollector2', isTrader: true },
          { address: '0xcollector3', isTrader: false },
          { address: '0xcollector4', isTrader: false },
          { address: '0xcollector5', isTrader: true }
        ]
      },
      {
        id: '2',
        timestamp: '2023-02-15T10:45:00Z',
        title: 'Abstract Art Series',
        imageUrl: 'https://example.com/image2.jpg',
        earnings: '0.5',
        collectCount: 3,
        collectors: [
          { address: '0xcollector1', isTrader: false },
          { address: '0xcollector6', isTrader: false },
          { address: '0xcollector7', isTrader: true }
        ]
      },
      {
        id: '3',
        timestamp: '2023-03-22T09:15:00Z',
        title: 'Digital Landscapes',
        imageUrl: 'https://example.com/image3.jpg',
        earnings: '0.8',
        collectCount: 7,
        collectors: [
          { address: '0xcollector2', isTrader: true },
          { address: '0xcollector3', isTrader: false },
          { address: '0xcollector5', isTrader: true },
          { address: '0xcollector8', isTrader: false },
          { address: '0xcollector9', isTrader: false },
          { address: '0xcollector10', isTrader: true },
          { address: '0xcollector11', isTrader: false }
        ]
      }
    ]

    // Calculate total earnings from mock data
    const totalEarnings = mockPosts
      .reduce((sum, post) => sum + parseFloat(post.earnings), 0)
      .toString()

    // Calculate average earning per post
    const postCount = mockPosts.length
    const averageEarningPerPost = (totalEarnings && postCount) 
      ? (parseFloat(totalEarnings) / postCount).toString() 
      : '0'

    // Prepare time-based data
    const postsByTimeframe = {
      daily: { 
        '2023-01-10': 1, 
        '2023-02-15': 1, 
        '2023-03-22': 1 
      },
      weekly: { 
        '2023-W02': 1, 
        '2023-W07': 1, 
        '2023-W12': 1 
      },
      monthly: { 
        '2023-01': 1, 
        '2023-02': 1, 
        '2023-03': 1 
      }
    }

    // Process collector data
    const collectorMap = new Map<string, { postsCollected: number, isTrader: boolean }>()
    
    mockPosts.forEach(post => {
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
        postsSold: Math.floor(c.postsCollected / 2) // Mock data: assume they sold half
      }))

    // Combine all data into response
    const response: RodeoEarningsResponse = {
      totalEarnings,
      averageEarningPerPost,
      totalPosts: postCount,
      postsByTimeframe,
      posts: mockPosts,
      collectors,
      traders,
      username: cleanUsername,
      profileImage: 'https://example.com/profile.jpg' // Mock profile image
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