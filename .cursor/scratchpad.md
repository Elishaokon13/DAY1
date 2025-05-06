# Background and Motivation

The user wants to build a miniapp to display analytics about their creator earnings across multiple platforms (e.g., coins on Zora, posts on Rodeo Club) using the existing `my-mini-zora` demo repo as a base. The goal is to provide insights such as total and average earnings, number of collectors vs. traders, and performance charts over time.

# Key Challenges and Analysis

- Integrating with Zora API to fetch creator earnings, transaction history, and collector/trader counts.
- Integrating with Rodeo Club API to fetch posts and associated earnings data.
- Designing a data model that consolidates multiple revenue streams and computes metrics correctly.
- Choosing and integrating a charting library for time-series visualizations.
- Ensuring secure handling of API credentials and authentication.
- Building UI components within the minikit/demo framework.
- Writing tests to validate data calculations and API integration.

# High-level Task Breakdown

1. Environment Setup
   - Clone the `my-mini-zora` repo and ensure the demo app runs locally without errors.
   - Success: Local dev server starts and core demo features work.

2. API Integration
   2.1. Research and integrate Zora API for earnings and transactions.
   2.2. Research and integrate Rodeo Club API for post earnings.
   - Success: Able to fetch earnings data for both platforms.

3. Data Computations
   3.1. Compute total earnings across posts and coins.
   3.2. Compute average earnings per post over selectable timeframes.
   3.3. Compute number of collectors (hold transactions) vs. traders (buy-and-sell).
   - Success: Correct values displayed in isolation.

4. UI Components
   4.1. Create dashboard cards for metrics: total earnings, average earnings, collector count, trader count.
   4.2. Integrate charting library and build time-series charts (e.g., line/bar charts).
   - Success: Visual components render correctly with sample data.

5. Testing
   5.1. Write unit tests for data computation functions.
   5.2. Write integration tests/mocks for API calls.
   - Success: All tests pass reliably.

6. Documentation
   - Update README to describe new analytics features and configuration steps.

# Project Status Board

- [x] Environment Setup
- [x] Zora API Integration
- [x] Rodeo Club API Integration
- [x] Data Computations (total, average)
- [x] Data Computations (collectors vs. traders)
- [ ] Dashboard UI Components
- [ ] Chart Components
- [ ] Testing
- [ ] Documentation

# Current Status / Progress Tracking

- Environment Setup completed:
  - Cloned the `my-mini-zora` repo successfully
  - Installed dependencies with npm install
  - Started the development server, accessible on localhost:3000
  - Examined the existing code structure and found:
    - The app uses Next.js with MiniKit/OnchainKit
    - Existing Zora integration for fetching tokens by Zora handle
    - No existing analytics functionality

- Zora API Research:
  - The project already uses `@zoralabs/coins-sdk` package for basic Zora integration
  - Current implementation only fetches tokens owned by a Zora handle
  - For analytics, we need to extend this to include:
    - Transaction history (sales, transfers) using `getProfile` and `getProfileBalances`
    - Token sales data using available query functions in the SDK
    - Need to implement categorization of collectors vs traders based on transaction history

- Rodeo Club API Research:
  - No official public API documentation found for Rodeo Club
  - Implementation may require custom integration or web scraping
  - Will need to research more or potentially use a third-party service that aggregates creator earnings data

- API Integration Completed:
  - Created three new API endpoints:
    1. `/api/creator-earnings` - Fetches creator earnings data from Zora
    2. `/api/rodeo-earnings` - Fetches creator earnings data from Rodeo Club (using mock data for now)
    3. `/api/analytics` - Aggregates data from both platforms and provides combined analytics
  
  - Implemented data calculations for:
    - Total earnings across platforms
    - Average earnings per post/sale
    - Collector vs trader identification and counts
    - Time-series data preparation for charts (daily, weekly, monthly)

  - Current limitations:
    - Using mock data for Rodeo Club integration until an official API becomes available
    - Zora implementation is based on the SDK but will need real transaction data for production use

# Executor's Feedback or Assistance Requests

- I've completed the API Integration tasks and Data Computation tasks.
- The implementation includes API endpoints that:
  1. Fetch Zora creator earnings data
  2. Fetch Rodeo Club creator earnings data (using mock data)
  3. Combine and aggregate data from both platforms for comprehensive analytics

- For Rodeo Club API integration, we're using mock data until official API documentation or access becomes available.

- Next steps:
  1. Implement UI components for the dashboard
  2. Integrate a charting library for visualizing the time-series data
  3. Once UI is built, test the actual API integration with real data

- Please let me know which UI component framework and charting library you prefer for the dashboard implementation.

# Lessons

- Include debug logs in output for easier troubleshooting.
- Always review the file before editing.
- Run `npm audit` if any vulnerabilities appear.
- There were some package version warnings during installation, but no critical issues that would prevent the app from running.
- The Zora SDK provides more functionality than is currently used in the demo app, which will be useful for our analytics features.
- When combining data from multiple sources, use parallel requests to improve performance.
- Use defensive programming with optional chaining and default values when working with external API data. 