# API & Data Schema

This document covers the Supabase database schema and the data access patterns used in the project.

---

## 🗄️ Database Schema

The database is hosted on **Supabase** (PostgreSQL). Below is an overview of the primary tables and their relationships.

### 1. `providers` Table
This table stores information about the gold price vendors.
| Column | Type | Description |
|---|---|---|
| `id` | `int8` | Primary key. |
| `name` | `text` | Name of the provider (e.g., Al Fardan Exchange). |
| `url` | `text` | The website URL used for scraping. |
| `is_active` | `boolean` | Flag to enable/disable scraping for this provider. |
| `last_scraped_at` | `timestamptz` | Updated automatically after a successful scrape. |

### 2. `gold_prices` Table
This table stores historical gold price records.
| Column | Type | Description |
|---|---|---|
| `id` | `int8` | Primary key. |
| `provider_id` | `int8` | Foreign key referencing the `providers` table. |
| `karat` | `int4` | The gold karat (e.g., 24, 22, 21, 18). |
| `price` | `numeric` | The price per gram in QAR. |
| `currency` | `text` | Always 'QAR'. |
| `scraped_at` | `timestamptz` | Timestamp of when the price was extracted. |

### 3. `price_alerts` Table
Used to store user push notification targets.
| Column | Type | Description |
|---|---|---|
| `id` | `int8` | Primary key. |
| `user_id` | `uuid` | The anonymous Supabase user ID. |
| `karat` | `int4` | Target karat for the alert. |
| `target_price` | `numeric` | Price threshold to trigger the alert. |
| `condition` | `text` | Trigger condition ('above' or 'below'). |
| `expo_push_token` | `text` | The unique Expo token for sending push notifications. |
| `is_active` | `boolean` | Set to false after the alert is triggered. |

---

## 🔒 Security & Access Control

### Row Level Security (RLS)
The database uses Supabase RLS policies to control access:
- **Anonymous Users:** Can **READ** all `providers` and `gold_prices`.
- **Authenticated Users:** Can **INSERT/READ/UPDATE** their own `price_alerts`.
- **Scraper (Service Role):** Has full access to write into `gold_prices` and read from `providers`.

### Authentication
The mobile app uses **Anonymous Authentication** (`signInAnonymously`) from Supabase. This allows users to create price alerts and persist their settings without needing a traditional login (email/password).

---

## 📡 Data Fetching (Mobile App)

The app uses **React Query** (`@tanstack/react-query`) to interact with the database efficiently.

### `useLatestPrices()`
- **Query Key:** `['latest-prices']`
- **Purpose:** Fetches the most recent price records for all active providers.
- **Join Logic:** Automatically performs a join with the `providers` table to include vendor names.

### `useHistoricalPrices(karat)`
- **Query Key:** `['historical-prices', karat]`
- **Purpose:** Fetches all historical price records for a given karat to populate trend charts.
- **Aggregation:** Data is grouped by date and averaged on the client-side for smoother chart visualization.
