# Mobile App Design & Implementation Plan: Qatar Gold Price App

## 1. Design Vision: "The Gilded Standard"
The app will embody a "Premium & Professional" aesthetic, characterized by high-contrast luxury.

*   **Palette:**
    *   **Background:** Deep Obsidian (`#0A0A0A`)
    *   **Primary Accent:** Metallic Gold (`#D4AF37`)
    *   **Secondary Accent:** Soft Champagne (`#F1E5AC`)
    *   **Text:** Pure White (`#FFFFFF`) / Muted Silver (`#A0A0A0`)
*   **Typography:**
    *   **Headings:** Bold Sans-Serif (e.g., *Inter* or *Manrope*)
    *   **Prices:** Monospaced variant for stability and precision.
*   **Atmosphere:** Subtle gradients, soft drop shadows (elevated cards), and minimalist iconography.

## 2. Technical Stack
*   **Framework:** React Native via Expo (SDK 51+).
*   **Navigation:** Expo Router (File-based routing).
*   **State Management:** TanStack Query (React Query) for robust data fetching and caching.
*   **Database Client:** `@supabase/supabase-js`.
*   **Styling:** NativeWind (Tailwind for React Native) for rapid, consistent UI.
*   **Charts:** `react-native-wagmi-charts` (for high-performance, interactive SVG charts).
*   **Icons:** `lucide-react-native`.

## 3. App Architecture & Navigation
The app will use a tab-based navigation system:

*   **`app/(tabs)/index.tsx` (Dashboard):** 
    *   Featured "Live Price" gauge or hero card.
    *   List of retailers (Joyalukkas, Malabar, etc.) with current 24k/22k rates.
*   **`app/(tabs)/charts.tsx` (Market Trends):**
    *   Interactive historical line chart.
    *   Timeframe toggles (1W, 1M, 1Y).
*   **`app/(tabs)/calculator.tsx` (Gold Value):**
    *   Input for weight (grams).
    *   Selector for purity (24k, 22k, 18k).
    *   Real-time conversion based on the current average market price.
*   **`app/(tabs)/alerts.tsx` (Notifications):**
    *   Price threshold settings.
    *   Push notification configuration.

## 4. Implementation Phasing

### Phase 1: Foundation (Setup)
1.  Initialize Expo project with TypeScript template.
2.  Install dependencies (`supabase-js`, `nativewind`, `lucide`, `react-query`).
3.  Configure `supabaseClient.ts` with Anonymous Auth for the "App-Only" requirement.
4.  Define the Global Theme (Tailwind configuration).

### Phase 2: Core UI (Dashboard)
1.  Build the `PriceCard` component with luxury styling.
2.  Implement the Dashboard layout with pull-to-refresh functionality.
3.  Connect to the `gold_prices` table via Supabase.

### Phase 3: Analytics (Charts)
1.  Integrate the charting library.
2.  Create a Supabase view or RPC (Remote Procedure Call) to fetch historical averages efficiently.
3.  Build the interactive chart screen.

### Phase 4: Utilities & Polish (Calculator & Alerts)
1.  Build the Value Calculator logic.
2.  Implement Expo Push Notifications.
3.  Final UI/UX polish (transitions, loading states).

## 5. Security Check
*   Verify that `auth.signInAnonymously()` is called on app mount.
*   Ensure all data fetching uses the authenticated session.
*   Validate that the API keys are injected via environment variables (`.env`).

## 6. Visual Strategy for Placeholders
*   **Loading:** Shimmer effect (Skeleton screens) on the price cards to maintain the premium feel during data transit.
*   **Gradients:** Subtle top-to-bottom dark gradients to prevent a flat appearance.
