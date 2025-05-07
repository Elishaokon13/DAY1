import { NextRequest, NextResponse } from 'next/server'
import { getProfile, getProfileBalances } from '@zoralabs/coins-sdk'

// Define types for our response
export type Transaction = {
  id: string
  timestamp: string
  type: 'sale' | 'transfer' | 'mint'
  amount: string
  amountUSD?: string  // Added USD amount
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
  totalEarningsUSD?: string  // Added USD total
  averageEarningPerSale: string
  averageEarningPerSaleUSD?: string  // Added USD average
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

// Define types for Zora API responses
type ZoraCoinBalance = {
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
    createdAt?: string
    creatorAddress?: string
    mediaContent?: {
      mimeType?: string
      originalUri: string
      previewImage?: {
        small: string
        medium: string
        blurhash?: string
      }
    }
    uniqueHolders: number
  }
}

// Zora token address
const ZORA_TOKEN_ADDRESS = '0x1111111111166b7FE7bd91427724B487980aFc69'

// Function to fetch Zora price from DexScreener
async function getZoraPrice(): Promise<number> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ZORA_TOKEN_ADDRESS}`)
    const data = await response.json()
    
    if (data.pairs && data.pairs.length > 0) {
      // Get the price from the first pair (usually the most liquid)
      const price = parseFloat(data.pairs[0].priceUsd)
      console.log('Fetched Zora price from DexScreener:', price)
      return price
    }
    
    console.warn('No price data found in DexScreener response')
    return 0.5 // Fallback price
  } catch (error) {
    console.error('Error fetching Zora price:', error)
    return 0.5 // Fallback price
  }
}

// Function to convert Zora amount to USD
function convertToUSD(zoraAmount: string, priceUsd: number): string {
  const amount = parseFloat(zoraAmount)
  return (amount * priceUsd).toFixed(2)
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
    // Fetch Zora price first
    const zoraPrice = await getZoraPrice()
    console.log('Using Zora price:', zoraPrice)

    // Fetch profile data from Zora
    const profileRes = await getProfile({ identifier: cleanHandle })
    const balancesRes = await getProfileBalances({ identifier: cleanHandle })

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

    // Get tokens from balances
    const balanceEdges = balancesRes?.data?.profile?.coinBalances?.edges || []
    const tokens: ZoraCoinBalance[] = balanceEdges.map(edge => edge.node)
    
    // Process tokens data to get sales information
    const transactions: Transaction[] = []
    const collectorMap = new Map<string, { tokensPurchased: number, isTrader: boolean }>()
    const salesByTimeframe = {
      daily: {} as { [date: string]: number },
      weekly: {} as { [week: string]: number },
      monthly: {} as { [month: string]: number }
    }

    console.log('Processing tokens:', tokens.length)

    // Process each token to extract sales data
    tokens.forEach((token, index) => {
      console.log(`\nProcessing token ${index + 1}:`)
      console.log('- Token name:', token.coin?.name)
      console.log('- Total volume:', token.coin?.totalVolume)
      console.log('- Created at:', token.coin?.createdAt)
      
      if (token.coin?.totalVolume) {
        const volume = parseFloat(token.coin.totalVolume)
        console.log('- Parsed volume:', volume)
        
        if (volume > 0) {
          // Use current date if createdAt is not available
          const saleDate = new Date()
          const dateKey = saleDate.toISOString().split('T')[0]
          const weekKey = `${saleDate.getFullYear()}-W${Math.ceil((saleDate.getDate() + saleDate.getDay()) / 7)}`
          const monthKey = saleDate.toISOString().slice(0, 7)

          console.log('- Sale date:', saleDate.toISOString())
          console.log('- Date key:', dateKey)
          console.log('- Week key:', weekKey)
          console.log('- Month key:', monthKey)

          // Update sales by timeframe
          salesByTimeframe.daily[dateKey] = (salesByTimeframe.daily[dateKey] || 0) + 1
          salesByTimeframe.weekly[weekKey] = (salesByTimeframe.weekly[weekKey] || 0) + 1
          salesByTimeframe.monthly[monthKey] = (salesByTimeframe.monthly[monthKey] || 0) + 1

          // Calculate creator earnings (assuming 5% creator fee)
          const creatorEarnings = (volume * 0.05).toString()
          const creatorEarningsUSD = convertToUSD(creatorEarnings, zoraPrice)
          console.log('- Creator earnings:', creatorEarnings, 'ZORA ($' + creatorEarningsUSD + ')')

          // Add transaction
          const transaction: Transaction = {
            id: `${token.coin.address}-${dateKey}`,
            timestamp: saleDate.toISOString(),
            type: 'sale' as const,
            amount: creatorEarnings,
            amountUSD: creatorEarningsUSD,
            tokenAddress: token.coin.address,
            tokenName: token.coin.name,
            buyerAddress: token.coin.creatorAddress,
            sellerAddress: token.coin.creatorAddress
          }
          transactions.push(transaction)
          console.log('- Added transaction:', transaction)

          // Update collector data
          if (token.coin.creatorAddress) {
            const buyerData = collectorMap.get(token.coin.creatorAddress) || { tokensPurchased: 0, isTrader: false }
            buyerData.tokensPurchased++
            collectorMap.set(token.coin.creatorAddress, buyerData)
            console.log('- Updated collector data:', buyerData)
          }
        } else {
          console.log('- Skipping token: volume is 0 or negative')
        }
      } else {
        console.log('- Skipping token: no total volume data')
      }
    })

    // Calculate total earnings
    const totalEarnings = transactions
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
      .toString()
    const totalEarningsUSD = convertToUSD(totalEarnings, zoraPrice)

    console.log('\nFinal calculations:')
    console.log('- Total transactions:', transactions.length)
    console.log('- Total earnings:', totalEarnings, 'ZORA ($' + totalEarningsUSD + ')')
    console.log('- Sales by timeframe:', salesByTimeframe)

    // Calculate average earning per sale
    const salesCount = transactions.length
    const averageEarningPerSale = salesCount > 0 
      ? (parseFloat(totalEarnings) / salesCount).toString() 
      : '0'
    const averageEarningPerSaleUSD = convertToUSD(averageEarningPerSale, zoraPrice)
    console.log('- Average earning per sale:', averageEarningPerSale, 'ZORA ($' + averageEarningPerSaleUSD + ')')

    // Convert collector map to array
    const collectors = Array.from(collectorMap.entries()).map(([address, data]) => ({
      address,
      tokensPurchased: data.tokensPurchased,
      isTrader: data.isTrader
    }))
    console.log('- Total collectors:', collectors.length)

    // Get traders (those who have sold tokens they purchased)
    const traders = collectors.filter(c => c.isTrader)
    console.log('- Total traders:', traders.length)

    // Combine all data into response
    const response: CreatorEarningsResponse = {
      totalEarnings,
      totalEarningsUSD,
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