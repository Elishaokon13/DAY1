import { NextRequest, NextResponse } from 'next/server'
import { getProfile, getProfileBalances } from '@zoralabs/coins-sdk'

/**
 * ZORA Creator Earnings API
 * 
 * IMPORTANT: This implementation provides a SIMULATED view of creator earnings.
 * Limitations:
 * 1. The Zora SDK's getProfileBalances endpoint returns coin holdings, not transaction history
 * 2. We don't have access to actual sales data or creator fee payments through this endpoint
 * 3. Dates, transactions, and collector data are simulated based on current balances
 * 
 * For a production implementation, you would need:
 * - Actual transaction history from blockchain data or an indexer
 * - Real creator fee payment information
 * - Historical price data for accurate USD conversion
 * 
 * This implementation serves as a demonstration of how earnings data could be displayed
 * if the actual transaction data were available.
 */

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

// Function to fetch Zora price from DexScreener
async function getZoraPrice(): Promise<number> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ZORA_TOKEN_ADDRESS}`);
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
async function getTokenTransfers(address: string, timeframe: string = 'all') {
  try {
    console.log(`Fetching token transfers for ${address} with timeframe: ${timeframe}`)
    console.log(`Using Zora API URL: ${ZORA_API_URL}`)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allCoins: any[] = [];
    let cursor = undefined;
    const pageSize = 50; // Increase page size
    const MAX_PAGES = 3;  // Limit to prevent excessive API calls
    let pageCount = 0;
    
    // Paginate through balances with limits to prevent excessive API calls
    do {
      pageCount++;
      
      // Stop after MAX_PAGES to prevent excessive API calls
      if (pageCount > MAX_PAGES) {
        console.log(`Reached maximum page count (${MAX_PAGES}). Stopping pagination.`);
        break;
      }
      
      const response = await getProfileBalances({
        identifier: address,
        count: pageSize,
        after: cursor,
      });

      const profile = response.data?.profile;
      if (!profile || !profile.coinBalances?.edges) {
        console.log('No coin balances found or invalid response structure');
        break;
      }
      
      const balances = profile.coinBalances;
      const edges = balances.edges || [];
      console.log(`Found ${edges.length} coin balances on page ${pageCount}`);
      
      // Log the structure of the first balance to understand the data format
      if (pageCount === 1 && edges.length > 0) {
        console.log('Example balance structure:', JSON.stringify(edges[0], null, 2));
      }
      
      // Add balances to our collection
      const pageCoins = edges.map(edge => edge.node);
      allCoins = [...allCoins, ...pageCoins];
      
      // Update cursor for next page
      cursor = balances.pageInfo?.endCursor;
      
      // Break if no more pages
      if (!balances.pageInfo?.hasNextPage || !cursor || edges.length === 0) {
        break;
      }
      
    } while (true);

    console.log(`Fetched ${allCoins.length} total coin balances (limited to ${MAX_PAGES} pages)`);
    
    // Process balances into our token format - limit to a reasonable number for performance
    const MAX_TOKENS_TO_PROCESS = 100;
    const tokensToProcess = allCoins.slice(0, MAX_TOKENS_TO_PROCESS);
    
    console.log(`Processing ${tokensToProcess.length} tokens out of ${allCoins.length} total`);
    
    const tokens = tokensToProcess.map((coin) => {
      // Extract data from the coin balance structure based on the docs
      // Note: In a real implementation, you would use blockchain data or an indexer 
      // to get actual transactions and creator fee payments.
      
      // Handle token decimals - most ERC20 tokens use 18 decimals
      const TOKEN_DECIMALS = 18;
      
      // Use correct field paths based on what we see in the logged data
      // We need to be adaptable here since the API structure might vary
      let rawBalance = '0';
      
      // Try to access the balance from different possible locations based on the API structure
      if (typeof coin.balance === 'string') {
        rawBalance = coin.balance;
      } else if (coin.amount?.amountRaw) {
        rawBalance = coin.amount.amountRaw;
      } else if (coin.coin?.balance) {
        rawBalance = coin.coin.balance;
      }
      
      // Get token name and symbol
      const tokenName = coin.coin?.name || coin.coin?.symbol || 'Unknown Token';
      const tokenSymbol = coin.coin?.symbol || 'UNKNOWN';
      
      // Convert from raw balance (with decimals) to human-readable amount
      // For a token with 18 decimals, divide by 10^18
      const decimalBalance = parseFloat(rawBalance) / Math.pow(10, TOKEN_DECIMALS);
      
      console.log(`Token ${tokenName} (${tokenSymbol}): Raw=${rawBalance}, Decimal=${decimalBalance.toFixed(6)}`);
      
      return {
        id: coin.coin?.id || '',
        name: tokenName,
        symbol: tokenSymbol,
        address: coin.coin?.address || '',
        tokenId: coin.id,
        transfers: [{
          id: coin.id,
          timestamp: new Date().toISOString(), // Since we don't have timestamp in balance
          type: 'sale', // This is a simulation - we don't know if these were actually sales
          amount: decimalBalance.toString(), // Use the decimal-adjusted balance
          from: address,
          to: address
        }]
      };
    });

    console.log('Processed tokens:', tokens.length);
    return tokens;
  } catch (error) {
    console.error('Failed to fetch token transfers:', error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle')
  const timeframe = req.nextUrl.searchParams.get('timeframe') || 'all'

  if (!handle) {
    return NextResponse.json({ error: 'Zora handle is required' }, { status: 400 })
  }

  const cleanHandle = handle.trim().replace(/^@/, '')

  // Generate a response with proper caching headers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createCachedResponse = (data: any, status = 200) => {
    const response = NextResponse.json(data, { status });
    
    // Cache successful responses for 15 minutes, error responses for 5 minutes
    const maxAge = status === 200 ? 60 * 15 : 60 * 5;
    response.headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=60`);
    
    return response;
  };

  try {
    // Fetch Zora price first
    const zoraPrice = await getZoraPrice()
    console.log('Current Zora price:', zoraPrice, 'USD')

    // Fetch profile data from Zora
    const profileRes = await getProfile({ 
      identifier: cleanHandle 
    })
    
    const profileData = profileRes?.data?.profile
    console.log('Profile data fetched:', profileData ? 'success' : 'not found')

    if (!profileData) {
      console.log('Zora profile not found')
      return NextResponse.json({ error: 'Zora profile not found' }, { status: 404 })
    }

    // Extract profile information
    const displayName = profileData.displayName || profileData.handle || cleanHandle
    const profileImage = profileData.avatar?.medium || null
    const profileHandle = profileData.handle
    
    // Log profile details for debugging
    console.log('Profile Details:');
    console.log('- Handle:', profileData.handle);
    console.log('- Display Name:', profileData.displayName);
    if (profileData.bio) console.log('- Bio:', profileData.bio);
    
    // Get creator's wallet address
    const creatorAddress = profileData.publicWallet?.walletAddress
    if (!creatorAddress) {
      console.log('Creator wallet address not found')
      return NextResponse.json({ error: 'Creator wallet address not found' }, { status: 404 })
    }
    
    console.log('Using wallet address:', creatorAddress)

    // Fetch token transfers for the creator
    const tokens = await getTokenTransfers(creatorAddress, timeframe)
    console.log('Found', tokens.length, 'tokens')

    // Process transfers to calculate earnings
    // IMPORTANT: This is a simulation based on current holdings, not actual transaction history
    const transactions: Transaction[] = []
    const collectorMap = new Map<string, { tokensPurchased: number, isTrader: boolean }>()
    const salesByTimeframe = {
      daily: {} as { [date: string]: number },
      weekly: {} as { [week: string]: number },
      monthly: {} as { [month: string]: number }
    }

    let totalEarnings = 0
    let totalSales = 0

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tokens.forEach((token: any) => {
      token.transfers.forEach((transfer: TokenTransfer) => {
        if (transfer.type === 'sale') {
          // For each balance, we'll estimate creator earnings based on the token balance
          // Note: This is an estimation as we don't have transaction history
          const creatorEarnings = (parseFloat(transfer.amount) * CREATOR_FEE_PERCENTAGE).toString()
          const creatorEarningsUSD = convertToUSD(creatorEarnings, zoraPrice)
          
          // Generate a simulated date based on the token/balance
          // Since coinBalances don't come with timestamps, we'll create evenly distributed dates
          // This is just for demonstration - in a real app, you'd need transaction history
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          const daysBack = Math.floor(Math.random() * 30); // Distribute fake transactions over last month
          const saleDate = new Date(oneMonthAgo);
          saleDate.setDate(saleDate.getDate() + daysBack);
          
          // Format dates for the timeframes
          const dateKey = saleDate.toISOString().split('T')[0]
          const weekKey = `${saleDate.getFullYear()}-W${Math.ceil((saleDate.getDate() + saleDate.getDay()) / 7)}`
          const monthKey = saleDate.toISOString().slice(0, 7)

          // Update sales by timeframe
          salesByTimeframe.daily[dateKey] = (salesByTimeframe.daily[dateKey] || 0) + 1
          salesByTimeframe.weekly[weekKey] = (salesByTimeframe.weekly[weekKey] || 0) + 1
          salesByTimeframe.monthly[monthKey] = (salesByTimeframe.monthly[monthKey] || 0) + 1

          // Add transaction with enhanced data
          transactions.push({
            id: transfer.id,
            timestamp: saleDate.toISOString(), // Using our simulated date
            type: 'sale',
            amount: creatorEarnings,
            amountUSD: creatorEarningsUSD,
            tokenAddress: token.address,
            tokenName: token.name,
            buyerAddress: transfer.to,
            sellerAddress: transfer.from
          })

          // For demonstration, we'll simulate some collectors based on the token info
          // In a real app, you'd need to fetch actual transaction history to know who bought from you
          const simulatedBuyerAddress = `0x${token.id.substring(0, 16)}${Math.floor(Math.random() * 1000)}`
          const buyerData = collectorMap.get(simulatedBuyerAddress) || { tokensPurchased: 0, isTrader: Math.random() > 0.7 }
          buyerData.tokensPurchased++
          collectorMap.set(simulatedBuyerAddress, buyerData)

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

    // Return the cached response
    return createCachedResponse(response);
  } catch (error) {
    console.error('Zora API error:', error)
    return createCachedResponse({ 
      error: 'Failed to fetch creator earnings from Zora',
      errorDetails: 'Note: This API provides a simulation of potential earnings based on current holdings, not actual sales data.',
      totalEarnings: '0',
      transactions: [],
      collectors: [],
      traders: [],
      displayName: cleanHandle
    }, 500);
  }
} 