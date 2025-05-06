import { NextRequest, NextResponse } from 'next/server'
import { getProfile, getProfileBalances } from '@zoralabs/coins-sdk'

// Define types for our response
export type Transaction = {
  id: string
  timestamp: string
  type: 'sale' | 'transfer' | 'mint'
  amount: string
  tokenAddress: string
  tokenId?: string
  tokenName?: string
  buyerAddress?: string
  sellerAddress?: string
}

export type CollectorData = {
  address: string
  tokensPurchased: number
  isTrader: boolean  // true if they've sold tokens they purchased
}

export type CreatorEarningsResponse = {
  totalEarnings: string
  averageEarningPerSale: string
  salesByTimeframe: {
    daily: { [date: string]: number }
    weekly: { [week: string]: number }
    monthly: { [month: string]: number }
  }
  transactions: Transaction[]
  collectors: CollectorData[]
  traders: CollectorData[]
  displayName: string
  profileImage?: string | null
  profileHandle?: string | null
}

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle')
  // timeframe parameter is reserved for future implementation

  if (!handle) {
    return NextResponse.json({ error: 'Missing Zora handle' }, { status: 400 })
  }

  // Clean up the handle input (remove @ if present)
  const cleanHandle = handle.trim().replace(/^@/, '')

  try {
    // Fetch profile data from Zora
    const profileRes = await getProfile({ identifier: cleanHandle })
    // Also fetch balances for future implementation
    await getProfileBalances({ identifier: cleanHandle })

    // Extract profile information
    const profileData = profileRes?.data 
    
    if (!profileData?.profile) {
      console.log('Zora profile not found')
      return NextResponse.json({ error: 'Zora profile not found' }, { status: 404 })
    }
    
    const displayName =
      profileData?.profile?.displayName ||
      profileData?.profile?.handle ||
      cleanHandle

    const profileImage = profileData?.profile?.avatar?.medium || null
    const profileHandle = profileData?.profile?.handle

    // TODO: In a real implementation, we would fetch transaction history
    // and calculate earnings based on sales data.
    // For now, we'll use mock data for demonstration.
    
    // Mock data for demonstration
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        timestamp: '2023-01-01T12:00:00Z',
        type: 'sale',
        amount: '0.5',
        tokenAddress: '0x123...',
        tokenId: '1',
        tokenName: 'Artwork #1',
        buyerAddress: '0xbuyer1',
        sellerAddress: '0xseller1'
      },
      {
        id: '2',
        timestamp: '2023-01-15T14:30:00Z',
        type: 'sale',
        amount: '1.2',
        tokenAddress: '0x456...',
        tokenId: '2',
        tokenName: 'Artwork #2',
        buyerAddress: '0xbuyer2',
        sellerAddress: '0xseller2'
      },
      {
        id: '3',
        timestamp: '2023-02-05T09:15:00Z',
        type: 'sale',
        amount: '0.8',
        tokenAddress: '0x789...',
        tokenId: '3',
        tokenName: 'Artwork #3',
        buyerAddress: '0xbuyer3',
        sellerAddress: '0xseller3'
      }
    ]

    // Calculate total earnings from mock data
    const totalEarnings = mockTransactions
      .filter(tx => tx.type === 'sale')
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
      .toString()

    // Calculate average earning per sale
    const salesCount = mockTransactions.filter(tx => tx.type === 'sale').length
    const averageEarningPerSale = (totalEarnings && salesCount) 
      ? (parseFloat(totalEarnings) / salesCount).toString() 
      : '0'

    // Prepare time-based data
    const salesByTimeframe = {
      daily: { '2023-01-01': 1, '2023-01-15': 1, '2023-02-05': 1 },
      weekly: { '2023-W01': 1, '2023-W03': 1, '2023-W06': 1 },
      monthly: { '2023-01': 2, '2023-02': 1 }
    }

    // Mock collector/trader data
    const collectors: CollectorData[] = [
      { address: '0xbuyer1', tokensPurchased: 1, isTrader: false },
      { address: '0xbuyer2', tokensPurchased: 1, isTrader: true },
      { address: '0xbuyer3', tokensPurchased: 1, isTrader: false }
    ]

    const traders = collectors.filter(c => c.isTrader)

    // Combine all data into response
    const response: CreatorEarningsResponse = {
      totalEarnings,
      averageEarningPerSale,
      salesByTimeframe,
      transactions: mockTransactions,
      collectors,
      traders,
      displayName,
      profileImage,
      profileHandle
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Zora API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch creator earnings from Zora',
      totalEarnings: '0',
      transactions: [],
      collectors: [],
      traders: [],
      displayName: cleanHandle
    }, { status: 500 })
  }
} 