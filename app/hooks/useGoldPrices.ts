import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * Interface representing a gold price record from the database.
 */
export interface GoldPrice {
  id: number;
  karat: number;
  price: number;
  currency: string;
  scraped_at: string;
  provider: {
    name: string;
  };
}

/**
 * React Query hook to fetch the most recent gold prices for all providers.
 * 
 * Fetches data from the `gold_prices` table in descending order of `scraped_at`.
 * The data includes related provider names using a foreign key relationship.
 * 
 * @returns {Object} - React Query result containing an array of latest GoldPrice objects.
 */
export function useLatestPrices() {
  return useQuery({
    queryKey: ['latest-prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gold_prices')
        .select(`
          id,
          karat,
          price,
          currency,
          scraped_at,
          provider:providers!inner(name, is_active)
        `)
        .eq('provider.is_active', true)
        .order('scraped_at', { ascending: false });

      if (error) throw error;

      // Group by provider and take the latest for each karat
      // For this app, we'll just return the raw data and let the component handle display
      return data as unknown as GoldPrice[];
    },
  });
}

/**
 * React Query hook to fetch historical gold price data for a specific karat.
 * 
 * Aggregates results by day, taking the average price for each day to provide 
 * a cleaner trend for charts.
 * 
 * @param {number} karat - The gold karat to fetch history for (default is 24).
 * @returns {Object} - React Query result containing an array of daily price averages.
 */
export function useHistoricalPrices(karat: number = 24) {
  return useQuery({
    queryKey: ['historical-prices', karat],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gold_prices')
        .select('price, scraped_at')
        .eq('karat', karat)
        .order('scraped_at', { ascending: true });

      if (error) throw error;

      // Group by date and take average to keep chart clean
      const dailyMap: Record<string, { total: number; count: number; timestamp: number }> = {};
      
      data.forEach(item => {
          const date = item.scraped_at.split('T')[0];
          if (!dailyMap[date]) {
              dailyMap[date] = { total: 0, count: 0, timestamp: new Date(item.scraped_at).getTime() };
          }
          dailyMap[date].total += item.price;
          dailyMap[date].count += 1;
      });

      return Object.values(dailyMap).map(day => ({
          value: day.total / day.count,
          timestamp: day.timestamp
      }));
    },
  });
}
