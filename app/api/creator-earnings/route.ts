import { NextRequest, NextResponse } from 'next/server'
import { getProfile, getProfileBalances } from '@zoralabs/coins-sdk'

// Constants
const CREATOR_FEE_PERCENTAGE = 0.05; // 5% creator fee
const ZORA_TOKEN_ADDRESS = '0x1111111111166b7FE7bd91427724B487980aFc69'
const ZORA_API_URL = 'https://explorer.zora.energy/graphql'

// Define types for our response
export type Transaction = {
  id: string
  timestamp: string
  type: 'sale' | 'transfer' | 'mint'
  amount: string
  amountUSD?: string
  tokenAddress: string
  tokenId?: string
  tokenName?: string
  buyerAddress?: string
  sellerAddress?: string
}

export type CollectorData = {
  address: string
  tokensPurchased: number
  isTrader: boolean
}

export type CreatorEarningsResponse = {
  totalEarnings: string
  totalEarningsUSD?: string
  averageEarningPerSale: string
  averageEarningPerSaleUSD?: string
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

// Define types for token transfers
type TokenTransfer = {
  id: string
  timestamp: string
  type: string
  amount: string
  from: string
  to: string
}

type Token = {
  id: string
  name: string
  address: string
  transfers: TokenTransfer[]
}

// Define types for Zora API responses
type CoinBalance = {
  balance: string
  id: string
  coin?: {
    id: string
    name: string
    description: string
    address: string
    symbol: string
    totalSupply: string
    totalVolume: string
    volume24h: string
    uniqueHolders: number
  }
}

type CoinBalancesResponse = {
  count: number
  edges: Array<{
    node: CoinBalance
  }>
  pageInfo: {
    hasNextPage: boolean
    endCursor?: string
  }
}

// Function to fetch Zora price from DexScreener
async function getZoraPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/0x1111111111166b7FE7bd91427724B487980aFc69');
    const data = await response.json();
    
    if (!data || !data.pairs || !Array.isArray(data.pairs) || data.pairs.length === 0) {
      console.warn('Invalid or empty response from DexScreener API');
      return 0.01;
    }

    const price = parseFloat(data.pairs[0].priceUsd);
    
    if (isNaN(price) || price <= 0) {
      console.warn('Invalid price from DexScreener API:', data.pairs[0].priceUsd);
      return 0.01;
    }

    console.log('Successfully fetched Zora price:', price, 'USD');
    return price;
  } catch (error) {
    console.error('Failed to fetch Zora price:', error);
    return 0.01;
  }
}

// Function to convert Zora amount to USD
function convertToUSD(zoraAmount: string, zoraPrice: number): string {
  return (parseFloat(zoraAmount) * zoraPrice).toFixed(2);
}

