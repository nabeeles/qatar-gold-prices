# Product Definition: Qatar Gold Price App

## Objective
To develop a premium, professional mobile application that provides users with aggregated, real-time, and historical gold prices from major jewelry retailers in Qatar (Al Fardan, Malabar, and Joyalukkas).

## Core Features
1.  **Live Prices:** Aggregated and up-to-date gold rates (e.g., 22k, 24k) from targeted retailers.
2.  **Historical Charts:** Interactive charts displaying price trends over 1 Week (1W), 1 Month (1M), and 1 Year (1Y) periods.
3.  **Value Calculator:** A built-in calculator allowing users to estimate the value of their gold based on current market rates and input weight.
4.  **Price Alerts:** Push notifications alerting users when prices hit their defined thresholds.

## Design & Theme
*   **Theme:** "Premium & Professional"
*   **Color Palette:** Deep blacks, metallic gold (`#D4AF37`), and crisp white text.

## Architecture & Technical Approach (Serverless Aggregator)
*   **Mobile App Frontend:** Built using **React Native / Expo** for cross-platform support (iOS & Android).
*   **Backend System:** Lightweight serverless architecture (e.g., Supabase, Vercel functions, or Render).
*   **Data Aggregation Engine:** A configurable system that reliably scrapes/fetches pricing data.
*   **Provider Management:** A backend feature allowing administrators to add or amend gold price data provider websites and their scraping rules.
*   **Notifications:** Implemented via Expo Push Notifications.

## Implementation Plan Overview
1.  **Phase 1: Backend Setup & Configurable Scrapers**
    *   Initialize serverless backend.
    *   Develop a flexible scraping engine that can be configured for different websites.
    *   Create a management interface/API to add or update data providers (URLs and selectors).
    *   Set up automated cron jobs for data fetching.
    *   Establish database schema for storing current and historical price data.

2.  **Phase 2: Mobile App Foundation & UI**
    *   Initialize Expo React Native project.
    *   Implement the "Premium & Professional" UI theme.
    *   Build main dashboard for Live Prices.
3.  **Phase 3: Core Features Integration**
    *   Integrate backend APIs to display Live Prices.
    *   Implement Historical Charts using a charting library.
    *   Develop the Value Calculator component.
4.  **Phase 4: Notifications & Polish**
    *   Integrate Expo Push Notifications for price alerts.
    *   End-to-end testing and performance optimization.

## Verification & Testing
*   Verify scrapers correctly extract data from all three sources without failing on minor site changes.
*   Confirm cron jobs execute reliably at defined intervals.
*   Test mobile app across iOS and Android simulators for UI consistency and responsiveness.
*   Validate push notification delivery for custom price alerts.
