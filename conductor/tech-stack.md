# Technical Stack & Security Guidelines: Qatar Gold Price App

## Overview
This document defines the approved technology stack for the Qatar Gold Price App, ensuring compatibility across all layers and enforcing strict security guidelines to prevent vulnerabilities.

## 1. Frontend (Mobile App)
*   **Framework:** React Native via Expo (Latest SDK, currently SDK 51+).
    *   *Why:* Expo ensures compatibility between React Native core, navigation, and native modules, significantly reducing version conflicts.
*   **Language:** TypeScript (Strict mode enabled) to catch type-related bugs at compile time.
*   **Routing:** Expo Router (file-based routing).
*   **State Management & Data Fetching:** TanStack Query (React Query) or standard React Context.
*   **UI/Styling:** StyleSheet (Vanilla React Native) or NativeWind (Tailwind for React Native) to ensure "Premium & Professional" styling.

## 2. Backend (Serverless Aggregator)
*   **Platform:** Supabase (managed PostgreSQL with built-in Auth, API, and Edge Functions).
    *   *Why:* Provides a secure, scalable backend without managing servers. Built-in Row Level Security (RLS) protects data.
*   **Database:** PostgreSQL (via Supabase).
*   **Scraping Engine:** Node.js (via Supabase Edge Functions or a separate Vercel deployment).
    *   **Libraries:** `cheerio` (for fast, secure HTML parsing) or `puppeteer-core` (if JavaScript rendering is required).
    *   *Security Note:* We will avoid executing any third-party scripts from the scraped sites. We only extract text nodes.
*   **Job Scheduler:** Supabase pg_cron or GitHub Actions (to trigger the scraping functions).

## 3. Security & Vulnerability Management
To ensure no components have security vulnerabilities:
1.  **Dependency Scanning:** We will use `npm audit` and the **Snyk** CLI tool (available in this environment) to scan both the frontend and backend `package.json` files before any code is committed.
2.  **Strict Versioning:** All dependencies in `package.json` will be pinned to specific patch versions (no `^` or `~`) after verifying they are secure, preventing accidental upgrades to compromised versions.
3.  **Row Level Security (RLS):** In Supabase, the database will be locked down. The mobile app will only have READ access to the `prices` and `historical_prices` tables. Write access will be strictly restricted to the authenticated scraping engine.
4.  **API Security:** The provider management API (to add/amend scraping targets) will be secured behind administrative authentication.

## 4. Component Compatibility Matrix
*   **Node.js:** v25.x (Local dev) / Node 20.x LTS (Supabase/Vercel runtime).
*   **Expo SDK:** Latest stable. Matches perfectly with React 18.x and React Native 0.74+.
*   **Supabase JS Client:** `@supabase/supabase-js` v2.x (Compatible with React Native/Expo).