// Function to fetch token transfers from Zora API
async function getTokenTransfers(address: string) {
  try {
    const response = await getProfileBalances({
      identifier: address,
      count: 100, // Get more balances per page
    })

    const profile = response.data?.profile
    const balances = profile?.coinBalances as CoinBalancesResponse
    console.log(`Found ${balances?.edges?.length || 0} coin balances`)

    if (!balances?.edges) {
      return []
    }

    // Process balances into our token format
    const tokens = balances.edges.map(({ node }) => ({
      id: node.coin?.id || '',
      name: node.coin?.name || '',
      address: node.coin?.address || '',
      tokenId: node.id,
      transfers: [{
        id: node.id,
        timestamp: new Date().toISOString(), // Since we don't have timestamp in balance
        type: 'sale',
        amount: node.balance,
        from: address,
        to: address
      }]
    }))

    console.log('Processed tokens:', tokens.length)
    return tokens
  } catch (error) {
    console.error('Failed to fetch token transfers:', error)
    return []
  }
}

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle')
  const timeframe = req.nextUrl.searchParams.get('timeframe') || 'all'

  if (!handle) {
    return NextResponse.json({ error: 'Zora handle is required' }, { status: 400 })
  }

  const cleanHandle = handle.trim().replace(/^@/, '')

  try {
    // Fetch Zora price first
    const zoraPrice = await getZoraPrice()
    console.log('Current Zora price:', zoraPrice, 'USD')

    // Fetch profile data from Zora
    const profileRes = await getProfile({ identifier: cleanHandle })
    const profileData = profileRes?.data?.profile

    if (!profileData) {
      console.log('Zora profile not found')
      return NextResponse.json({ error: 'Zora profile not found' }, { status: 404 })
    }

    const displayName = profileData.displayName || profileData.handle || cleanHandle
    const profileImage = profileData.avatar?.medium || null
    const profileHandle = profileData.handle

    // Get creator's wallet address
    const creatorAddress = profileData.publicWallet?.walletAddress
    if (!creatorAddress) {
      console.log('Creator wallet address not found')
      return NextResponse.json({ error: 'Creator wallet address not found' }, { status: 404 })
    }

    // Fetch token transfers for the creator
    const tokens = await getTokenTransfers(creatorAddress)
    console.log('Found', tokens.length, 'tokens')

    // Process transfers to calculate earnings
    const transactions: Transaction[] = []
    const collectorMap = new Map<string, { tokensPurchased: number, isTrader: boolean }>()
    const salesByTimeframe = {
      daily: {} as { [date: string]: number },
      weekly: {} as { [week: string]: number },
      monthly: {} as { [month: string]: number }
    }

    let totalEarnings = 0
    let totalSales = 0

    tokens.forEach((token: any) => {
      token.transfers.forEach((transfer: any) => {
        if (transfer.type === 'sale') {
          const creatorEarnings = (parseFloat(transfer.amount) * CREATOR_FEE_PERCENTAGE).toString()
          const creatorEarningsUSD = convertToUSD(creatorEarnings, zoraPrice)
          
          const saleDate = new Date(transfer.timestamp)
          const dateKey = saleDate.toISOString().split('T')[0]
          const weekKey = `${saleDate.getFullYear()}-W${Math.ceil((saleDate.getDate() + saleDate.getDay()) / 7)}`
          const monthKey = saleDate.toISOString().slice(0, 7)

          // Update sales by timeframe
          salesByTimeframe.daily[dateKey] = (salesByTimeframe.daily[dateKey] || 0) + 1
          salesByTimeframe.weekly[weekKey] = (salesByTimeframe.weekly[weekKey] || 0) + 1
          salesByTimeframe.monthly[monthKey] = (salesByTimeframe.monthly[monthKey] || 0) + 1

          // Add transaction
          transactions.push({
            id: transfer.id,
            timestamp: transfer.timestamp,
            type: 'sale',
            amount: creatorEarnings,
            amountUSD: creatorEarningsUSD,
            tokenAddress: token.address,
            tokenName: token.name,
            buyerAddress: transfer.to,
            sellerAddress: transfer.from
          })

          // Update collector data
          const buyerData = collectorMap.get(transfer.to) || { tokensPurchased: 0, isTrader: false }
          buyerData.tokensPurchased++
          collectorMap.set(transfer.to, buyerData)

          totalEarnings += parseFloat(creatorEarnings)
          totalSales++
        }
      })
    })

    // Calculate averages
    const averageEarningPerSale = totalSales > 0 
      ? (totalEarnings / totalSales).toFixed(2)
      : '0'
    const averageEarningPerSaleUSD = convertToUSD(averageEarningPerSale, zoraPrice)

    // Convert collector map to array
    const collectors = Array.from(collectorMap.entries()).map(([address, data]) => ({
      address,
      tokensPurchased: data.tokensPurchased,
      isTrader: data.isTrader
    }))

    // Get traders (those who have sold tokens they purchased)
    const traders = collectors.filter(c => c.isTrader)

    // Prepare response
    const response: CreatorEarningsResponse = {
      totalEarnings: totalEarnings.toFixed(2),
      totalEarningsUSD: convertToUSD(totalEarnings.toFixed(2), zoraPrice),
      averageEarningPerSale,
      averageEarningPerSaleUSD,
      salesByTimeframe,
      transactions,
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