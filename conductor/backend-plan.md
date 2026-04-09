# Backend Implementation Plan: Qatar Gold Price App

## 1. Overview
The backend is a **Serverless Aggregator** that scrapes gold prices from multiple sources, stores them in a **Supabase (PostgreSQL)** database, and provides a highly secure API exclusively for the mobile application.

## 2. Security Architecture: App-Only Access
To fulfill the requirement that the backend is **only accessible through the app**, we will implement the following security layers:

1.  **No Public Access:** The database will not allow any unauthenticated public access. The `anon` role will be heavily restricted.
2.  **Anonymous Authentication:** When a user opens the mobile app, the app will silently authenticate using Supabase's **Anonymous Sign-ins** feature. This generates a unique JWT (JSON Web Token) for that specific app instance.
3.  **Row Level Security (RLS):** We will configure RLS policies that require a valid `authenticated` JWT (including anonymous users) to read the `gold_prices` table. Direct API requests without this app-generated token will be rejected.
4.  **CORS & API Keys:** We will restrict Cross-Origin Resource Sharing (CORS) to the specific domains/schemes used by the Expo app, and ensure the `anon` API key is only used in conjunction with the secure JWT.

## 3. Database Schema (PostgreSQL)

### Table: `providers`
Stores information about the gold price data sources.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `name` | `text` | Display name (e.g., 'Al Fardan Exchange') |
| `url` | `text` | The target scraping URL |
| `scraping_type` | `text` | 'direct' (Puppeteer) or 'aggregator' (Cheerio) |
| `selectors` | `jsonb` | JSON configuration for scraping |
| `is_active` | `boolean` | Whether to scrape this provider |
| `last_scraped_at`| `timestamptz`| Timestamp of the last successful scrape |

*Security:* `SELECT`, `INSERT`, `UPDATE`, `DELETE` allowed **only** for the `service_role` (the internal scraper). The app never reads this table directly.

### Table: `gold_prices`
Stores the actual price data.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `bigint` | Primary Key (Identity) |
| `provider_id` | `uuid` | Foreign Key to `providers(id)` |
| `karat` | `integer` | 24, 22, or 18 |
| `price` | `decimal` | The numeric price |
| `currency` | `text` | Default: 'QAR' |
| `scraped_at` | `timestamptz`| Default: `now()` |

*Security:*
*   **App Read Access:** `SELECT` allowed ONLY for `authenticated` users (enforced via App-generated Anonymous JWT).
*   **Restricted Write:** `INSERT`, `UPDATE`, `DELETE` allowed **only** for the `service_role` (the internal scraper).

## 4. Scraping Engine (Node.js)
Located in `/backend/scraper/`.

*   **Orchestrator (`index.js`):** Uses the Supabase `service_role` key to bypass RLS, fetch active providers, run the scrapers, and insert new prices.
*   **Strategies:** Utilizes `puppeteer` for complex sites and `cheerio` for the fallback aggregator.

## 5. Scheduling (GitHub Actions)
Located in `.github/workflows/scrape-prices.yml`.

*   **Frequency:** Every 1 hour (cron: `0 * * * *`).
*   **Environment Variables:**
    *   `SUPABASE_URL`: API URL.
    *   `SUPABASE_SERVICE_ROLE_KEY`: Secret key for administrative write access.
*   **Process:** Installs Node.js, installs dependencies, and executes the scraper script.

## 6. Implementation Steps
1.  [ ] **Step 1:** Initialize `backend/` directory.
2.  [ ] **Step 2:** Create the Supabase SQL schema with strict App-Only RLS policies.
3.  [ ] **Step 3:** Implement the Node.js Scraper engine (Al Fardan, Joyalukkas, GoodReturns).
4.  [ ] **Step 4:** Configure GitHub Actions for hourly automated scraping.
5.  [ ] **Step 5:** Create an API testing script to verify that requests without an App JWT are explicitly blocked.
