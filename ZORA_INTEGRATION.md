# Zora API Integration

## Overview

This document explains the implementation of the Zora API integration for creator earnings analytics. The integration uses the official [Zora Coins SDK](https://docs.zora.co/coins/sdk/queries/profile) to fetch user profiles and token balances.

## Important Limitations

The current implementation has significant limitations that should be understood by developers and users:

1. **Simulated Earnings Data**: The Zora SDK's `getProfileBalances` endpoint returns current token holdings, not transaction or earnings history. Our implementation simulates earnings based on these holdings.

2. **No Transaction History**: Actual transaction history, including who bought tokens and when, is not available through the SDK's public methods.

3. **Estimated Dates and Amounts**: Transaction dates and earnings amounts are estimated based on token balances and simulated with random distribution.

## Implementation Details

### API Endpoints

- `/api/creator-earnings` - Fetches a creator's profile and simulates earnings data based on their token holdings.
- `/api/analytics` - Combines data from multiple platforms (Zora, Rodeo) and formats it for the analytics dashboard.

### Data Flow

1. User enters their Zora handle
2. We fetch their profile using `getProfile`
3. We get their wallet address from the profile
4. We fetch all their token balances using `getProfileBalances` with pagination
5. We simulate earnings data based on these balances
6. The data is displayed in the analytics dashboard

### Pagination Implementation

Following the [Zora docs](https://docs.zora.co/coins/sdk/queries/profile#getprofilebalances), our implementation properly handles pagination for profiles with many token balances:

```javascript
let allCoins = [];
let cursor = undefined;
const pageSize = 20;

// Paginate through all balances
do {
  const response = await getProfileBalances({
    identifier: address,
    count: pageSize,
    after: cursor,
  });
  
  // Process page data
  const balances = profile.coinBalances;
  const edges = balances.edges || [];
  const pageCoins = edges.map(edge => edge.node);
  allCoins = [...allCoins, ...pageCoins];
  
  // Update cursor for next page
  cursor = balances.pageInfo?.endCursor;
  
  // Break if no more pages
  if (!balances.pageInfo?.hasNextPage || !cursor) {
    break;
  }
} while (true);
```

## Future Improvements

To create an accurate creator earnings tracker, you would need:

1. **Blockchain Indexing**: Index Zora transactions and creator fee payments directly from the blockchain
2. **Historical Price Data**: Track token prices over time for accurate USD conversion
3. **Actual Sales Data**: Get real sales information instead of estimating based on balances

## Testing

To test this integration, use a known Zora handle:

```
curl "http://localhost:3000/api/creator-earnings?handle=yourzorahandle"
```

Or use the analytics dashboard UI. 