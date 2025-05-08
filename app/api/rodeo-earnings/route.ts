import { NextRequest, NextResponse } from 'next/server'

/**
 * Rodeo Club Earnings API Stub
 * 
 * This is a placeholder implementation until the full Rodeo API integration
 * is completed. It returns empty data structures matching the expected response format.
 */

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Missing Rodeo username' }, { status: 400 })
  }

  // Clean up the username input
  const cleanUsername = username.trim().replace(/^@/, '')

  // Create a cached response helper
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createCachedResponse = (data: any, status = 200) => {
    const response = NextResponse.json(data, { status });
    
    // Cache responses for 15 minutes
    const maxAge = 60 * 15;
    response.headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=60`);
    
    return response;
  };

  // Return placeholder data
  return createCachedResponse({
    totalEarnings: '0',
    averageEarningPerPost: '0',
    totalPosts: 0,
    postsByTimeframe: { 
      daily: {}, 
      weekly: {}, 
      monthly: {} 
    },
    posts: [],
    collectors: [],
    traders: [],
    username: cleanUsername,
    profileImage: null
  });
} 