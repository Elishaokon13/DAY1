# Creator Analytics Dashboard

This feature provides analytics and insights about creator earnings across multiple platforms (Zora and Rodeo Club).

## Features

- **Total Earnings Tracking**: View aggregate earnings across platforms
- **Collector Analytics**: See the number of collectors (who hold your work) vs. traders (who buy and sell)
- **Time-based Analytics**: Track performance over time with daily, weekly, and monthly views
- **Platform Comparison**: Compare earnings and community metrics between different platforms
- **Interactive Charts**: Visualize your earning trends with intuitive charts

## Usage

1. Navigate to the `/analytics` page
2. Enter your Zora handle, Rodeo username, or both
3. View your consolidated analytics dashboard with key metrics and visualizations

## API Endpoints

The analytics feature uses three main API endpoints:

### 1. `/api/creator-earnings`

Fetches creator earnings data from Zora.

**Query Parameters:**
- `handle`: Zora handle (required)
- `timeframe`: Optional time period for filtering data (default: 'all')

**Response:**
```json
{
  "totalEarnings": "1.5",
  "averageEarningPerSale": "0.5",
  "salesByTimeframe": {
    "daily": { "2023-01-01": 1 },
    "weekly": { "2023-W01": 1 },
    "monthly": { "2023-01": 1 }
  },
  "transactions": [...],
  "collectors": [...],
  "traders": [...],
  "displayName": "Creator Name",
  "profileImage": "https://example.com/profile.jpg",
  "profileHandle": "handle"
}
```

### 2. `/api/rodeo-earnings`

Fetches creator earnings data from Rodeo Club.

**Query Parameters:**
- `username`: Rodeo username (required)
- `timeframe`: Optional time period for filtering data (default: 'all')

**Response:**
```json
{
  "totalEarnings": "0.8",
  "averageEarningPerPost": "0.4",
  "totalPosts": 2,
  "postsByTimeframe": {
    "daily": { "2023-02-01": 1 },
    "weekly": { "2023-W05": 1 },
    "monthly": { "2023-02": 2 }
  },
  "posts": [...],
  "collectors": [...],
  "traders": [...],
  "username": "username",
  "profileImage": "https://example.com/profile.jpg"
}
```

### 3. `/api/analytics`

Aggregates data from both platforms to provide a consolidated view.

**Query Parameters:**
- `zora`: Zora handle (optional)
- `rodeo`: Rodeo username (optional)
- `timeframe`: Optional time period for filtering data (default: 'all')

**Note:** At least one of `zora` or `rodeo` must be provided.

**Response:**
```json
{
  "totalEarnings": "2.3",
  "totalCollectors": 5,
  "totalTraders": 2,
  "collectorToTraderRatio": 0.4,
  "platforms": {
    "zora": { ... },
    "rodeo": { ... }
  },
  "timeSeriesData": {
    "daily": { ... },
    "weekly": { ... },
    "monthly": { ... }
  },
  "user": {
    "zoraHandle": "handle",
    "rodeoUsername": "username",
    "profileImage": "https://example.com/profile.jpg",
    "displayName": "Creator Name"
  }
}
```

## Components

The analytics dashboard is built using the following components:

- **Dashboard**: Main container component that integrates all analytics visualizations
- **StatCard**: Card component for displaying individual metrics
- **EarningsChart**: Area chart for showing earnings over time
- **CollectorTraderChart**: Pie chart showing the ratio of collectors vs traders
- **PlatformBreakdown**: Component for comparing metrics between platforms

## Development

### Running Tests

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

### API Limitations

- Rodeo Club API is currently mocked with sample data. In production, you'll need to integrate with their actual API.
- Zora API integration uses the `@zoralabs/coins-sdk` package and will work with real data.

## Future Improvements

- Add support for more platforms (Foundation, OpenSea, etc.)
- Implement filters for specific date ranges
- Add export functionality for data in CSV/JSON formats
- Create email/notification system for regular analytics reports 