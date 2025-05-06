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

- [ ] Environment Setup
- [ ] Zora API Integration
- [ ] Rodeo Club API Integration
- [ ] Data Computations (total, average)
- [ ] Data Computations (collectors vs. traders)
- [ ] Dashboard UI Components
- [ ] Chart Components
- [ ] Testing
- [ ] Documentation

# Current Status / Progress Tracking

- No tasks started yet.

# Executor's Feedback or Assistance Requests

- None at present.

# Lessons

- Include debug logs in output for easier troubleshooting.
- Always review the file before editing.
- Run `npm audit` if any vulnerabilities appear. 