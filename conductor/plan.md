# Implementation Plan: Qatar Gold Price App

## Phase 1: Backend Foundation & Security Setup
1.  **Initialize Project Structure:**
    *   Create `backend/` and `app/` directories.
    *   Initialize `package.json` in `backend/`.
2.  **Database & Supabase Setup:**
    *   Define SQL schema for `providers`, `latest_prices`, and `historical_prices`.
    *   Apply Row Level Security (RLS) policies allowing public read access to prices, but restricting write access to service roles only.
3.  **Dependency Security Audit:**
    *   Install core scraping dependencies (`cheerio`, `@supabase/supabase-js`).
    *   Run `snyk test` and `npm audit` to guarantee zero known vulnerabilities.

## Phase 2: Dynamic Scraping Engine
1.  **Develop the Scraper:**
    *   Create a Node.js function that reads active providers from the `providers` table.
    *   Implement HTTP fetching (using `fetch` or `axios`) and HTML parsing (`cheerio`).
    *   Extract 22k and 24k gold prices based on dynamic CSS selectors stored in the database.
2.  **Provider Management:**
    *   Create basic admin scripts/endpoints to add or update retailer websites (Al Fardan, Malabar, Joyalukkas) and their specific scraping selectors.
3.  **Data Insertion & Cron:**
    *   Write logic to upsert fetched prices into the database and archive the previous prices to the historical table.
    *   Configure a scheduled job (cron) to run this engine periodically (e.g., every 30 minutes).

## Phase 3: Mobile App Initialization & UI
1.  **Expo Setup:**
    *   Initialize the Expo project in the `app/` directory using TypeScript.
    *   Install and audit frontend dependencies (`@supabase/supabase-js`, navigation libraries).
2.  **Theme Implementation:**
    *   Define the "Premium & Professional" color palette (Deep Black background, Metallic Gold `#D4AF37` accents, White text).
    *   Create reusable UI components (Cards, Typography, Buttons).
3.  **Live Price Dashboard:**
    *   Build the main screen.
    *   Connect to Supabase to fetch and display data from `latest_prices`.

## Phase 4: Core Features
1.  **Historical Charts:**
    *   Integrate a secure charting library (e.g., `react-native-chart-kit` or `victory-native`). Audit the library for vulnerabilities.
    *   Fetch data from `historical_prices` and display 1W, 1M, 1Y trends.
2.  **Value Calculator:**
    *   Build the calculator UI.
    *   Implement logic to calculate value based on selected purity, weight input, and live price.

## Phase 5: Notifications & Polish
1.  **Price Alerts:**
    *   Implement Expo Push Notifications.
    *   Allow users to save price thresholds locally or in Supabase.
    *   Update backend to trigger push notifications when prices cross thresholds.
2.  **Final Security & Compatibility Check:**
    *   Perform a final `snyk` scan across all directories.
    *   Test on iOS Simulator and Android Emulator to ensure cross-platform compatibility.
