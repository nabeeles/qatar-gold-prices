import React from 'react';
import { FlatList, View, Text, SafeAreaView, RefreshControl, ActivityIndicator } from 'react-native';
import { useLatestPrices } from '../../hooks/useGoldPrices';
import { PriceCard } from '../../components/PriceCard';
import { TrendingUp } from 'lucide-react-native';

export default function Dashboard() {
  const { data, isLoading, refetch, isRefetching } = useLatestPrices();

  // Deduplicate to show only the latest per provider/karat combo
  const latestData = React.useMemo(() => {
    if (!data) return [];
    const seen = new Set();
    return data.filter(item => {
      const key = `${item.provider.name}-${item.karat}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data]);

  const average24k = React.useMemo(() => {
    const p24 = latestData.filter(i => i.karat === 24);
    if (p24.length === 0) return 0;
    return (p24.reduce((acc, curr) => acc + curr.price, 0) / p24.length).toFixed(2);
  }, [latestData]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-8 pb-4">
        <Text className="text-muted text-xs uppercase tracking-[4px] mb-1 font-semibold">
          Market Overview
        </Text>
        <Text className="text-white text-4xl font-bold mb-6">Qatar Gold</Text>
        
        {/* Hero Average Card */}
        <View className="bg-primary rounded-3xl p-6 mb-8 flex-row justify-between items-center shadow-2xl shadow-primary/20">
          <View>
            <Text className="text-black/60 text-xs uppercase font-bold tracking-widest mb-1">
              Market Average (24K)
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-black text-4xl font-black">{average24k}</Text>
              <Text className="text-black text-sm font-bold ml-1">QAR</Text>
            </View>
          </View>
          <View className="bg-black/10 p-3 rounded-full">
            <TrendingUp size={32} color="rgba(0,0,0,0.5)" />
          </View>
        </View>

        <Text className="text-white text-lg font-bold mb-4">Retailer Rates</Text>
      </View>

      <FlatList
        data={latestData}
        renderItem={({ item }) => <PriceCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch} 
            tintColor="#D4AF37"
          />
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-muted italic">No price data available.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
